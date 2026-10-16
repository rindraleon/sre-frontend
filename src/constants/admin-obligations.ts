import { TOUS, type OptionSelect } from "./options";

export const OPTIONS_STATUT_OBLIGATION_FILTRE: OptionSelect[] = [
  { valeur: TOUS, libelle: "Tous" },
  { valeur: "A_PAYER", libelle: "À payer" },
  { valeur: "PAIEMENT_EN_COURS", libelle: "Paiement en cours" },
  { valeur: "EN_VERIFICATION", libelle: "En vérification" },
  { valeur: "PAYE", libelle: "Payé" },
  { valeur: "EN_RETARD", libelle: "En retard" },
  { valeur: "REJETE", libelle: "Rejeté" },
  { valeur: "CORRECTION_DEMANDEE", libelle: "Correction demandée" },
];
