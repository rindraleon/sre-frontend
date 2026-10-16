import { TOUS, type OptionSelect } from "./options";

export const OPTIONS_STATUT_PAIEMENT_FILTRE: OptionSelect[] = [
  { valeur: TOUS, libelle: "Tous" },
  { valeur: "EN_VERIFICATION", libelle: "En vérification" },
  { valeur: "CONFIRME", libelle: "Confirmé par l’administration" },
  { valeur: "REJETE", libelle: "Rejeté" },
  { valeur: "CORRECTION_DEMANDEE", libelle: "Correction demandée" },
];
