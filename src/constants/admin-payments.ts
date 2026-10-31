import type { OptionSelect } from "./options";
import { ALL } from "./options";

export {
  PAYMENT_STATUSES_A_SUIVRE,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_OPTIONS,
  paymentStatusLabel,
} from "./payment-statuses";

/** Filtre d'administration : la valeur « Tous » est retirée avant l'appel API. */
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
