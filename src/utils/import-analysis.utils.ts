import type { CellValue } from "read-excel-file/browser";
import type { ImportErrorRow, TaxpayerType } from "@/types";
import { SRE_REGION } from "@/data";
import {
  MAPPING_FIELDS,
  cellText,
  mappingEmpty,
  normalizedKey,
  type AnalysisRow,
  type ImportProfile,
  type Mappings,
  type MappingField,
} from "@/utils/import-parsing.utils";

export function detectMapping(headers: readonly string[]): Mappings {
  const mapping: Mappings = { ...mappingEmpty };
  for (const entry of MAPPING_FIELDS) {
    const index = headers.findIndex((header) =>
      entry.aliases.map(normalizedKey).includes(normalizedKey(header)),
    );
    if (index >= 0) mapping[entry.field] = String(index);
  }
  return mapping;
}

export function isMappingComplete(mapping: Mappings): boolean {
  return MAPPING_FIELDS.filter((entry) => entry.required).every(
    (entry) => mapping[entry.field] !== "",
  );
}

function readMappedValue(
  row: readonly (CellValue | null)[],
  field: MappingField,
  mapping: Mappings,
): string {
  const index = mapping[field] === "" ? -1 : Number(mapping[field]);
  return index < 0 ? "" : cellText(row[index]);
}

export function resolveTaxpayerType(
  rowNumber: number,
  rawType: string,
  errors: ImportErrorRow[],
): TaxpayerType {
  const normalizedType = normalizedKey(rawType);
  if (
    normalizedType.includes("entreprise") ||
    normalizedType.includes("societe") ||
    normalizedType.includes("professionnel")
  )
    return "ENTREPRISE";
  if (normalizedType.includes("particulier") || normalizedType.includes("personne"))
    return "PARTICULIER";
  errors.push({
    row: rowNumber,
    field: "Type",
    message: "Indiquez explicitement Particulier ou Entreprise.",
  });
  return "PARTICULIER";
}

export interface DuplicateSets {
  emails: Set<string>;
  nifs: Set<string>;
  stats: Set<string>;
}

export function createDuplicateSets(): DuplicateSets {
  return { emails: new Set(), nifs: new Set(), stats: new Set() };
}

export function checkDuplicates(
  rowNumber: number,
  values: { email: string; nif: string; stat: string },
  sets: DuplicateSets,
  errors: ImportErrorRow[],
): boolean {
  let duplicate = false;
  if (values.email && sets.emails.has(values.email)) {
    duplicate = true;
    errors.push({
      row: rowNumber,
      field: "E-mail",
      message: "Cette adresse apparaît plusieurs fois dans le classeur.",
    });
  }
  if (values.nif && sets.nifs.has(values.nif)) {
    duplicate = true;
    errors.push({
      row: rowNumber,
      field: "NIF",
      message: "Ce NIF apparaît plusieurs fois dans le classeur.",
    });
  }
  if (values.stat && sets.stats.has(values.stat)) {
    duplicate = true;
    errors.push({
      row: rowNumber,
      field: "STAT",
      message: "Ce STAT apparaît plusieurs fois dans le classeur.",
    });
  }
  if (values.email) sets.emails.add(values.email);
  if (values.nif) sets.nifs.add(values.nif);
  if (values.stat) sets.stats.add(values.stat);
  return duplicate;
}

export function isValidEmail(email: string): boolean {
  const atSignIndex = email.indexOf("@");
  const domain = email.slice(atSignIndex + 1);
  const indexPoint = domain.indexOf(".");
  return !(
    !email ||
    atSignIndex <= 0 ||
    atSignIndex !== email.lastIndexOf("@") ||
    /\s/.test(email) ||
    indexPoint <= 0 ||
    indexPoint === domain.length - 1
  );
}

export interface RequiredFieldsInput {
  number: number;
  type: TaxpayerType;
  legalName: string;
  name: string;
  nif: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  city: string;
}

export function checkRequiredFields(input: RequiredFieldsInput, errors: ImportErrorRow[]): void {
  const { number, type, legalName, name, nif, email, phone, address, region, city } = input;
  if (type === "ENTREPRISE" && !(legalName || name))
    errors.push({
      row: number,
      field: "Raison sociale",
      message: "La raison sociale est requise.",
    });
  if (type === "PARTICULIER" && !name)
    errors.push({ row: number, field: "Nom", message: "Le nom du contribuable est requis." });
  if (nif.length < 3)
    errors.push({ row: number, field: "NIF", message: "Un NIF valide est obligatoire." });
  if (!isValidEmail(email))
    errors.push({
      row: number,
      field: "E-mail",
      message: "Une adresse e-mail valide est requise.",
    });
  if (phone.length < 7)
    errors.push({
      row: number,
      field: "Téléphone",
      message: "Un numéro de téléphone valide est requis.",
    });
  if (address.length < 3)
    errors.push({ row: number, field: "Adresse", message: "Une adresse est requise." });
  if (normalizedKey(region) !== normalizedKey(SRE_REGION))
    errors.push({
      row: number,
      field: "Région",
      message: `Le service est limité à ${SRE_REGION}.`,
    });
  if (!city)
    errors.push({
      row: number,
      field: "Ville / Commune",
      message: "La ville ou commune est requise.",
    });
}

export function analyzeRow(
  row: readonly (CellValue | null)[],
  index: number,
  mapping: Mappings,
  sets: DuplicateSets,
): AnalysisRow {
  const number = index + 2;
  const values = row.map(cellText);
  const errors: ImportErrorRow[] = [];
  if (values.every((value) => !value)) return { number, values, errors, duplicate: false };

  const type = resolveTaxpayerType(number, readMappedValue(row, "type", mapping), errors);
  const legalName = readMappedValue(row, "raisonSociale", mapping);
  const name = readMappedValue(row, "nom", mapping);
  const firstName = readMappedValue(row, "prenom", mapping);
  const nif = readMappedValue(row, "nif", mapping).trim().toUpperCase();
  const stat = readMappedValue(row, "stat", mapping).trim().toUpperCase();
  const email = readMappedValue(row, "courriel", mapping).trim().toLowerCase();
  const phone = readMappedValue(row, "telephone", mapping).trim();
  const address = readMappedValue(row, "adresse", mapping).trim();
  const region = readMappedValue(row, "region", mapping).trim();
  const city = readMappedValue(row, "ville", mapping).trim();

  checkRequiredFields(
    { number, type, legalName, name, nif, email, phone, address, region, city },
    errors,
  );
  const duplicate = checkDuplicates(number, { email, nif, stat }, sets, errors);

  const tradeName = readMappedValue(row, "nomCommercial", mapping).trim();
  const legalRepresentative = readMappedValue(row, "representantLegal", mapping).trim();
  const profile: ImportProfile | undefined = errors.length
    ? undefined
    : {
        type,
        nom: (name || legalName).trim(),
        ...(firstName.trim() ? { prenom: firstName.trim() } : {}),
        ...(legalName.trim() ? { raisonSociale: legalName.trim() } : {}),
        ...(tradeName ? { nomCommercial: tradeName } : {}),
        nif,
        ...(stat ? { stat } : {}),
        adresse: address,
        region: SRE_REGION,
        ville: city,
        courriel: email,
        telephone: phone,
        ...(legalRepresentative ? { representantLegal: legalRepresentative } : {}),
      };

  return { number, values, profile, errors, duplicate };
}

export function analyzeWorkbook(
  rows: readonly (readonly (CellValue | null)[])[],
  mapping: Mappings,
): AnalysisRow[] {
  const sets = createDuplicateSets();
  return rows
    .map((row, index) => analyzeRow(row, index, mapping, sets))
    .filter((row) => row.values.some(Boolean));
}

export type AnalysisFilter = "TOUS" | "VALIDES" | "DOUBLONS" | "ERREURS";

export function filterAnalysisRows(
  rows: readonly AnalysisRow[],
  filter: AnalysisFilter,
): AnalysisRow[] {
  switch (filter) {
    case "VALIDES":
      return rows.filter((row) => Boolean(row.profile));
    case "DOUBLONS":
      return rows.filter((row) => row.duplicate);
    case "ERREURS":
      return rows.filter((row) => row.errors.length > 0);
    default:
      return [...rows];
  }
}

export function selectImportableProfiles(rows: readonly AnalysisRow[]): ImportProfile[] {
  return rows
    .filter((row) => row.profile && !row.duplicate && row.errors.length === 0)
    .map((row) => row.profile as ImportProfile);
}
