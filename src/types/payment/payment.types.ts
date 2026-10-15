export type PaymentStatus = "EN_VERIFICATION" | "CONFIRME" | "REJETE" | "CORRECTION_DEMANDEE";
export type PaymentMethod = "MOBILE_MONEY" | "VIREMENT_BANCAIRE";
export type PaymentOperator = "MVOLA" | "ORANGE_MONEY" | "AIRTEL_MONEY";

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
  operateur?: PaymentOperator;
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

export interface PaymentFilters {
  recherche?: string;
  statut?: PaymentStatus | "TOUS";
  typeImpotId?: string;
  mode?: PaymentMethod | "TOUS";
  debut?: string;
  fin?: string;
}
