import type {
  ActivityLogEntry,
  ContactEmailRetryType,
  ContactEmailStatus,
  ContactMessageEntry,
  ContactMessageSource,
  ContactMessageStatus,
  ContactMessagesResponse,
  ContactMessagesUnreadResponse,
  ContactReplyResponse,
  PlatformState,
  UserRole,
} from "@/types";
import type {
  ApiDocument,
  ApiNotification,
  ApiObligation,
  ApiPaginatedResponse,
  ApiPayment,
  ApiTaxpayer,
  ApiTaxType,
  ApiUser,
} from "@/types/api";
import {
  ApiError,
  createApiConfigurationError,
  createHttpApiError,
  createTransportApiError,
} from "./api-errors";

export { ApiError } from "./api-errors";
export type {
  ApiAuthResponse,
  ApiDocument,
  ApiNotification,
  ApiObligation,
  ApiPaginatedResponse,
  ApiPayment,
  ApiTaxpayer,
  ApiTaxType,
  ApiUser,
} from "@/types/api";

import {
  mapApiDocument,
  mapApiObligation,
  mapApiPayment,
  mapApiPaymentDocuments,
  mapApiTaxpayer,
  mapApiTaxType,
  mapApiNotification,
  mapApiUser,
} from "./api-mappers";

type ApiRequestOptions = { method?: string; token?: string; body?: unknown };
const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/+$/, "");
export const isApiConfigured = apiBaseUrl.length > 0;

const apiTimeoutMs = 20_000;

function apiUrl(path: string) {
  return `${apiBaseUrl}/${path.replace(/^\/+/, "")}`;
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => "");
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function executeApiRequest<T>(
  path: string,
  options: RequestInit,
  handleResponse: (response: Response) => Promise<T>,
): Promise<T> {
  if (!isApiConfigured) {
    throw createApiConfigurationError();
  }
  const abortController = new AbortController();
  const timeoutId = window.setTimeout(() => abortController.abort(), apiTimeoutMs);
  const isMutatingRequest = ["POST", "PUT", "PATCH", "DELETE"].includes(
    (options.method ?? "GET").toUpperCase(),
  );
  try {
    const response = await fetch(apiUrl(path), { ...options, signal: abortController.signal });
    if (response.status === 401 && new Headers(options.headers).has("Authorization")) {
      window.dispatchEvent(new Event("sre:session-invalidated"));
    }
    return await handleResponse(response);
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    throw createTransportApiError(
      cause,
      isMutatingRequest,
      abortController.signal.aborted || (cause instanceof Error && cause.name === "AbortError"),
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function callApi<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  return executeApiRequest(
    path,
    {
      method: options.method ?? "GET",
      headers: headers,
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    },
    async (response) => {
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
    },
  );
}

export async function downloadPdfApi(documentId: string, token: string, number: string) {
  const blob = await executeApiRequest(
    `documents/${encodeURIComponent(documentId)}/pdf`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/pdf" },
    },
    async (response) => {
      if (!response.ok) throw createHttpApiError(response.status, await readResponseBody(response));
      const content = await response.blob();
      if (!content.size || (content.type && !content.type.includes("pdf"))) {
        throw new ApiError("Le serveur n'a pas renvoyé un PDF valide.", response.status);
      }
      return content;
    },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${number.replace(/[^A-Za-z0-9._-]/g, "_")}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function getRegistrationStateApi() {
  return callApi<{ administrateurInitialise: boolean }>("auth/etat-inscription");
}

/** Audit log fed by the backend (global interceptor). */
export async function loadActivityLogApi(
  token: string,
  perPage = 200,
): Promise<ActivityLogEntry[]> {
  return callApi<ActivityLogEntry[]>(`admin/journal-activite?parPage=${perPage}`, {
    token: token,
  });
}

export const CONTACT_MESSAGES_UPDATED_EVENT = "sre:contact-messages-updated";

export function notifyContactMessagesUpdated(unread?: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(CONTACT_MESSAGES_UPDATED_EVENT, {
      detail: { unread },
    }),
  );
}

/** Lightweight counter for unread contact messages in the administrator topbar. */
export async function loadContactMessagesUnreadCountApi(
  token: string,
): Promise<ContactMessagesUnreadResponse> {
  return callApi<ContactMessagesUnreadResponse>(
    "admin/messages-contact/non-lus",
    { token },
  );
}

/** Messages received through the public contact form or client workspace. */
export async function loadContactMessagesApi(
  token: string,
  options: {
    nonLus?: boolean;
    statut?: ContactMessageStatus | "TOUS";
    statutCourriel?: ContactEmailStatus | "TOUS";
    source?: ContactMessageSource | "TOUS";
    recherche?: string;
    tri?: "non_lus" | "date_desc" | "date_asc" | "statut" | "expediteur";
    limite?: number;
  } = {},
): Promise<ContactMessagesResponse> {
  const params = new URLSearchParams();
  if (options.nonLus) params.set("nonLus", "true");
  if (options.statut && options.statut !== "TOUS") {
    params.set("statut", options.statut);
  }
  if (options.statutCourriel && options.statutCourriel !== "TOUS") {
    params.set("statutCourriel", options.statutCourriel);
  }
  if (options.source && options.source !== "TOUS") {
    params.set("source", options.source);
  }
  if (options.recherche?.trim()) {
    params.set("recherche", options.recherche.trim());
  }
  if (options.tri) {
    params.set("tri", options.tri);
  }
  if (options.limite) params.set("limite", String(options.limite));
  const query = params.toString();
  const response = await callApi<ContactMessagesResponse>(
    `admin/messages-contact${query ? `?${query}` : ""}`,
    { token: token },
  );
  notifyContactMessagesUpdated(response.unread);
  return response;
}

/** Ouvre un message de contact et le marque comme lu côté serveur. */
export async function getContactMessageDetailApi(
  token: string,
  id: string,
  doNotMarkRead = false,
): Promise<ContactMessageEntry> {
  const query = doNotMarkRead ? "?nePasMarquerLu=true" : "";
  const entry = await callApi<ContactMessageEntry>(
    `admin/messages-contact/${encodeURIComponent(id)}${query}`,
    { token },
  );
  notifyContactMessagesUpdated();
  return entry;
}

/** Met à jour le statut d'un message de contact (NON_LU, LU, EN_ATTENTE_REPONSE, REPONDU). */
export async function updateContactMessageStatusApi(
  token: string,
  id: string,
  statut: ContactMessageStatus,
): Promise<ContactMessageEntry> {
  const res = await callApi<ContactMessageEntry>(
    `admin/messages-contact/${encodeURIComponent(id)}/statut`,
    {
      token,
      method: "PATCH",
      body: { statut },
    },
  );
  notifyContactMessagesUpdated();
  return res;
}

/** Envoie une réponse directe par e-mail depuis l'administration à l'expéditeur. */
export async function replyContactMessageApi(
  token: string,
  id: string,
  payload: { sujet?: string; message: string },
): Promise<ContactReplyResponse> {
  const res = await callApi<ContactReplyResponse>(
    `admin/messages-contact/${encodeURIComponent(id)}/repondre`,
    {
      token,
      method: "POST",
      body: payload,
    },
  );
  notifyContactMessagesUpdated();
  return res;
}

/** Relance les e-mails en échec associés à un message de contact. */
export async function retryContactMessageEmailsApi(
  token: string,
  id: string,
  type: ContactEmailRetryType = "TOUS",
): Promise<{
  message: ContactMessageEntry;
  relances: Record<string, string | null | undefined>;
}> {
  return callApi(`admin/messages-contact/${encodeURIComponent(id)}/renvoyer-courriel`, {
    token,
    method: "POST",
    body: { type },
  });
}

async function loadAllApiPages<T>(path: string, token: string): Promise<T[]> {
  const pageSize = 100;
  const firstPage = await callApi<ApiPaginatedResponse<T>>(
    `${path}?page=1&parPage=${pageSize}`,
    { token: token },
  );
  const pageCount = Math.ceil(
    firstPage.total / Math.max(1, firstPage.parPage || pageSize),
  );
  let additionalPages = Promise.resolve<T[][]>([]);
  for (let start = 2; start <= pageCount; start += 4) {
    const numbers = Array.from(
      { length: Math.min(4, pageCount - start + 1) },
      (_, index) => start + index,
    );
    additionalPages = additionalPages.then(async (pages) => {
      const batchResults = await Promise.all(
        numbers.map((number) =>
          callApi<ApiPaginatedResponse<T>>(`${path}?page=${number}&parPage=${pageSize}`, {
            token: token,
          }),
        ),
      );
      return [...pages, ...batchResults.map((page) => page.donnees)];
    });
  }
  return [...firstPage.donnees, ...(await additionalPages).flat()];
}

export async function loadApiState(
  token: string,
  role: UserRole,
  user: ApiUser,
): Promise<Partial<PlatformState>> {
  if (role === "CLIENT") {
    const [profile, types, obligations, payments, documents, notifications] = await Promise.all([
      callApi<ApiTaxpayer>("contribuables/moi", { token: token }),
      callApi<ApiTaxType[]>("types-impots", { token: token }),
      callApi<ApiObligation[]>("obligations/miennes", { token: token }),
      callApi<ApiPayment[]>("paiements/miennes", { token: token }),
      callApi<ApiDocument[]>("documents/miennes", { token: token }),
      callApi<ApiNotification[]>("notifications", { token: token }),
    ]);
    return {
      users: [mapApiUser(user)],
      taxpayers: [mapApiTaxpayer(profile, user.id)],
      taxTypes: types.map(mapApiTaxType),
      obligations: obligations.map(mapApiObligation),
      payments: payments.map(mapApiPayment),
      paymentDocuments: documents.map(mapApiDocument),
      notifications: notifications.map((notification) =>
        mapApiNotification(notification, user.id),
      ),
      isAdministratorInitialized: true,
    };
  }

  const [accounts, profiles, types, obligations, paymentData, notifications] = await Promise.all(
    [
      loadAllApiPages<ApiUser>("utilisateurs", token),
      loadAllApiPages<ApiTaxpayer>("contribuables", token),
      callApi<ApiTaxType[]>("types-impots/tous", { token: token }),
      callApi<ApiObligation[]>("obligations", { token: token }),
      loadAllApiPages<ApiPayment>("paiements", token),
      callApi<ApiNotification[]>("notifications", { token: token }),
    ],
  );
  const payments = paymentData.map(mapApiPayment);
  const documentsByPayment = paymentData.flatMap((payment) =>
    mapApiPaymentDocuments(payment),
  );
  const userIdByTaxpayerId = new Map(accounts.map((account) => [account.contribuableId, account.id]));
  return {
    users: accounts.map(mapApiUser),
    taxpayers: profiles.map((profile) =>
      mapApiTaxpayer(profile, profile.utilisateurId ?? userIdByTaxpayerId.get(profile.id)),
    ),
    taxTypes: types.map(mapApiTaxType),
    obligations: obligations.map(mapApiObligation),
    payments,
    paymentDocuments: documentsByPayment,
    notifications: notifications.map((notification) =>
      mapApiNotification(notification, user.id),
    ),
    isAdministratorInitialized: accounts.some((account) => account.role === "ADMIN"),
  };
}
export * from "./api-mappers";
