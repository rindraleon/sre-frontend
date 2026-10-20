import {
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  Coins,
  FileCheck2,
  FileText,
  Fuel,
  House,
  MapPinned,
  Receipt,
  Scale,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";

export const FEATURES = [
  {
    index: "01 · CONSULTER",
    icone: FileCheck2,
    titre: "Obligations",
    description:
      "Consultez les obligations créées par l’administration et associées à votre profil.",
    lienTexte: "Se connecter",
  },
  {
    index: "02 · DÉCLARER",
    icone: WalletCards,
    titre: "Déclaration d’opération",
    description:
      "Soumettez les informations d’une opération déjà effectuée afin qu’elle soit examinée.",
    lienTexte: "Accéder au suivi",
  },
  {
    index: "03 · SUIVRE",
    icone: ShieldCheck,
    titre: "Décisions et documents",
    description: "Consultez les décisions et les documents effectivement émis par le serveur.",
    lienTexte: "Ouvrir mon espace",
  },
];

export const ETAPES = [
  {
    numero: "01",
    titre: "Créez votre accès",
    description: "Votre compte est géré et vérifié par le serveur.",
  },
  {
    numero: "02",
    titre: "Consultez votre dossier",
    description: "Les obligations et coordonnées proviennent des données enregistrées.",
  },
  {
    numero: "03",
    titre: "Déclarez une opération",
    description: "Une référence fournie ne prouve ni le transfert ni le règlement.",
  },
  {
    numero: "04",
    titre: "Suivez l’examen",
    description:
      "Une décision explicite de l’administration met à jour le statut de la déclaration.",
  },
];

export const PROMESSES = [
  {
    icone: "UserRound",
    titre: "Un espace par compte",
    description: "Les données sont limitées à la session authentifiée.",
  },
  {
    icone: "FileCheck2",
    titre: "Informations consultables",
    description: "Obligations et déclarations renvoyées par le serveur.",
  },
  {
    icone: "ShieldCheck",
    titre: "Accès encadré",
    description: "Les autorisations sont contrôlées par l’API.",
  },
] as const;

export const TYPES_IMPOTS_MADAGASCAR = [
  {
    sigle: "IR",
    intitule: "Impôt sur les revenus",
    description:
      "Imposition de revenus ou bénéfices entrant dans le champ défini par le Code des impôts.",
    icone: BriefcaseBusiness,
  },
  {
    sigle: "IS",
    intitule: "Impôt synthétique",
    description:
      "Régime d’imposition synthétique appliqué aux contribuables qui remplissent les conditions légales.",
    icone: Coins,
  },
  {
    sigle: "IRSA",
    intitule: "Revenus salariaux et assimilés",
    description:
      "Impôt relatif aux rémunérations et revenus assimilés visés par les textes fiscaux.",
    icone: UsersRound,
  },
  {
    sigle: "TVA",
    intitule: "Taxe sur la valeur ajoutée",
    description:
      "Taxe applicable à certaines opérations et activités, selon les règles d’assujettissement en vigueur.",
    icone: Receipt,
  },
  {
    sigle: "IRCM",
    intitule: "Revenus des capitaux mobiliers",
    description:
      "Impôt portant sur certaines catégories de revenus de capitaux mobiliers prévues par le Code.",
    icone: ChartNoAxesCombined,
  },
  {
    sigle: "IPVI",
    intitule: "Plus-values immobilières",
    description:
      "Impôt pouvant concerner les plus-values réalisées lors de cessions immobilières imposables.",
    icone: House,
  },
  {
    sigle: "IFT",
    intitule: "Impôt foncier sur les terrains",
    description:
      "Imposition foncière attachée aux terrains, selon les caractéristiques et règles applicables.",
    icone: MapPinned,
  },
  {
    sigle: "IFPB",
    intitule: "Impôt foncier sur la propriété bâtie",
    description:
      "Imposition foncière concernant les propriétés bâties dans les conditions fixées par la loi.",
    icone: Building2,
  },
  {
    sigle: "DE · TIMBRE",
    intitule: "Droits d’enregistrement et de timbre",
    description:
      "Droits dus pour certains actes, mutations ou formalités, selon la nature de l’opération.",
    icone: FileText,
  },
  {
    sigle: "ACCISES",
    intitule: "Droits d’accises",
    description:
      "Droits indirects qui concernent certaines catégories de produits définies par les textes.",
    icone: Scale,
  },
  {
    sigle: "IDH",
    intitule: "Impôt direct sur les hydrocarbures",
    description:
      "Imposition sectorielle relative aux activités et revenus pétroliers visés par le Code.",
    icone: Fuel,
  },
] as const;
