import { callApi } from "@/services/api";
import type { TaxObligation, ApiObligation } from "@/types";
import { mapApiObligation } from "./obligation.mappers";

export interface ObligationPayload {
  contribuableId: string;
  typeImpotId: string;
  periode: string;
  montant: number;
  echeance: string;
}

export async function createObligationApi(
  token: string,
  payload: ObligationPayload,
): Promise<TaxObligation> {
  const response = await callApi<ApiObligation>("obligations", {
    method: "POST",
    token,
    body: payload,
  });
  return mapApiObligation(response);
}
