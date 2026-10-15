import { type CellValue } from "read-excel-file/browser";
import type { ImportErrorRow, TaxpayerType } from "@/types";
import { SRE_REGION } from "@/utils/constants";

export type MappingField =
  | "type"
  | "nom"
  | "prenom"
  | "raisonSociale"
  | "nomCommercial"
  | "nif"
  | "stat"
  | "courriel"
  | "telephone"
  | "adresse"
  | "region"
  | "ville"
  | "representantLegal";
export type Mappings = Record<MappingField, string>;
export interface ImportProfile {
  type: TaxpayerType;
  nom: string;
  prenom?: string;
  raisonSociale?: string;
  nomCommercial?: string;
  nif?: string;
  stat?: string;
  adresse: string;
  region: typeof SRE_REGION;
  ville: string;
  courriel: string;
  telephone: string;
  representantLegal?: string;
}
export interface AnalyseLigne {
  numero: number;
  valeurs: string[];
  profil?: ImportProfile;
  erreurs: ImportErrorRow[];
  doublon: boolean;
}
export const MAPPING_FIELDS: {
  champ: MappingField;
  libelle: string;
  obligatoire: boolean;
  aliases: string[];
}[] = [
  {
    champ: "type",
    libelle: "Type de contribuable",
    obligatoire: true,
    aliases: ["type", "type contribuable", "type de contribuable", "profil"],
  },
  {
    champ: "nom",
    libelle: "Nom",
    obligatoire: false,
    aliases: ["nom", "nom de famille", "nom du contribuable", "nom patronymique"],
  },
  {
    champ: "prenom",
    libelle: "Prénom",
    obligatoire: false,
    aliases: ["prenom", "prénom", "firstname"],
  },
  {
    champ: "raisonSociale",
    libelle: "Raison sociale",
    obligatoire: false,
    aliases: ["raison sociale", "entreprise", "societe", "société", "company"],
  },
  {
    champ: "nomCommercial",
    libelle: "Nom commercial",
    obligatoire: false,
    aliases: ["nom commercial", "enseigne"],
  },
  {
    champ: "nif",
    libelle: "NIF",
    obligatoire: false,
    aliases: ["nif", "numero nif", "numéro nif", "identifiant fiscal"],
  },
  {
    champ: "stat",
    libelle: "STAT",
    obligatoire: false,
    aliases: ["stat", "numero stat", "numéro stat"],
  },
  {
    champ: "courriel",
    libelle: "Adresse e-mail",
    obligatoire: true,
    aliases: ["email", "e-mail", "courriel", "adresse email", "adresse e-mail"],
  },
  {
    champ: "telephone",
    libelle: "Téléphone",
    obligatoire: true,
    aliases: ["telephone", "téléphone", "tel", "mobile", "telephone mobile"],
  },
  {
    champ: "adresse",
    libelle: "Adresse",
    obligatoire: true,
    aliases: ["adresse", "adresse postale", "adresse fiscale"],
  },
  { champ: "region", libelle: "Région", obligatoire: true, aliases: ["region", "région"] },
  {
    champ: "ville",
    libelle: "Ville / Commune",
    obligatoire: true,
    aliases: ["ville", "commune", "ville commune"],
  },
  {
    champ: "representantLegal",
    libelle: "Représentant légal",
    obligatoire: false,
    aliases: ["representant legal", "représentant légal", "gerant", "gérant"],
  },
];
export const mappingVide: Mappings = {
  type: "",
  nom: "",
  prenom: "",
  raisonSociale: "",
  nomCommercial: "",
  nif: "",
  stat: "",
  courriel: "",
  telephone: "",
  adresse: "",
  region: "",
  ville: "",
  representantLegal: "",
};
export const cleNormalisee = (valeur: string) =>
  valeur
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
export const texteCellule = (cellule: CellValue | null | undefined) =>
  cellule == null
    ? ""
    : cellule instanceof Date
      ? cellule.toISOString().slice(0, 10)
      : String(cellule).trim();
