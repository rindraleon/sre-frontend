import type { AccountStatus, UserRole } from "../user";
import type { TaxpayerType } from "../taxpayer";
import type { TaxType } from "../tax";
import type { StatusObligation } from "../obligation";
import type {
  Payment,
  PaymentDocument,
  PaymentMethod,
  PaymentStatus,
} from "../payment";

export interface ApiUser {
  id: string;
  nom: string;
  courriel: string;
  role: UserRole;
  statut: AccountStatus;
  changementMotDePasseRequis: boolean;
  profilComplete?: boolean;
  courrielVerifie?: boolean;
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
  periodicite: TaxType["periodicity"];
  regleEcheance: string;
  modeMontant: TaxType["amountMode"];
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
  statut: StatusObligation;
  creeLe: string;
}

export interface ApiNotification {
  id: string;
  typeRappel: string;
  titre: string;
  message: string;
  lien: string | null;
  lue: boolean;
  statutCourriel: "NON_CONFIGURE" | "EN_ATTENTE" | "ENVOYE" | "DELIVRE" | "ECHEC";
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

export interface ApiPaymentHistoryStep {
  statut: PaymentStatus;
  libelle: string;
  date: string;
  acteur: string;
  motif?: string | null;
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
  operateur?: Payment["operator"] | null;
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
  historique: ApiPaymentHistoryStep[];
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

export interface ApiPaginatedResponse<T> {
  donnees: T[];
  total: number;
  page: number;
  parPage: number;
}
