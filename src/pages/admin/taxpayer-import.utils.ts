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
export interface AnalysisRow {
  number: number;
  values: string[];
  profile?: ImportProfile;
  errors: ImportErrorRow[];
  duplicate: boolean;
}
export const MAPPING_FIELDS: {
  field: MappingField;
  label: string;
  required: boolean;
  aliases: string[];
}[] = [
  {
    field: "type",
    label: "Type de contribuable",
    required: true,
    aliases: ["type", "type contribuable", "type de contribuable", "profil"],
  },
  {
    field: "nom",
    label: "Nom",
    required: false,
    aliases: ["nom", "nom de famille", "nom du contribuable", "nom patronymique"],
  },
  {
    field: "prenom",
    label: "Prénom",
    required: false,
    aliases: ["prenom", "prénom", "firstname"],
  },
  {
    field: "raisonSociale",
    label: "Raison sociale",
    required: false,
    aliases: ["raison sociale", "entreprise", "societe", "société", "company"],
  },
  {
    field: "nomCommercial",
    label: "Nom commercial",
    required: false,
    aliases: ["nom commercial", "enseigne"],
  },
  {
    field: "nif",
    label: "NIF",
    required: false,
    aliases: ["nif", "numero nif", "numéro nif", "identifiant fiscal"],
  },
  {
    field: "stat",
    label: "STAT",
    required: false,
    aliases: ["stat", "numero stat", "numéro stat"],
  },
  {
    field: "courriel",
    label: "Adresse e-mail",
    required: true,
    aliases: ["email", "e-mail", "courriel", "adresse email", "adresse e-mail"],
  },
  {
    field: "telephone",
    label: "Téléphone",
    required: true,
    aliases: ["telephone", "téléphone", "tel", "mobile", "telephone mobile"],
  },
  {
    field: "adresse",
    label: "Adresse",
    required: true,
    aliases: ["adresse", "adresse postale", "adresse fiscale"],
  },
  { field: "region", label: "Région", required: true, aliases: ["region", "région"] },
  {
    field: "ville",
    label: "Ville / Commune",
    required: true,
    aliases: ["ville", "commune", "ville commune"],
  },
  {
    field: "representantLegal",
    label: "Représentant légal",
    required: false,
    aliases: ["representant legal", "représentant légal", "gerant", "gérant"],
  },
];
export const mappingEmpty: Mappings = {
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
export const normalizedKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
export const cellText = (cell: CellValue | null | undefined) =>
  cell == null
    ? ""
    : cell instanceof Date
      ? cell.toISOString().slice(0, 10)
      : String(cell).trim();
