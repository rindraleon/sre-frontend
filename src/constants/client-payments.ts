import type { OptionSelect } from "./options";

export const PAYMENT_STATUS_OPTIONS: OptionSelect[] = [
  { value: "TOUS", label: "Tous les statuts" },
  { value: "EN_VERIFICATION", label: "En vérification" },
  { value: "CONFIRME", label: "Confirmé par l’administration" },
  { value: "REJETE", label: "Rejeté" },
  { value: "CORRECTION_DEMANDEE", label: "Correction demandée" },
];
