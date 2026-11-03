import type { OptionSelect } from "./options";
import { ALL } from "./options";

export const PAYMENT_STATUS_FILTER_OPTIONS: OptionSelect[] = [
  { value: ALL, label: "Tous" },
  { value: "CONFIRME", label: "Confirmés (reçu émis)" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "EN_VERIFICATION", label: "En vérification" },
  { value: "ECHEC", label: "Échecs" },
  { value: "ANNULE", label: "Annulés" },
  { value: "REJETE", label: "Rejetés" },
  { value: "CORRECTION_DEMANDEE", label: "Corrections demandées" },
];
