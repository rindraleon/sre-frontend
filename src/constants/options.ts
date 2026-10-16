/** Option de liste déroulante générique (valeur = code API, libellé = affichage). */
export interface OptionSelect {
  valeur: string;
  libelle: string;
}

export const TOUS = "TOUS" as const;

export const OPTIONS_TYPE_CONTRIBUABLE: OptionSelect[] = [
  { valeur: TOUS, libelle: "Tous" },
  { valeur: "PARTICULIER", libelle: "Particuliers" },
  { valeur: "ENTREPRISE", libelle: "Entreprises" },
];

export const OPTIONS_ROLE_UTILISATEUR: OptionSelect[] = [
  { valeur: TOUS, libelle: "Tous les rôles" },
  { valeur: "ADMIN", libelle: "Administrateurs" },
  { valeur: "CLIENT", libelle: "Contribuables" },
];

export const OPTIONS_STATUT_OBLIGATION: OptionSelect[] = [
  { valeur: TOUS, libelle: "Tous" },
  { valeur: "A_PAYER", libelle: "À payer" },
  { valeur: "EN_RETARD", libelle: "En retard" },
  { valeur: "PAIEMENT_EN_COURS", libelle: "Paiement en cours" },
  { valeur: "EN_VERIFICATION", libelle: "En vérification" },
  { valeur: "REJETE", libelle: "Rejeté" },
  { valeur: "PAYE", libelle: "Décision confirmée en interne" },
];

export const OPERATEURS_MOBILE_MONEY: OptionSelect[] = [
  { valeur: "MVOLA", libelle: "MVola" },
  { valeur: "ORANGE_MONEY", libelle: "Orange Money" },
  { valeur: "AIRTEL_MONEY", libelle: "Airtel Money" },
];

export const MODE_PAIEMENT_MOBILE_MONEY = "MOBILE_MONEY" as const;
export const MODE_PAIEMENT_VIREMENT = "VIREMENT_BANCAIRE" as const;

/** Statuts d'obligation ouvrant la déclaration d'un paiement. */
export const STATUTS_OBLIGATION_DECLARABLE = [
  "A_PAYER",
  "EN_RETARD",
  "REJETE",
  "CORRECTION_DEMANDEE",
] as const;

export const TAILLES_PAGES_TABLEAU = [10, 20, 50] as const;
