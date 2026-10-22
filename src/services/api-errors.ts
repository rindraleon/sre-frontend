import type { ApiErrorCategory } from "@/types/api";

/** HTTP/API error presentable to the client, without technical details or stack trace. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly httpStatus?: number,
    readonly errors?: Record<string, string[]>,
    readonly category: ApiErrorCategory = "http",
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function extractApiMessage(content: unknown): string | undefined {
  if (typeof content === "string" && content.trim()) return content.trim();
  if (!content || typeof content !== "object") return undefined;

  const response = content as { message?: unknown; error?: unknown };
  if (Array.isArray(response.message)) {
    const messages = response.message.filter(
      (element): element is string => typeof element === "string" && element.trim().length > 0,
    );
    return messages.length ? messages.join(" ") : undefined;
  }
  if (typeof response.message === "string" && response.message.trim()) {
    return response.message.trim();
  }
  if (typeof response.error === "string" && response.error.trim()) {
    return response.error.trim();
  }
  return undefined;
}

function extractFieldErrors(content: unknown): Record<string, string[]> | undefined {
  if (!content || typeof content !== "object") return undefined;
  const errors = (content as { errors?: unknown }).errors;
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) return undefined;

  const result = Object.fromEntries(
    Object.entries(errors as Record<string, unknown>)
      .map(([field, messages]) => [
        field,
        Array.isArray(messages)
          ? messages.filter(
              (element): element is string => typeof element === "string" && element.trim().length > 0,
            )
          : [],
      ])
      .filter(([, messages]) => (messages as string[]).length > 0),
  ) as Record<string, string[]>;

  return Object.keys(result).length ? result : undefined;
}

/** Converts the HTTP response into a user message according to the backend's existing contract. */
export function createHttpApiError(status: number, content: unknown): ApiError {
  if (status === 401) {
    return new ApiError("Votre session a expiré ou n'est plus valide. Reconnectez-vous.", status);
  }
  if (status === 403) {
    return new ApiError("Vous n'avez pas l'autorisation d'effectuer cette action.", status);
  }
  if (status === 404) {
    return new ApiError("Cette ressource n'est pas disponible ou n'existe plus.", status);
  }
  if (status === 413) {
    return new ApiError("Le contenu transmis est trop volumineux. Réduisez-le puis réessayez.", status);
  }
  if (status === 429) {
    return new ApiError("Trop de requêtes ont été envoyées. Patientez un instant puis réessayez.", status);
  }
  if (status >= 500) {
    return new ApiError("Le serveur SRE rencontre une erreur. Réessayez dans quelques instants.", status);
  }

  const serverMessage = extractApiMessage(content);
  const message =
    serverMessage ??
    (status === 409
      ? "Cette opération est en conflit avec l'état actuel des données. Actualisez puis réessayez."
      : "Les données transmises ne sont pas valides. Vérifiez les champs puis réessayez.");
  return new ApiError(message, status, extractFieldErrors(content));
}

export function createTransportApiError(
  cause: unknown,
  isMutatingRequest: boolean,
  isTimedOut: boolean,
): ApiError {
  if (isTimedOut || (cause instanceof Error && cause.name === "AbortError")) {
    return new ApiError(
      isMutatingRequest
        ? "Le serveur n'a pas répondu dans le délai prévu. Votre demande peut avoir été reçue : actualisez les données avant de la soumettre à nouveau."
        : "Le serveur SRE n'a pas répondu dans le délai prévu. Réessayez.",
      undefined,
      undefined,
      "timeout",
    );
  }

  return new ApiError(
    isMutatingRequest
      ? "La connexion au serveur a été interrompue. Vérifiez l'état de la demande avant de la renvoyer."
      : "Impossible de joindre le serveur SRE. Vérifiez votre connexion puis réessayez.",
    undefined,
    undefined,
    "network",
  );
}

export function createApiConfigurationError(): ApiError {
  return new ApiError(
    "Le service SRE n'est pas configuré. Les données du serveur ne sont pas disponibles.",
    undefined,
    undefined,
    "configuration",
  );
}
