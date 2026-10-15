import type { PlatformState, UserRole } from "@/types";
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
const adresseApi = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/+$/, "");
export const isApiConfigured = adresseApi.length > 0;

const delaiApiMs = 20_000;

function urlApi(chemin: string) {
  return `${adresseApi}/${chemin.replace(/^\/+/, "")}`;
}

async function lireCorpsReponse(reponse: Response): Promise<unknown> {
  const texte = await reponse.text().catch(() => "");
  if (!texte.trim()) return null;
  try {
    return JSON.parse(texte) as unknown;
  } catch {
    return texte;
  }
}

async function executerRequeteApi<T>(
  chemin: string,
  options: RequestInit,
  traiter: (reponse: Response) => Promise<T>,
): Promise<T> {
  if (!isApiConfigured) {
    throw createApiConfigurationError();
  }
  const controleur = new AbortController();
  const temporisateur = window.setTimeout(() => controleur.abort(), delaiApiMs);
  const requeteMutative = ["POST", "PUT", "PATCH", "DELETE"].includes(
    (options.method ?? "GET").toUpperCase(),
  );
  try {
    const reponse = await fetch(urlApi(chemin), { ...options, signal: controleur.signal });
    if (reponse.status === 401 && new Headers(options.headers).has("Authorization")) {
      window.dispatchEvent(new Event("sre:session-invalidee"));
    }
    return await traiter(reponse);
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    throw createTransportApiError(
      cause,
      requeteMutative,
      controleur.signal.aborted || (cause instanceof Error && cause.name === "AbortError"),
    );
  } finally {
    window.clearTimeout(temporisateur);
  }
}

export async function callApi<T>(chemin: string, options: ApiRequestOptions = {}): Promise<T> {
  const enTetes: Record<string, string> = { Accept: "application/json" };
  if (options.token) enTetes.Authorization = `Bearer ${options.token}`;
  if (options.body !== undefined) enTetes["Content-Type"] = "application/json";
  return executerRequeteApi(
    chemin,
    {
      method: options.method ?? "GET",
      headers: enTetes,
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    },
    async (reponse) => {
      const contenu = await lireCorpsReponse(reponse);
      if (!reponse.ok) throw createHttpApiError(reponse.status, contenu);
      if (reponse.status === 204 || contenu === null) return undefined as T;
      if (typeof contenu === "string") {
        throw new ApiError(
          "Le serveur a renvoyé une réponse dans un format inattendu.",
          reponse.status,
        );
      }
      return contenu as T;
    },
  );
}

export async function downloadPdfApi(idDocument: string, jeton: string, numero: string) {
  const blob = await executerRequeteApi(
    `documents/${encodeURIComponent(idDocument)}/pdf`,
    {
      headers: { Authorization: `Bearer ${jeton}`, Accept: "application/pdf" },
    },
    async (reponse) => {
      if (!reponse.ok) throw createHttpApiError(reponse.status, await lireCorpsReponse(reponse));
      const contenu = await reponse.blob();
      if (!contenu.size || (contenu.type && !contenu.type.includes("pdf"))) {
        throw new ApiError("Le serveur n'a pas renvoyé un PDF valide.", reponse.status);
      }
      return contenu;
    },
  );
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = `${numero.replace(/[^A-Za-z0-9._-]/g, "_")}.pdf`;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function getRegistrationStateApi() {
  return callApi<{ administrateurInitialise: boolean }>("auth/etat-inscription");
}

async function loadAllApiPages<T>(chemin: string, jeton: string): Promise<T[]> {
  const taillePage = 100;
  const premierePage = await callApi<ApiPaginatedResponse<T>>(
    `${chemin}?page=1&parPage=${taillePage}`,
    { token: jeton },
  );
  const nombrePages = Math.ceil(
    premierePage.total / Math.max(1, premierePage.parPage || taillePage),
  );
  const pagesSupplementaires: T[][] = [];
  for (let debut = 2; debut <= nombrePages; debut += 4) {
    const numeros = Array.from(
      { length: Math.min(4, nombrePages - debut + 1) },
      (_, index) => debut + index,
    );
    const resultatLot = await Promise.all(
      numeros.map((numero) =>
        callApi<ApiPaginatedResponse<T>>(`${chemin}?page=${numero}&parPage=${taillePage}`, {
          token: jeton,
        }),
      ),
    );
    pagesSupplementaires.push(...resultatLot.map((page) => page.donnees));
  }
  return [...premierePage.donnees, ...pagesSupplementaires.flat()];
}

export async function loadApiState(
  jeton: string,
  role: UserRole,
  utilisateur: ApiUser,
): Promise<Partial<PlatformState>> {
  if (role === "CLIENT") {
    const [profil, types, obligations, paiements, documents, notifications] = await Promise.all([
      callApi<ApiTaxpayer>("contribuables/moi", { token: jeton }),
      callApi<ApiTaxType[]>("types-impots", { token: jeton }),
      callApi<ApiObligation[]>("obligations/miennes", { token: jeton }),
      callApi<ApiPayment[]>("paiements/miennes", { token: jeton }),
      callApi<ApiDocument[]>("documents/miennes", { token: jeton }),
      callApi<ApiNotification[]>("notifications", { token: jeton }),
    ]);
    return {
      utilisateurs: [mapApiUser(utilisateur)],
      contribuables: [mapApiTaxpayer(profil, utilisateur.id)],
      typesImpots: types.map(mapApiTaxType),
      obligations: obligations.map(mapApiObligation),
      paiements: paiements.map(mapApiPayment),
      documentsPaiement: documents.map(mapApiDocument),
      notifications: notifications.map((notification) =>
        mapApiNotification(notification, utilisateur.id),
      ),
      administrateurInitialise: true,
    };
  }

  const [comptes, profils, types, obligations, donneesPaiements, notifications] = await Promise.all(
    [
      loadAllApiPages<ApiUser>("utilisateurs", jeton),
      loadAllApiPages<ApiTaxpayer>("contribuables", jeton),
      callApi<ApiTaxType[]>("types-impots/tous", { token: jeton }),
      callApi<ApiObligation[]>("obligations", { token: jeton }),
      loadAllApiPages<ApiPayment>("paiements", jeton),
      callApi<ApiNotification[]>("notifications", { token: jeton }),
    ],
  );
  const paiements = donneesPaiements.map(mapApiPayment);
  const documentsParPaiement = donneesPaiements.flatMap((paiement) =>
    mapApiPaymentDocuments(paiement),
  );
  const correspondances = new Map(comptes.map((compte) => [compte.contribuableId, compte.id]));
  return {
    utilisateurs: comptes.map(mapApiUser),
    contribuables: profils.map((profil) =>
      mapApiTaxpayer(profil, profil.utilisateurId ?? correspondances.get(profil.id)),
    ),
    typesImpots: types.map(mapApiTaxType),
    obligations: obligations.map(mapApiObligation),
    paiements,
    documentsPaiement: documentsParPaiement,
    notifications: notifications.map((notification) =>
      mapApiNotification(notification, utilisateur.id),
    ),
    administrateurInitialise: comptes.some((compte) => compte.role === "ADMIN"),
  };
}
export * from "./api-mappers";
