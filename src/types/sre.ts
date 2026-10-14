export type RoleSre = "ADMIN" | "CLIENT";
export type TypeContribuable = "PARTICULIER" | "ENTREPRISE";
export type StatutCompteSre = "ACTIF" | "EN_ATTENTE" | "INACTIF" | "SUSPENDU";
export type StatutObligation =
  | "A_PAYER"
  | "PAIEMENT_EN_COURS"
  | "EN_VERIFICATION"
  | "PAYE"
  | "EN_RETARD"
  | "REJETE"
  | "CORRECTION_DEMANDEE";
export type StatutPaiementSre = "EN_VERIFICATION" | "CONFIRME" | "REJETE" | "CORRECTION_DEMANDEE";
export type ModePaiementSre = "MOBILE_MONEY" | "VIREMENT_BANCAIRE";
export type TypeNotificationSre =
  "COMPTE" | "PAIEMENT" | "OBLIGATION" | "IMPORT" | "SECURITE" | "ADMINISTRATION";

export interface UtilisateurSre {
  id: string;
  nom: string;
  courriel: string;
  role: RoleSre;
  contribuableId?: string;
  statut: StatutCompteSre;
  changementMotDePasseRequis: boolean;
  creeLe: string;
  derniereConnexion?: string;
}

export interface ContribuableSre {
  id: string;
  utilisateurId?: string;
  type: TypeContribuable;
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
  statut?: StatutCompteSre;
  creeLe: string;
}

export type PeriodiciteImpot = "MENSUELLE" | "TRIMESTRIELLE" | "ANNUELLE" | "PONCTUELLE";
export interface TypeImpotSre {
  id: string;
  code: string;
  nom: string;
  description: string;
  categorie: string;
  contribuablesConcernes: "TOUS" | TypeContribuable;
  periodicite: PeriodiciteImpot;
  regleEcheance: string;
  modeMontant: "FIXE" | "CALCULE" | "MANUEL";
  montantReference: number | null;
  champsComplementaires: string[];
  actif: boolean;
  creeLe: string;
  modifieLe: string;
}

export interface ObligationFiscaleSre {
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

export interface EtapeHistoriquePaiement {
  statut: StatutPaiementSre;
  libelle: string;
  date: string;
  acteur: string;
  motif?: string;
}

export interface PaiementSre {
  id: string;
  referenceInterne: string;
  contribuableId: string;
  obligationId: string;
  typeImpotId: string;
  typeImpotNom: string;
  periode: string;
  montant: number;
  devise: "MGA";
  mode: ModePaiementSre;
  operateur?: "MVOLA" | "ORANGE_MONEY" | "AIRTEL_MONEY";
  telephoneUtilise?: string;
  banqueOuCanal?: string;
  titulairePayeur?: string;
  referenceTransaction: string;
  dateTransaction: string;
  justificatifNom?: string;
  statut: StatutPaiementSre;
  soumisLe: string;
  valideLe?: string;
  validePar?: string;
  motifRejet?: string;
  historique: EtapeHistoriquePaiement[];
}

export type TypeDocumentPaiementSre = "ACCUSE_DECLARATION" | "RECU_PAIEMENT";
export interface DocumentPaiementSre {
  id: string;
  numero: string;
  type: TypeDocumentPaiementSre;
  statut: "VALIDE" | "ANNULE";
  paiementId: string;
  contribuableId: string;
  referencePaiement: string;
  typeImpotNom: string;
  periode: string;
  referenceTransactionDeclaree: string;
  modeDeclare: ModePaiementSre;
  montant: number;
  devise: "MGA";
  emetteur: string;
  emisLe: string;
  emisPar?: string;
  mention: string;
}

export interface NotificationSre {
  id: string;
  titre: string;
  message: string;
  type: TypeNotificationSre;
  date: string;
  lue: boolean;
  utilisateurId?: string;
  roleDestinataire?: RoleSre;
  referenceEntite?: string;
  statutEmail: "NON_ENVOYE" | "ERREUR";
}

export interface JournalActiviteSre {
  id: string;
  acteurId?: string;
  acteur: string;
  role: RoleSre | "SYSTEME";
  action: string;
  ressource: string;
  referenceRessource: string;
  date: string;
  resultat: "SUCCES" | "ECHEC";
  details?: string;
}

export interface LigneErreurImportSre {
  ligne: number;
  champ?: string;
  message: string;
  donnees?: Record<string, unknown>;
}

export interface HistoriqueImportSre {
  id: string;
  nomFichier: string;
  date: string;
  analysees: number;
  creees: number;
  ignorees: number;
  doublons: number;
  erreurs: LigneErreurImportSre[];
  statut: "TERMINE" | "PARTIEL" | "ERREUR";
}

export interface ParametresSre {
  institution: string;
  regions: string[];
}

export interface EtatPlateformeSre {
  version: 1;
  administrateurInitialise: boolean;
  utilisateurs: UtilisateurSre[];
  contribuables: ContribuableSre[];
  typesImpots: TypeImpotSre[];
  obligations: ObligationFiscaleSre[];
  paiements: PaiementSre[];
  documentsPaiement: DocumentPaiementSre[];
  notifications: NotificationSre[];
  journauxActivite: JournalActiviteSre[];
  parametres: ParametresSre;
}

export interface ProfilInscriptionSre {
  nom: string;
  prenom?: string;
  type: TypeContribuable;
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

export interface FiltresPaiementSre {
  recherche?: string;
  statut?: StatutPaiementSre | "TOUS";
  typeImpotId?: string;
  mode?: ModePaiementSre | "TOUS";
  debut?: string;
  fin?: string;
}
