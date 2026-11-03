import { ALL, type OptionSelect } from "./options";

export const OBLIGATION_STATUS_FILTER_OPTIONS: OptionSelect[] = [
  { value: ALL, label: "Tous" },
  { value: "A_PAYER", label: "À payer" },
  { value: "PAIEMENT_EN_COURS", label: "Paiement en cours" },
  { value: "EN_VERIFICATION", label: "En vérification" },
  { value: "PAYE", label: "Payé" },
  { value: "EN_RETARD", label: "En retard" },
  { value: "REJETE", label: "Rejeté" },
  { value: "CORRECTION_DEMANDEE", label: "Correction demandée" },
];
