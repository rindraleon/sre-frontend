import { ALL, type OptionSelect } from "./options";

export const PAYMENT_STATUS_FILTER_OPTIONS: OptionSelect[] = [
  { value: ALL, label: "Tous" },
  { value: "EN_VERIFICATION", label: "En vérification" },
  { value: "CONFIRME", label: "Confirmé par l’administration" },
  { value: "REJETE", label: "Rejeté" },
  { value: "CORRECTION_DEMANDEE", label: "Correction demandée" },
];
