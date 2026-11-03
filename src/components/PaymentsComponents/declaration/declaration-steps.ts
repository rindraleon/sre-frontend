import type { UseFormReturn } from "react-hook-form";
import type { TaxType, Taxpayer } from "@/types";
import type { PaymentDeclarationFormValues } from "@/schemas";

export const PAYMENT_STEPS = [
  { id: "nature", label: "Nature d’impôt" },
  { id: "montant", label: "Montant / période" },
  { id: "reglement", label: "Règlement" },
  { id: "reference", label: "Référence" },
] as const;
export type PaymentStepId = (typeof PAYMENT_STEPS)[number]["id"];

export const DECLARATION_PAYMENT_EMPTY: PaymentDeclarationFormValues = {
  typeImpotId: "",
  montant: "",
  periode: "",
  mode: undefined as unknown as PaymentDeclarationFormValues["mode"],
  operateur: undefined,
  telephoneUtilise: "",
  banqueOuCanal: "",
  referenceTransaction: "",
  dateTransaction: currentLocalDate(),
};

export function currentLocalDate(): string {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function currentFiscalPeriod(periodicity: string): string {
  const now = new Date();
  const year = now.getFullYear();
  if (periodicity === "MENSUELLE") return `${year}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  if (periodicity === "TRIMESTRIELLE") return `${year}-T${Math.floor(now.getMonth() / 3) + 1}`;
  if (periodicity === "ANNUELLE") return String(year);
  return "";
}

export const PERIODICITY_LABELS: Record<string, string> = {
  MENSUELLE: "Mensuelle",
  TRIMESTRIELLE: "Trimestrielle",
  ANNUELLE: "Annuelle",
  PONCTUELLE: "Ponctuelle",
};

export function selectApplicableTaxTypes(taxTypes: TaxType[], taxpayer?: Taxpayer): TaxType[] {
  return taxTypes
    .filter((taxType) => taxType.isActive)
    .filter(
      (taxType) =>
        !taxpayer ||
        taxType.applicableTaxpayers === "TOUS" ||
        taxType.applicableTaxpayers === taxpayer.type,
    )
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

export interface StepProps {
  form: UseFormReturn<PaymentDeclarationFormValues>;
  taxTypes: TaxType[];
  selectedTaxType?: TaxType;
  payerLabel: string;
}
