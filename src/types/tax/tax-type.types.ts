import type { TaxpayerType } from "../taxpayer";

export type TaxPeriodicity = "MENSUELLE" | "TRIMESTRIELLE" | "ANNUELLE" | "PONCTUELLE";

export interface TaxType {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  applicableTaxpayers: "TOUS" | TaxpayerType;
  periodicity: TaxPeriodicity;
  dueDateRule: string;
  amountMode: "FIXE" | "CALCULE" | "MANUEL";
  referenceAmount: number | null;
  additionalFields: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
