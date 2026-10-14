import type {
  ContribuableSre,
  DocumentPaiementSre,
  EtatPlateformeSre,
  ModePaiementSre,
  ObligationFiscaleSre,
  PaiementSre,
  RoleSre,
  StatutCompteSre,
  StatutObligation,
  StatutPaiementSre,
  TypeContribuable,
  TypeImpotSre,
  UtilisateurSre,
} from "@/types/sre";

type CorpsRequeteApi = { method?: string; token?: string; body?: unknown };
const adresseApi = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/+$/, "");
export const apiSreConfiguree = adresseApi.length > 0;

export interface UtilisateurApiSre {
  id: string;
  nom: string;
  courriel: string;
  role: RoleSre;
  statut: StatutCompteSre;
  changementMotDePasseRequis: boolean;
  creeLe: string;
  derniereConnexion?: string | null;
  contribuableId?: string;
}

export interface ReponseAuthentificationApiSre {
  accessToken: string;
  tokenType: "Bearer";
  utilisateur: UtilisateurApiSre;
}

export interface ContribuableApiSre {
  id: string;
  utilisateurId?: string;
  type: TypeContribuable;
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
  statutCompte?: StatutCompteSre | null;
  creeLe: string;
}

export interface TypeImpotApiSre {
  id: string;
  code: string;
  nom: string;
  description: string;
  categorie: string;
  contribuablesConcernes: "TOUS" | TypeContribuable;
  periodicite: TypeImpotSre["periodicite"];
  regleEcheance: string;
  modeMontant: TypeImpotSre["modeMontant"];
  montantReference: string | number | null;
  champsComplementaires: string[];
  actif: boolean;
  creeLe: string;
  modifieLe: string;
}

export interface ObligationApiSre {
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
  statut: StatutPaiementSre;
  libelle: string;
  date: string;
  acteur: string;
  motif?: string | null;
}

export interface DocumentApiSre {
  id: string;
  numero: string;
  type: DocumentPaiementSre["type"];
  statut: "VALIDE" | "ANNULE";
  paiementId: string;
  contribuableId: string;
  referencePaiement: string;
  typeImpotNom: string;
  periode: string;
  referenceTransactionDeclaree: string;
  modeDeclare: ModePaiementSre;
  montant: number | string;
  devise: "MGA";
  emetteur: string;
  emisLe: string;
  emisPar?: string;
  mention: string;
}

export interface PaiementApiSre {
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
  mode: ModePaiementSre;
  operateur?: PaiementSre["operateur"] | null;
  telephoneUtilise?: string | null;
  banqueOuCanal?: string | null;
  titulairePayeur?: string | null;
  referenceTransaction: string;
  dateTransaction: string;
  justificatifNom?: string | null;
  statut: StatutPaiementSre;
  soumisLe: string;
  valideLe?: string | null;
  validePar?: string | null;
  motifRejet?: string | null;
  historique: HistoriqueApiSre[];
  documents?: Array<
    Pick<
      DocumentApiSre,
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

export class ErreurApiSre extends Error {
  constructor(
    message: string,
    readonly statutHttp?: number,
  ) {
    super(message);
    this.name = "ErreurApiSre";
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
    return new ErreurApiSre(
      "Trop de requêtes ont été envoyées. Patientez un instant puis réessayez.",
      statut,
    );
  if (statut >= 500)
    return new ErreurApiSre(
      `Le serveur SRE rencontre une erreur (HTTP ${statut}). Réessayez plus tard.`,
      statut,
    );
  const message = extraireMessageErreurApi(contenu);
  return new ErreurApiSre(message || `La requête a échoué (HTTP ${statut}).`, statut);
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
  if (!apiSreConfiguree) {
    throw new ErreurApiSre(
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
    if (cause instanceof ErreurApiSre) throw cause;
    if (controleur.signal.aborted || (cause instanceof Error && cause.name === "AbortError")) {
      throw new ErreurApiSre(
        `${conseilRelance}Le serveur SRE n'a pas répondu à temps. Vérifiez aussi que PostgreSQL est disponible.`.trim(),
      );
    }
    throw new ErreurApiSre(
      `${conseilRelance}Connexion à l'API SRE impossible (${adresseApi}). Vérifiez l'URL du serveur et les origines CORS.`.trim(),
    );
  } finally {
    window.clearTimeout(temporisateur);
  }
}

export async function appelerApiSre<T>(chemin: string, options: CorpsRequeteApi = {}): Promise<T> {
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
        throw new ErreurApiSre(
          "Le serveur a renvoyé une réponse dans un format inattendu.",
          reponse.status,
        );
      }
      return contenu as T;
    },
  );
}

export async function telechargerPdfApiSre(idDocument: string, jeton: string, numero: string) {
  const blob = await executerRequeteApi(
    `documents/${encodeURIComponent(idDocument)}/pdf`,
    {
      headers: { Authorization: `Bearer ${jeton}`, Accept: "application/pdf" },
    },
    async (reponse) => {
      if (!reponse.ok) throw creerErreurHttpApi(reponse.status, await lireCorpsReponse(reponse));
      const contenu = await reponse.blob();
      if (!contenu.size || (contenu.type && !contenu.type.includes("pdf"))) {
        throw new ErreurApiSre("Le serveur n'a pas renvoyé un PDF valide.", reponse.status);
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

export async function obtenirEtatInscriptionApiSre() {
  return appelerApiSre<{ administrateurInitialise: boolean }>("auth/etat-inscription");
}

interface ReponsePagineeApiSre<T> {
  donnees: T[];
  total: number;
  page: number;
  parPage: number;
}

async function chargerToutesLesPagesApiSre<T>(chemin: string, jeton: string): Promise<T[]> {
  const taillePage = 100;
  const premierePage = await appelerApiSre<ReponsePagineeApiSre<T>>(
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
        appelerApiSre<ReponsePagineeApiSre<T>>(`${chemin}?page=${numero}&parPage=${taillePage}`, {
          token: jeton,
        }),
      ),
    );
    pagesSupplementaires.push(...resultatLot.map((page) => page.donnees));
  }
  return [...premierePage.donnees, ...pagesSupplementaires.flat()];
}

export async function chargerEtatApiSre(
  jeton: string,
  role: RoleSre,
  utilisateur: UtilisateurApiSre,
): Promise<Partial<EtatPlateformeSre>> {
  if (role === "CLIENT") {
    const [profil, types, obligations, paiements, documents] = await Promise.all([
      appelerApiSre<ContribuableApiSre>("contribuables/moi", { token: jeton }),
      appelerApiSre<TypeImpotApiSre[]>("types-impots", { token: jeton }),
      appelerApiSre<ObligationApiSre[]>("obligations/miennes", { token: jeton }),
      appelerApiSre<PaiementApiSre[]>("paiements/miennes", { token: jeton }),
      appelerApiSre<DocumentApiSre[]>("documents/miennes", { token: jeton }),
    ]);
    return {
      utilisateurs: [mapperUtilisateur(utilisateur)],
      contribuables: [mapperContribuable(profil, utilisateur.id)],
      typesImpots: types.map(mapperTypeImpot),
      obligations: obligations.map(mapperObligation),
      paiements: paiements.map(mapperPaiementApiSre),
      documentsPaiement: documents.map(mapperDocumentApiSre),
      administrateurInitialise: true,
    };
  }

  const [comptes, profils, types, obligations, donneesPaiements] = await Promise.all([
    chargerToutesLesPagesApiSre<UtilisateurApiSre>("utilisateurs", jeton),
    chargerToutesLesPagesApiSre<ContribuableApiSre>("contribuables", jeton),
    appelerApiSre<TypeImpotApiSre[]>("types-impots/tous", { token: jeton }),
    appelerApiSre<ObligationApiSre[]>("obligations", { token: jeton }),
    chargerToutesLesPagesApiSre<PaiementApiSre>("paiements", jeton),
  ]);
  const paiements = donneesPaiements.map(mapperPaiementApiSre);
  const documentsParPaiement = donneesPaiements.flatMap((paiement) =>
    mapperDocumentsPaiementApiSre(paiement),
  );
  const correspondances = new Map(comptes.map((compte) => [compte.contribuableId, compte.id]));
  return {
    utilisateurs: comptes.map(mapperUtilisateur),
    contribuables: profils.map((profil) =>
      mapperContribuable(profil, profil.utilisateurId ?? correspondances.get(profil.id)),
    ),
    typesImpots: types.map(mapperTypeImpot),
    obligations: obligations.map(mapperObligation),
    paiements,
    documentsPaiement: documentsParPaiement,
    administrateurInitialise: comptes.some((compte) => compte.role === "ADMIN"),
  };
}

export function mapperUtilisateur(utilisateur: UtilisateurApiSre): UtilisateurSre {
  return {
    id: utilisateur.id,
    nom: utilisateur.nom,
    courriel: utilisateur.courriel,
    role: utilisateur.role,
    contribuableId: utilisateur.contribuableId,
    statut: utilisateur.statut,
    changementMotDePasseRequis: utilisateur.changementMotDePasseRequis,
    creeLe: utilisateur.creeLe,
    derniereConnexion: utilisateur.derniereConnexion ?? undefined,
  };
}

export function mapperContribuable(
  contribuable: ContribuableApiSre,
  utilisateurId?: string,
): ContribuableSre {
  return {
    id: contribuable.id,
    utilisateurId,
    type: contribuable.type,
    nom: contribuable.nom,
    prenom: contribuable.prenom ?? undefined,
    raisonSociale: contribuable.raisonSociale ?? undefined,
    nomCommercial: contribuable.nomCommercial ?? undefined,
    nif: contribuable.nif ?? "",
    stat: contribuable.stat ?? undefined,
    adresse: contribuable.adresse,
    region: contribuable.region,
    ville: contribuable.ville,
    courriel: contribuable.courriel,
    telephone: contribuable.telephone,
    representantLegal: contribuable.representantLegal ?? undefined,
    nomContact: contribuable.nomContact ?? undefined,
    prenomContact: contribuable.prenomContact ?? undefined,
    fonctionContact: contribuable.fonctionContact ?? undefined,
    dateCreationCompte: contribuable.dateCreationCompte,
    statut: contribuable.statutCompte ?? undefined,
    creeLe: contribuable.creeLe,
  };
}

export function mapperTypeImpot(type: TypeImpotApiSre): TypeImpotSre {
  return {
    id: type.id,
    code: type.code,
    nom: type.nom,
    description: type.description,
    categorie: type.categorie,
    contribuablesConcernes: type.contribuablesConcernes,
    periodicite: type.periodicite,
    regleEcheance: type.regleEcheance,
    modeMontant: type.modeMontant,
    montantReference: type.montantReference == null ? null : Number(type.montantReference),
    champsComplementaires: type.champsComplementaires ?? [],
    actif: type.actif,
    creeLe: type.creeLe,
    modifieLe: type.modifieLe,
  };
}

export function mapperObligation(obligation: ObligationApiSre): ObligationFiscaleSre {
  return {
    id: obligation.id,
    contribuableId: obligation.contribuableId,
    typeImpotId: obligation.typeImpotId,
    typeImpotNom: obligation.typeImpotNom,
    referenceFiscale: obligation.referenceFiscale,
    periode: obligation.periode,
    montant: Number(obligation.montant),
    devise: obligation.devise,
    echeance: obligation.echeance,
    statut: obligation.statut,
    creeLe: obligation.creeLe,
  };
}

export function mapperPaiementApiSre(paiement: PaiementApiSre): PaiementSre {
  return {
    id: paiement.id,
    referenceInterne: paiement.referenceInterne,
    contribuableId: paiement.contribuableId,
    obligationId: paiement.obligationId,
    typeImpotId: paiement.typeImpotId,
    typeImpotNom: paiement.typeImpotNom,
    periode: paiement.periode,
    montant: Number(paiement.montant),
    devise: paiement.devise,
    mode: paiement.mode,
    operateur: paiement.operateur ?? undefined,
    telephoneUtilise: paiement.telephoneUtilise ?? undefined,
    banqueOuCanal: paiement.banqueOuCanal ?? undefined,
    titulairePayeur: paiement.titulairePayeur ?? undefined,
    referenceTransaction: paiement.referenceTransaction,
    dateTransaction: paiement.dateTransaction,
    justificatifNom: paiement.justificatifNom ?? undefined,
    statut: paiement.statut,
    soumisLe: paiement.soumisLe,
    valideLe: paiement.valideLe ?? undefined,
    validePar: paiement.validePar ?? undefined,
    motifRejet: paiement.motifRejet ?? undefined,
    historique: paiement.historique.map((entree) => ({
      ...entree,
      motif: entree.motif ?? undefined,
    })),
  };
}

export function mapperDocumentApiSre(document: DocumentApiSre): DocumentPaiementSre {
  return {
    ...document,
    montant: Number(document.montant),
    statut: document.statut,
  };
}

export function mapperDocumentsPaiementApiSre(paiement: PaiementApiSre): DocumentPaiementSre[] {
  return (paiement.documents ?? []).map((document) => ({
    id: document.id,
    numero: document.numero,
    type: document.type,
    statut: document.statut,
    paiementId: paiement.id,
    contribuableId: paiement.contribuableId,
    referencePaiement: paiement.referenceInterne,
    typeImpotNom: paiement.typeImpotNom,
    periode: paiement.periode,
    referenceTransactionDeclaree: paiement.referenceTransaction,
    modeDeclare: paiement.mode,
    montant: Number(document.montant),
    devise: document.devise,
    emetteur: document.emetteur,
    emisLe: document.emisLe,
    emisPar: document.emisPar ?? undefined,
    mention: document.mention,
  }));
}
