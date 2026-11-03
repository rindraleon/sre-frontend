import { callApi } from "@/services/api";

export function markNotificationReadApi(token: string, id: string) {
  return callApi<void>(`notifications/${encodeURIComponent(id)}/lue`, { method: "PATCH", token });
}

export function markAllNotificationsReadApi(token: string) {
  return callApi<void>("notifications/toutes-lues", { method: "PATCH", token });
}
