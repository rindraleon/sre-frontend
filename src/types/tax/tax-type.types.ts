import type { TaxpayerType } from "../taxpayer";

export type TaxPeriodicity = "MENSUELLE" | "TRIMESTRIELLE" | "ANNUELLE" | "PONCTUELLE";

export interface TaxType {
  id: string;
  code: string;
  nom: string;
  description: string;
  categorie: string;
  contribuablesConcernes: "TOUS" | TaxpayerType;
  periodicite: TaxPeriodicity;
  regleEcheance: string;
  modeMontant: "FIXE" | "CALCULE" | "MANUEL";
  montantReference: number | null;
  champsComplementaires: string[];
  actif: boolean;
  creeLe: string;
  modifieLe: string;
}
