import type {
  PaymentDocument,
  PlatformState,
  PaymentMethod,
  Payment,
  UserRole,
  AccountStatus,
  StatutObligation,
  PaymentStatus,
  TaxpayerType,
  TaxType,
} from "@/types/models";

type ApiRequestOptions = { method?: string; token?: string; body?: unknown };
const adresseApi = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/+$/, "");
export const isApiConfigured = adresseApi.length > 0;

export interface ApiUser {
  id: string;
  nom: string;
  courriel: string;
  role: UserRole;
  statut: AccountStatus;
  changementMotDePasseRequis: boolean;
  creeLe: string;
  derniereConnexion?: string | null;
  contribuableId?: string;
}

export interface ApiAuthResponse {
  accessToken: string;
  tokenType: "Bearer";
  utilisateur: ApiUser;
}

export interface ApiTaxpayer {
  id: string;
  utilisateurId?: string;
  type: TaxpayerType;
  nom: string;
  prenom?: string | null;
  raisonSociale?: string | null;
  nomCommercial?: string | null;
  nif?: string | null;
  stat?: string | null;
  adresse: string;
  region: string;
  ville: string;
  courriel: string;
  telephone: string;
  representantLegal?: string | null;
  nomContact?: string | null;
  prenomContact?: string | null;
  fonctionContact?: string | null;
  dateCreationCompte: string;
  statutCompte?: AccountStatus | null;
  creeLe: string;
}

export interface ApiTaxType {
  id: string;
  code: string;
  nom: string;
  description: string;
  categorie: string;
  contribuablesConcernes: "TOUS" | TaxpayerType;
  periodicite: TaxType["periodicite"];
  regleEcheance: string;
  modeMontant: TaxType["modeMontant"];
  montantReference: string | number | null;
  champsComplementaires: string[];
  actif: boolean;
  creeLe: string;
  modifieLe: string;
}

export interface ApiObligation {
  id: string;
  contribuableId: string;
  typeImpotId: string;
  typeImpotNom: string;
  referenceFiscale: string;
  periode: string;
  montant: number | string;
  devise: "MGA";
  echeance: string;
  statut: StatutObligation;
  creeLe: string;
}

interface HistoriqueApiSre {
  statut: PaymentStatus;
  libelle: string;
  date: string;
  acteur: string;
  motif?: string | null;
}

export interface ApiNotification {
  id: string;
  typeRappel: string;
  titre: string;
  message: string;
  lien: string | null;
  lue: boolean;
  statutCourriel: "NON_CONFIGURE" | "EN_ATTENTE" | "ENVOYE" | "ECHEC";
  cleIdempotence: string;
  creeLe: string;
  obligation?: { id: string } | null;
}

export interface ApiDocument {
  id: string;
  numero: string;
  type: PaymentDocument["type"];
  statut: "VALIDE" | "ANNULE";
  paiementId: string;
  contribuableId: string;
  referencePaiement: string;
  typeImpotNom: string;
  periode: string;
  referenceTransactionDeclaree: string;
  modeDeclare: PaymentMethod;
  montant: number | string;
  devise: "MGA";
  emetteur: string;
  emisLe: string;
  emisPar?: string;
  mention: string;
}

export interface ApiPayment {
  id: string;
  referenceInterne: string;
  contribuableId: string;
  obligationId: string;
  typeImpotId: string;
  typeImpotNom: string;
  referenceFiscale?: string;
  periode: string;
  montant: number | string;
  devise: "MGA";
  mode: PaymentMethod;
  operateur?: Payment["operateur"] | null;
  telephoneUtilise?: string | null;
  banqueOuCanal?: string | null;
  titulairePayeur?: string | null;
  referenceTransaction: string;
  dateTransaction: string;
  justificatifNom?: string | null;
  statut: PaymentStatus;
  soumisLe: string;
  valideLe?: string | null;
  validePar?: string | null;
  motifRejet?: string | null;
  historique: HistoriqueApiSre[];
  documents?: Array<
    Pick<
      ApiDocument,
      | "id"
      | "numero"
      | "type"
      | "emisLe"
      | "montant"
      | "devise"
      | "emetteur"
      | "mention"
      | "statut"
      | "emisPar"
    >
  >;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly statutHttp?: number,
    /** Erreurs de validation indexées par champ, renvoyées par l'API ({ errors: { courriel: [...] } }). */
    readonly erreurs?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const delaiApiMs = 20_000;

function urlApi(chemin: string) {
  return `${adresseApi}/${chemin.replace(/^\/+/, "")}`;
}

function extraireMessageErreurApi(contenu: unknown) {
  if (typeof contenu === "string" && contenu.trim()) return contenu.trim();
  if (!contenu || typeof contenu !== "object") return undefined;
  const reponse = contenu as { message?: unknown; error?: unknown };
  if (Array.isArray(reponse.message))
    return reponse.message
      .filter((element): element is string => typeof element === "string")
      .join(" ");
  if (typeof reponse.message === "string" && reponse.message.trim()) return reponse.message.trim();
  if (typeof reponse.error === "string" && reponse.error.trim()) return reponse.error.trim();
  return undefined;
}

function creerErreurHttpApi(statut: number, contenu: unknown) {
  if (statut === 429)
    return new ApiError(
      "Trop de requêtes ont été envoyées. Patientez un instant puis réessayez.",
      statut,
    );
  if (statut >= 500)
    return new ApiError(
      `Le serveur SRE rencontre une erreur (HTTP ${statut}). Réessayez plus tard.`,
      statut,
    );
  const message = extraireMessageErreurApi(contenu);
  return new ApiError(
    message || `La requête a échoué (HTTP ${statut}).`,
    statut,
    extraireErreursParChamp(contenu),
  );
}

function extraireErreursParChamp(contenu: unknown): Record<string, string[]> | undefined {
  if (!contenu || typeof contenu !== "object") return undefined;
  const erreurs = (contenu as { errors?: unknown }).errors;
  if (!erreurs || typeof erreurs !== "object" || Array.isArray(erreurs)) return undefined;
  const resultat: Record<string, string[]> = {};
  for (const [champ, messages] of Object.entries(erreurs as Record<string, unknown>)) {
    if (Array.isArray(messages))
      resultat[champ] = messages.filter(
        (element): element is string => typeof element === "string",
      );
  }
  return Object.keys(resultat).length ? resultat : undefined;
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
    throw new ApiError(
      "Le backend SRE n'est pas configuré. Définissez VITE_API_URL puis redémarrez Vite.",
    );
  }
  const controleur = new AbortController();
  const temporisateur = window.setTimeout(() => controleur.abort(), delaiApiMs);
  const requeteMutative = ["POST", "PUT", "PATCH", "DELETE"].includes(
    (options.method ?? "GET").toUpperCase(),
  );
  const conseilRelance = requeteMutative
    ? "La demande a peut-être été enregistrée; actualisez les données avant de la renvoyer. "
    : "";
  try {
    const reponse = await fetch(urlApi(chemin), { ...options, signal: controleur.signal });
    if (reponse.status === 401 && new Headers(options.headers).has("Authorization")) {
      window.dispatchEvent(new Event("sre:session-invalidee"));
    }
    return await traiter(reponse);
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    if (controleur.signal.aborted || (cause instanceof Error && cause.name === "AbortError")) {
      throw new ApiError(
        `${conseilRelance}Le serveur SRE n'a pas répondu à temps. Vérifiez aussi que PostgreSQL est disponible.`.trim(),
      );
    }
    throw new ApiError(
      `${conseilRelance}Connexion à l'API SRE impossible (${adresseApi}). Vérifiez l'URL du serveur et les origines CORS.`.trim(),
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
      if (!reponse.ok) throw creerErreurHttpApi(reponse.status, contenu);
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
      if (!reponse.ok) throw creerErreurHttpApi(reponse.status, await lireCorpsReponse(reponse));
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

interface ReponsePagineeApiSre<T> {
  donnees: T[];
  total: number;
  page: number;
  parPage: number;
}

async function loadAllApiPages<T>(chemin: string, jeton: string): Promise<T[]> {
  const taillePage = 100;
  const premierePage = await callApi<ReponsePagineeApiSre<T>>(
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
        callApi<ReponsePagineeApiSre<T>>(`${chemin}?page=${numero}&parPage=${taillePage}`, {
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

import {
  mapApiDocument,
  mapApiObligation,
  mapApiPayment,
  mapApiPaymentDocuments,
  mapApiTaxpayer,
  mapApiTaxType,
  mapApiNotification,
  mapApiUser,
} from "./apiMappers";
export * from "./apiMappers";
