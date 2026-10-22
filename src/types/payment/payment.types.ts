export type PaymentStatus = "EN_VERIFICATION" | "CONFIRME" | "REJETE" | "CORRECTION_DEMANDEE";
export type PaymentMethod = "MOBILE_MONEY" | "VIREMENT_BANCAIRE";
export type PaymentOperator = "MVOLA" | "ORANGE_MONEY" | "AIRTEL_MONEY";

export interface PaymentHistoryStep {
  status: PaymentStatus;
  label: string;
  date: string;
  actor: string;
  reason?: string;
}

export interface Payment {
  id: string;
  internalReference: string;
  taxpayerId: string;
  obligationId: string;
  taxTypeId: string;
  taxTypeName: string;
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
  validatedAt?: string;
  validatedBy?: string;
  rejectionReason?: string;
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
}
