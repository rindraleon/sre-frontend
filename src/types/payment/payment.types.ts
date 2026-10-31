export type PaymentStatus =
  | "EN_ATTENTE"
  | "EN_VERIFICATION"
  | "CONFIRME"
  | "REJETE"
  | "CORRECTION_DEMANDEE"
  | "ECHEC"
  | "ANNULE";

export type PaymentMethod = "MOBILE_MONEY" | "VIREMENT_BANCAIRE";
export type PaymentOperator = "MVOLA" | "ORANGE_MONEY" | "AIRTEL_MONEY";
export type PaymentOrigin = "DECLARATION_AUTONOME" | "OBLIGATION";

export interface PaymentHistoryStep {
  status: PaymentStatus;
  label: string;
  date: string;
  actor: string;
  reason?: string;
}

/** Reçu de paiement émis automatiquement après confirmation. */
export interface PaymentReceipt {
  id: string;
  number: string;
  issuedAt: string;
  verificationCode?: string | null;
  pdfPath: string;
}

export interface Payment {
  id: string;
  internalReference: string;
  taxpayerId: string;
  /** Nul pour une déclaration autonome (sans obligation fiscale préalable). */
  obligationId?: string | null;
  origin: PaymentOrigin;
  taxTypeId: string;
  taxTypeName: string;
  /** Période fiscale déclarée (AAAA-MM, AAAA-Tn, AAAA, ou date pour un impôt ponctuel). */
  period: string;
  amount: number;
  currency: "MGA";
  mode: PaymentMethod;
  operator?: PaymentOperator;
  usedPhone?: string;
  bankOrChannel?: string;
  payerName?: string;
  transactionReference: string;
  transactionDate: string;
  supportingDocumentName?: string;
  status: PaymentStatus;
  submittedAt: string;
  confirmedAt?: string | null;
  validatedAt?: string;
  validatedBy?: string;
  rejectionReason?: string;
  failureReason?: string | null;
  provider?: string | null;
  receipt?: PaymentReceipt | null;
  history: PaymentHistoryStep[];
}

export type PaymentDocumentType = "ACCUSE_DECLARATION" | "RECU_PAIEMENT";
export interface PaymentDocument {
  id: string;
  number: string;
  type: PaymentDocumentType;
  status: "VALIDE" | "ANNULE";
  paymentId: string;
  taxpayerId: string;
  paymentReference: string;
  taxTypeName: string;
  period: string;
  declaredTransactionReference: string;
  declaredMode: PaymentMethod;
  amount: number;
  currency: "MGA";
  issuer: string;
  issuedAt: string;
  issuedBy?: string;
  mention: string;
  verificationCode?: string | null;
  paymentStatus?: string | null;
  confirmedAt?: string | null;
}

/** Filtres multicritères de la recherche de paiements (administration). */
export interface PaymentFilters {
  statut?: string;
  contribuableId?: string;
  typeImpotId?: string;
  periode?: string;
  du?: string;
  au?: string;
  montantMin?: string;
  montantMax?: string;
  recherche?: string;
  tri?: string;
  page?: number;
  parPage?: number;
}

export interface PaymentPage {
  donnees: Payment[];
  total: number;
  page: number;
  parPage: number;
  pages: number;
}

export interface StatisticsIndicators {
  totalDeclarations: number;
  montantConfirme: number;
  nombrePaiementsConfirmes: number;
  montantEnAttente: number;
  nombreEnAttente: number;
  montantNonAbouti: number;
  nombreNonAbouti: number;
  nombreEchecs: number;
  montantDeclareTotal: number;
  nombreContribuablesPayeurs: number;
}

export interface Statistics {
  perimetre: string;
  granularite: "jour" | "mois" | "trimestre" | "annee";
  genereLe: string;
  devise: "MGA";
  indicateurs: StatisticsIndicators;
  parNatureImpot: Array<{
    nature: string;
    declarations: number;
    confirmes: number;
    montantConfirme: number;
  }>;
  parStatut: Array<{ statut: string; declarations: number; montant: number }>;
  evolution: Array<{
    periode: string;
    declarations: number;
    confirmes: number;
    montantConfirme: number;
  }>;
  principauxContribuables: Array<{
    id: string;
    nom: string;
    nif: string | null;
    type: string;
    paiementsConfirmes: number;
    montantConfirme: number;
  }>;
  repartitionPayeurs: Array<{ type: string; contribuables: number }>;
  aSuivre: Array<{
    id: string;
    referenceInterne: string;
    statut: string;
    montant: number;
    dateTransaction: string;
    contribuable: string;
    nature: string | null;
  }>;
}
