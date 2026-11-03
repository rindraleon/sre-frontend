import { callApi } from "@/services/api";
import { buildQueryString, type QueryValue } from "@/utils";
import type { CampaignSummary, DispatchHistoryEntry, OverdueRow } from "@/types";

export function loadOverdueRowsApi(
  token: string,
  filters: Record<string, QueryValue> = {},
): Promise<OverdueRow[]> {
  return callApi<OverdueRow[]>(`admin/retards${buildQueryString(filters)}`, { token });
}

export function loadDispatchHistoryApi(token: string): Promise<DispatchHistoryEntry[]> {
  return callApi<DispatchHistoryEntry[]>("admin/notifications/historique-envois", { token });
}

export function sendOverdueCampaignApi(
  token: string,
  payload: Record<string, unknown>,
): Promise<CampaignSummary> {
  return callApi<CampaignSummary>("admin/notifications/groupes", {
    method: "POST",
    token,
    body: payload,
  });
}
