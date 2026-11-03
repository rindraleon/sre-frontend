import { callApi } from "@/services/api";
import type { ActivityLogEntry } from "@/types";

export function loadActivityLogApi(token: string, perPage = 200): Promise<ActivityLogEntry[]> {
  return callApi<ActivityLogEntry[]>(`admin/journal-activite?parPage=${perPage}`, { token });
}
