import { callApi } from "@/services/api";
import type { ApiUser, AppUser } from "@/types";
import { mapApiUser } from "./user.mappers";

export type AccountStatus = "ACTIF" | "INACTIF";

export async function updateUserStatusApi(
  token: string,
  userId: string,
  status: AccountStatus,
): Promise<AppUser> {
  const response = await callApi<ApiUser>(`utilisateurs/${encodeURIComponent(userId)}/statut`, {
    method: "PATCH",
    token,
    body: { statut: status },
  });
  return mapApiUser(response);
}

export function resendActivationEmailApi(token: string, requestId: string) {
  return callApi<{ statutCourriel: string }>(
    `utilisateurs/emails-activation/${encodeURIComponent(requestId)}/renvoyer`,
    { method: "POST", token },
  );
}
