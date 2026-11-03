import {
  ApiError,
  createApiConfigurationError,
  createHttpApiError,
  createTransportApiError,
} from "./api-errors";
import { API_TIMEOUT_MS, env, isApiConfigured } from "@/config";

const API_BASE_URL = env.apiBaseUrl;
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const SESSION_INVALIDATED_EVENT = "sre:session-invalidated";

export { isApiConfigured };

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: HttpMethod;
  token?: string;
  body?: unknown;
  query?: string;
  signal?: AbortSignal;
  accept?: string;
}

function apiUrl(path: string, query = ""): string {
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}${query}`;
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => "");
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch (cause) {
    console.warn("Réponse non JSON reçue du serveur.", cause);
    return text;
  }
}

async function executeRequest<T>(
  path: string,
  options: ApiRequestOptions,
  handleResponse: (response: Response) => Promise<T>,
): Promise<T> {
  if (!isApiConfigured) throw createApiConfigurationError();

  const abortController = new AbortController();
  const method = options.method ?? "GET";
  const isMutatingRequest = MUTATING_METHODS.has(method);
  const timeoutId = window.setTimeout(() => abortController.abort(), API_TIMEOUT_MS);
  const forwardAbort = () => abortController.abort();
  options.signal?.addEventListener("abort", forwardAbort);

  try {
    const response = await fetch(apiUrl(path, options.query), {
      method,
      headers: buildHeaders(options),
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
      signal: abortController.signal,
    });

    if (response.status === 401 && options.token) {
      window.dispatchEvent(new Event(SESSION_INVALIDATED_EVENT));
    }
    return await handleResponse(response);
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    const isTimedOut =
      abortController.signal.aborted || (cause instanceof Error && cause.name === "AbortError");
    throw createTransportApiError(cause, isMutatingRequest, isTimedOut);
  } finally {
    window.clearTimeout(timeoutId);
    options.signal?.removeEventListener("abort", forwardAbort);
  }
}

function buildHeaders(options: ApiRequestOptions): Record<string, string> {
  const headers: Record<string, string> = { Accept: options.accept ?? "application/json" };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  return headers;
}

export async function callApi<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  return executeRequest(path, options, async (response) => {
    const content = await readResponseBody(response);
    if (!response.ok) throw createHttpApiError(response.status, content);
    if (response.status === 204 || content === null) return undefined as T;
    if (typeof content === "string") {
      throw new ApiError(
        "Le serveur a renvoyé une réponse dans un format inattendu.",
        response.status,
      );
    }
    return content as T;
  });
}

export interface DownloadedFile {
  blob: Blob;
  filename: string | null;
}

export async function fetchFileApi(
  path: string,
  options: ApiRequestOptions & { expectedType?: "pdf" | "csv" },
): Promise<DownloadedFile> {
  return executeRequest(path, options, async (response) => {
    if (!response.ok) {
      throw createHttpApiError(response.status, await readResponseBody(response));
    }
    const blob = await response.blob();
    if (!blob.size) {
      throw new ApiError("Le serveur a renvoyé un fichier vide.", response.status);
    }
    if (options.expectedType === "pdf" && blob.type && !blob.type.includes("pdf")) {
      throw new ApiError("Le serveur n'a pas renvoyé un PDF valide.", response.status);
    }
    return { blob, filename: readFilename(response) };
  });
}

function readFilename(response: Response): string | null {
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  return match?.[1]?.trim() || null;
}

export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function sanitizeFilename(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, "_");
}
