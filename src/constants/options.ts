export interface OptionSelect {
  value: string;
  label: string;
}

export const ALL = "TOUS" as const;

export const TAXPAYER_TYPE_OPTIONS: OptionSelect[] = [
  { value: ALL, label: "Tous" },
  { value: "PARTICULIER", label: "Particuliers" },
  { value: "ENTREPRISE", label: "Entreprises" },
];

export const OBLIGATION_STATUS_OPTIONS: OptionSelect[] = [
  { value: ALL, label: "Tous" },
  { value: "A_PAYER", label: "À payer" },
  { value: "EN_RETARD", label: "En retard" },
  { value: "PAIEMENT_EN_COURS", label: "Paiement en cours" },
  { value: "EN_VERIFICATION", label: "En vérification" },
  { value: "REJETE", label: "Rejeté" },
  { value: "PAYE", label: "Décision confirmée en interne" },
];

export const OPERATORS_MOBILE_MONEY: OptionSelect[] = [
  { value: "MVOLA", label: "MVola" },
  { value: "ORANGE_MONEY", label: "Orange Money" },
  { value: "AIRTEL_MONEY", label: "Airtel Money" },
];

export const PAYMENT_METHOD_MOBILE_MONEY = "MOBILE_MONEY" as const;
export const PAYMENT_METHOD_BANK_TRANSFER = "VIREMENT_BANCAIRE" as const;

/** Obligation statuses that allow declaring a payment. */
export const DECLARABLE_OBLIGATION_STATUSES = [
  "A_PAYER",
  "EN_RETARD",
  "REJETE",
  "CORRECTION_DEMANDEE",
] as const;
