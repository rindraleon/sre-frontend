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
    icon: FileCheck2,
    title: "Obligations",
    description:
      "Consultez les obligations créées par l’administration et associées à votre profil.",
    linkText: "Se connecter",
  },
  {
    index: "02 · DÉCLARER",
    icon: WalletCards,
    title: "Déclaration d’opération",
    description:
      "Soumettez les informations d’une opération déjà effectuée afin qu’elle soit examinée.",
    linkText: "Accéder au suivi",
  },
  {
    index: "03 · SUIVRE",
    icon: ShieldCheck,
    title: "Décisions et documents",
    description: "Consultez les décisions et les documents effectivement émis par le serveur.",
    linkText: "Ouvrir mon espace",
  },
];

export const STEPS = [
  {
    number: "01",
    title: "Créez votre accès",
    description: "Votre compte est géré et vérifié par le serveur.",
  },
  {
    number: "02",
    title: "Consultez votre dossier",
    description: "Les obligations et coordonnées proviennent des données enregistrées.",
  },
  {
    number: "03",
    title: "Déclarez une opération",
    description: "Une référence fournie ne prouve ni le transfert ni le règlement.",
  },
  {
    number: "04",
    title: "Suivez l’examen",
    description:
      "Une décision explicite de l’administration met à jour le statut de la déclaration.",
  },
];

export const PROMISES = [
  {
    icon: "UserRound",
    title: "Un espace par compte",
    description: "Les données sont limitées à la session authentifiée.",
  },
  {
    icon: "FileCheck2",
    title: "Informations consultables",
    description: "Obligations et déclarations renvoyées par le serveur.",
  },
  {
    icon: "ShieldCheck",
    title: "Accès encadré",
    description: "Les autorisations sont contrôlées par l’API.",
  },
] as const;

export const TAX_TYPES_MADAGASCAR = [
  {
    acronym: "IR",
    title: "Impôt sur les revenus",
    description:
      "Imposition de revenus ou bénéfices entrant dans le champ défini par le Code des impôts.",
    icon: BriefcaseBusiness,
  },
  {
    acronym: "IS",
    title: "Impôt synthétique",
    description:
      "Régime d’imposition synthétique appliqué aux contribuables qui remplissent les conditions légales.",
    icon: Coins,
  },
  {
    acronym: "IRSA",
    title: "Revenus salariaux et assimilés",
    description:
      "Impôt relatif aux rémunérations et revenus assimilés visés par les textes fiscaux.",
    icon: UsersRound,
  },
  {
    acronym: "TVA",
    title: "Taxe sur la valeur ajoutée",
    description:
      "Taxe applicable à certaines opérations et activités, selon les règles d’assujettissement en vigueur.",
    icon: Receipt,
  },
  {
    acronym: "IRCM",
    title: "Revenus des capitaux mobiliers",
    description:
      "Impôt portant sur certaines catégories de revenus de capitaux mobiliers prévues par le Code.",
    icon: ChartNoAxesCombined,
  },
  {
    acronym: "IPVI",
    title: "Plus-values immobilières",
    description:
      "Impôt pouvant concerner les plus-values réalisées lors de cessions immobilières imposables.",
    icon: House,
  },
  {
    acronym: "IFT",
    title: "Impôt foncier sur les terrains",
    description:
      "Imposition foncière attachée aux terrains, selon les caractéristiques et règles applicables.",
    icon: MapPinned,
  },
  {
    acronym: "IFPB",
    title: "Impôt foncier sur la propriété bâtie",
    description:
      "Imposition foncière concernant les propriétés bâties dans les conditions fixées par la loi.",
    icon: Building2,
  },
  {
    acronym: "DE · TIMBRE",
    title: "Droits d’enregistrement et de timbre",
    description:
      "Droits dus pour certains actes, mutations ou formalités, selon la nature de l’opération.",
    icon: FileText,
  },
  {
    acronym: "ACCISES",
    title: "Droits d’accises",
    description:
      "Droits indirects qui concernent certaines catégories de produits définies par les textes.",
    icon: Scale,
  },
  {
    acronym: "IDH",
    title: "Impôt direct sur les hydrocarbures",
    description:
      "Imposition sectorielle relative aux activités et revenus pétroliers visés par le Code.",
    icon: Fuel,
  },
] as const;
