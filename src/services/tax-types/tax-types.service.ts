import { callApi } from "@/services/api";
import type { TaxType, ApiTaxType } from "@/types";
import { mapApiTaxType } from "./tax-type.mappers";

export interface TaxTypePayload {
  code: string;
  nom: string;
  description: string;
  categorie: string;
  contribuablesConcernes: string;
  periodicite: string;
  regleEcheance: string;
  modeMontant: string;
  montantReference: number | null;
  champsComplementaires: string[];
}

export async function saveTaxTypeApi(
  token: string,
  payload: TaxTypePayload,
  taxTypeId?: string,
): Promise<TaxType> {
  const response = await callApi<ApiTaxType>(
    taxTypeId ? `types-impots/${encodeURIComponent(taxTypeId)}` : "types-impots",
    { method: taxTypeId ? "PATCH" : "POST", token, body: payload },
  );
  return mapApiTaxType(response);
}

export async function setTaxTypeActiveApi(
  token: string,
  taxTypeId: string,
  actif: boolean,
): Promise<TaxType> {
  const response = await callApi<ApiTaxType>(
    `types-impots/${encodeURIComponent(taxTypeId)}/activite`,
    { method: "PATCH", token, body: { actif } },
  );
  return mapApiTaxType(response);
}
