export type UserRole = "ADMIN" | "CLIENT";
export type TaxpayerType = "PARTICULIER" | "ENTREPRISE";
export type AccountStatus = "ACTIF" | "EN_ATTENTE" | "INACTIF" | "SUSPENDU";
export type StatutObligation =
  | "A_PAYER"
  | "PAIEMENT_EN_COURS"
  | "EN_VERIFICATION"
  | "PAYE"
  | "EN_RETARD"
  | "REJETE"
  | "CORRECTION_DEMANDEE";
export type PaymentStatus = "EN_VERIFICATION" | "CONFIRME" | "REJETE" | "CORRECTION_DEMANDEE";
export type PaymentMethod = "MOBILE_MONEY" | "VIREMENT_BANCAIRE";
export type NotificationType =
  "COMPTE" | "PAIEMENT" | "OBLIGATION" | "IMPORT" | "SECURITE" | "ADMINISTRATION";

export interface AppUser {
  id: string;
  nom: string;
  courriel: string;
  role: UserRole;
  contribuableId?: string;
  statut: AccountStatus;
  changementMotDePasseRequis: boolean;
  creeLe: string;
  derniereConnexion?: string;
}

export interface Taxpayer {
  id: string;
  utilisateurId?: string;
  type: TaxpayerType;
  nom: string;
  prenom?: string;
  raisonSociale?: string;
  nomCommercial?: string;
  nif: string;
  stat?: string;
  adresse: string;
  region: string;
  ville: string;
  courriel: string;
  telephone: string;
  representantLegal?: string;
  nomContact?: string;
  prenomContact?: string;
  fonctionContact?: string;
  dateCreationCompte: string;
  statut?: AccountStatus;
  creeLe: string;
}

export type TaxPeriodicity = "MENSUELLE" | "TRIMESTRIELLE" | "ANNUELLE" | "PONCTUELLE";
export interface TaxType {
  id: string;
  code: string;
  nom: string;
  description: string;
  categorie: string;
  contribuablesConcernes: "TOUS" | TaxpayerType;
  periodicite: TaxPeriodicity;
  regleEcheance: string;
  modeMontant: "FIXE" | "CALCULE" | "MANUEL";
  montantReference: number | null;
  champsComplementaires: string[];
  actif: boolean;
  creeLe: string;
  modifieLe: string;
}

export interface TaxObligation {
  id: string;
  contribuableId: string;
  typeImpotId: string;
  typeImpotNom: string;
  referenceFiscale: string;
  periode: string;
  montant: number;
  devise: "MGA";
  echeance: string;
  statut: StatutObligation;
  paiementId?: string;
  creeLe: string;
}

export interface PaymentHistoryStep {
  statut: PaymentStatus;
  libelle: string;
  date: string;
  acteur: string;
  motif?: string;
}

export interface Payment {
  id: string;
  referenceInterne: string;
  contribuableId: string;
  obligationId: string;
  typeImpotId: string;
  typeImpotNom: string;
  periode: string;
  montant: number;
  devise: "MGA";
  mode: PaymentMethod;
  operateur?: "MVOLA" | "ORANGE_MONEY" | "AIRTEL_MONEY";
  telephoneUtilise?: string;
  banqueOuCanal?: string;
  titulairePayeur?: string;
  referenceTransaction: string;
  dateTransaction: string;
  justificatifNom?: string;
  statut: PaymentStatus;
  soumisLe: string;
  valideLe?: string;
  validePar?: string;
  motifRejet?: string;
  historique: PaymentHistoryStep[];
}

export type PaymentDocumentType = "ACCUSE_DECLARATION" | "RECU_PAIEMENT";
export interface PaymentDocument {
  id: string;
  numero: string;
  type: PaymentDocumentType;
  statut: "VALIDE" | "ANNULE";
  paiementId: string;
  contribuableId: string;
  referencePaiement: string;
  typeImpotNom: string;
  periode: string;
  referenceTransactionDeclaree: string;
  modeDeclare: PaymentMethod;
  montant: number;
  devise: "MGA";
  emetteur: string;
  emisLe: string;
  emisPar?: string;
  mention: string;
}

export interface AppNotification {
  id: string;
  titre: string;
  message: string;
  type: NotificationType;
  date: string;
  lue: boolean;
  utilisateurId?: string;
  roleDestinataire?: UserRole;
  referenceEntite?: string;
  statutEmail: "NON_ENVOYE" | "ERREUR" | "ENVOYE" | "EN_ATTENTE";
}

export interface ActivityLogEntry {
  id: string;
  acteurId?: string;
  acteur: string;
  role: UserRole | "SYSTEME";
  action: string;
  ressource: string;
  referenceRessource: string;
  date: string;
  resultat: "SUCCES" | "ECHEC";
  details?: string;
}

export interface ImportErrorRow {
  ligne: number;
  champ?: string;
  message: string;
  donnees?: Record<string, unknown>;
}

export interface ImportHistoryEntry {
  id: string;
  nomFichier: string;
  date: string;
  analysees: number;
  creees: number;
  ignorees: number;
  doublons: number;
  erreurs: ImportErrorRow[];
  statut: "TERMINE" | "PARTIEL" | "ERREUR";
}

export interface AppSettings {
  institution: string;
  regions: string[];
}

export interface PlatformState {
  version: 1;
  administrateurInitialise: boolean;
  utilisateurs: AppUser[];
  contribuables: Taxpayer[];
  typesImpots: TaxType[];
  obligations: TaxObligation[];
  paiements: Payment[];
  documentsPaiement: PaymentDocument[];
  notifications: AppNotification[];
  journauxActivite: ActivityLogEntry[];
  parametres: AppSettings;
}

export interface RegistrationProfile {
  nom: string;
  prenom?: string;
  type: TaxpayerType;
  raisonSociale?: string;
  nomCommercial?: string;
  nif: string;
  stat?: string;
  adresse: string;
  region: string;
  ville: string;
  courriel: string;
  telephone: string;
  representantLegal?: string;
  nomContact?: string;
  prenomContact?: string;
  fonctionContact?: string;
}

export interface PaymentFilters {
  recherche?: string;
  statut?: PaymentStatus | "TOUS";
  typeImpotId?: string;
  mode?: PaymentMethod | "TOUS";
  debut?: string;
  fin?: string;
}
