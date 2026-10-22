export type StatusObligation =
  | "A_PAYER"
  | "PAIEMENT_EN_COURS"
  | "EN_VERIFICATION"
  | "PAYE"
  | "EN_RETARD"
  | "REJETE"
  | "CORRECTION_DEMANDEE";

export interface TaxObligation {
  id: string;
  taxpayerId: string;
  taxTypeId: string;
  taxTypeName: string;
  taxReference: string;
  period: string;
  amount: number;
  currency: "MGA";
  dueDate: string;
  status: StatusObligation;
  paymentId?: string;
  createdAt: string;
}
