import type { OptionSelect } from "./options";
import { ALL } from "./options";

/**
 * Statuts de paiement manipulés par l'interface.
 * La valeur « Tous » est réservée aux filtres : elle n'est jamais envoyée au serveur.
 */
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente de confirmation",
  EN_VERIFICATION: "En vérification",
  CONFIRME: "Confirmé — reçu émis",
  REJETE: "Rejeté",
  CORRECTION_DEMANDEE: "Correction demandée",
  ECHEC: "Échec",
  ANNULE: "Annulé",
};

/** Statuts « à suivre » côté administration : jamais de reçu définitif. */
export const PAYMENT_STATUSES_A_SUIVRE = [
  "EN_ATTENTE",
  "EN_VERIFICATION",
  "ECHEC",
  "ANNULE",
  "REJETE",
  "CORRECTION_DEMANDEE",
] as const;

export const PAYMENT_STATUS_OPTIONS: OptionSelect[] = [
  { value: ALL, label: "Tous les statuts" },
  { value: "CONFIRME", label: "Confirmés (reçu émis)" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "EN_VERIFICATION", label: "En vérification" },
  { value: "ECHEC", label: "Échecs" },
  { value: "ANNULE", label: "Annulés" },
  { value: "REJETE", label: "Rejetés" },
  { value: "CORRECTION_DEMANDEE", label: "Corrections demandées" },
];

/** Libellé du statut tel qu'affiché dans les tableaux et le suivi. */
export function paymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}
