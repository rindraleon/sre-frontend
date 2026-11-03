import { callApi } from "@/services/api";
import type { Taxpayer, ApiTaxpayer } from "@/types";
import { mapApiTaxpayer } from "./taxpayer.mappers";

export type TaxpayerPayload = Record<string, unknown>;

export interface TaxpayerImportResult {
  donnees: ApiTaxpayer[];
  creees: number;
  ignorees: number;
  comptesCrees: number;
  doublons: number;
  rejetees: number;
  emails: {
    compteId: string;
    destinataire: string;
    statutCourriel: string;
    demandeId: string | null;
  }[];
}

export async function createTaxpayerApi(
  token: string,
  payload: TaxpayerPayload,
): Promise<Taxpayer> {
  const response = await callApi<ApiTaxpayer>("contribuables", {
    method: "POST",
    token,
    body: payload,
  });
  return mapApiTaxpayer(response);
}

export function deleteTaxpayerApi(token: string, taxpayerId: string) {
  return callApi<{ message: string }>(`contribuables/${encodeURIComponent(taxpayerId)}`, {
    method: "DELETE",
    token,
  });
}

export function importTaxpayersApi(token: string, profils: readonly object[]) {
  return callApi<TaxpayerImportResult>("contribuables/import", {
    method: "POST",
    token,
    body: { profils },
  });
}

export function loadMyTaxpayerApi(token: string) {
  return callApi<ApiTaxpayer>("contribuables/moi", { token });
}

export async function updateMyTaxpayerProfileApi(
  token: string,
  payload: Record<string, unknown>,
): Promise<Taxpayer> {
  const response = await callApi<ApiTaxpayer>("contribuables/moi", {
    method: "PATCH",
    token,
    body: payload,
  });
  return mapApiTaxpayer(response);
}
