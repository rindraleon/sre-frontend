import type { ApiErrorCategory } from "@/types/api";

/** Erreur HTTP/API présentable au client, sans détails techniques ou pile d'exécution. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly statutHttp?: number,
    readonly erreurs?: Record<string, string[]>,
    readonly categorie: ApiErrorCategory = "http",
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function extractApiMessage(contenu: unknown): string | undefined {
  if (typeof contenu === "string" && contenu.trim()) return contenu.trim();
  if (!contenu || typeof contenu !== "object") return undefined;

  const reponse = contenu as { message?: unknown; error?: unknown };
  if (Array.isArray(reponse.message)) {
    const messages = reponse.message.filter(
      (element): element is string => typeof element === "string" && element.trim().length > 0,
    );
    return messages.length ? messages.join(" ") : undefined;
  }
  if (typeof reponse.message === "string" && reponse.message.trim()) {
    return reponse.message.trim();
  }
  if (typeof reponse.error === "string" && reponse.error.trim()) {
    return reponse.error.trim();
  }
  return undefined;
}

function extractFieldErrors(contenu: unknown): Record<string, string[]> | undefined {
  if (!contenu || typeof contenu !== "object") return undefined;
  const erreurs = (contenu as { errors?: unknown }).errors;
  if (!erreurs || typeof erreurs !== "object" || Array.isArray(erreurs)) return undefined;

  const resultat = Object.fromEntries(
    Object.entries(erreurs as Record<string, unknown>)
      .map(([champ, messages]) => [
        champ,
        Array.isArray(messages)
          ? messages.filter(
              (element): element is string => typeof element === "string" && element.trim().length > 0,
            )
          : [],
      ])
      .filter(([, messages]) => (messages as string[]).length > 0),
  ) as Record<string, string[]>;

  return Object.keys(resultat).length ? resultat : undefined;
}

/** Convertit la réponse HTTP en message utilisateur selon le contrat existant du backend. */
export function createHttpApiError(statut: number, contenu: unknown): ApiError {
  if (statut === 401) {
    return new ApiError("Votre session a expiré ou n'est plus valide. Reconnectez-vous.", statut);
  }
  if (statut === 403) {
    return new ApiError("Vous n'avez pas l'autorisation d'effectuer cette action.", statut);
  }
  if (statut === 404) {
    return new ApiError("Cette ressource n'est pas disponible ou n'existe plus.", statut);
  }
  if (statut === 413) {
    return new ApiError("Le contenu transmis est trop volumineux. Réduisez-le puis réessayez.", statut);
  }
  if (statut === 429) {
    return new ApiError("Trop de requêtes ont été envoyées. Patientez un instant puis réessayez.", statut);
  }
  if (statut >= 500) {
    return new ApiError("Le serveur SRE rencontre une erreur. Réessayez dans quelques instants.", statut);
  }

  const messageServeur = extractApiMessage(contenu);
  const message =
    messageServeur ??
    (statut === 409
      ? "Cette opération est en conflit avec l'état actuel des données. Actualisez puis réessayez."
      : "Les données transmises ne sont pas valides. Vérifiez les champs puis réessayez.");
  return new ApiError(message, statut, extractFieldErrors(contenu));
}

export function createTransportApiError(
  cause: unknown,
  requeteMutative: boolean,
  delaiDepasse: boolean,
): ApiError {
  if (delaiDepasse || (cause instanceof Error && cause.name === "AbortError")) {
    return new ApiError(
      requeteMutative
        ? "Le serveur n'a pas répondu dans le délai prévu. Votre demande peut avoir été reçue : actualisez les données avant de la soumettre à nouveau."
        : "Le serveur SRE n'a pas répondu dans le délai prévu. Réessayez.",
      undefined,
      undefined,
      "timeout",
    );
  }

  return new ApiError(
    requeteMutative
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
