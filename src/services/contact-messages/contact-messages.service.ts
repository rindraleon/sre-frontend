import { callApi } from "@/services/api";
import { buildQueryString } from "@/utils";
import type {
  ContactEmailRetryType,
  ContactEmailStatus,
  ContactMessageEntry,
  ContactMessageSource,
  ContactMessageStatus,
  ContactMessagesResponse,
  ContactMessagesUnreadResponse,
  ContactReplyResponse,
  PublicContactSubmissionResponse,
} from "@/types";

export const CONTACT_MESSAGES_UPDATED_EVENT = "sre:contact-messages-updated";

export function notifyContactMessagesUpdated(unread?: number): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONTACT_MESSAGES_UPDATED_EVENT, { detail: { unread } }));
}

export interface ContactMessagesQuery {
  nonLus?: boolean;
  statut?: ContactMessageStatus | "TOUS";
  statutCourriel?: ContactEmailStatus | "TOUS";
  source?: ContactMessageSource | "TOUS";
  recherche?: string;
  tri?: "non_lus" | "date_desc" | "date_asc" | "statut" | "expediteur";
  limite?: number;
}

export async function loadContactMessagesUnreadCountApi(
  token: string,
): Promise<ContactMessagesUnreadResponse> {
  return callApi<ContactMessagesUnreadResponse>("admin/messages-contact/non-lus", { token });
}

export async function loadContactMessagesApi(
  token: string,
  query: ContactMessagesQuery = {},
): Promise<ContactMessagesResponse> {
  const search = buildQueryString({
    nonLus: query.nonLus,
    statut: query.statut,
    statutCourriel: query.statutCourriel,
    source: query.source,
    recherche: query.recherche,
    tri: query.tri,
    limite: query.limite,
  });
  const response = await callApi<ContactMessagesResponse>(`admin/messages-contact${search}`, {
    token,
  });
  notifyContactMessagesUpdated(response.unread);
  return response;
}

export async function getContactMessageDetailApi(
  token: string,
  id: string,
  doNotMarkRead = false,
): Promise<ContactMessageEntry> {
  const search = doNotMarkRead ? "?nePasMarquerLu=true" : "";
  const entry = await callApi<ContactMessageEntry>(
    `admin/messages-contact/${encodeURIComponent(id)}${search}`,
    { token },
  );
  notifyContactMessagesUpdated();
  return entry;
}

export async function updateContactMessageStatusApi(
  token: string,
  id: string,
  statut: ContactMessageStatus,
): Promise<ContactMessageEntry> {
  const entry = await callApi<ContactMessageEntry>(
    `admin/messages-contact/${encodeURIComponent(id)}/statut`,
    { token, method: "PATCH", body: { statut } },
  );
  notifyContactMessagesUpdated();
  return entry;
}

export async function replyContactMessageApi(
  token: string,
  id: string,
  payload: { sujet?: string; message: string },
): Promise<ContactReplyResponse> {
  const response = await callApi<ContactReplyResponse>(
    `admin/messages-contact/${encodeURIComponent(id)}/repondre`,
    { token, method: "POST", body: payload },
  );
  notifyContactMessagesUpdated();
  return response;
}

export function retryContactMessageEmailsApi(
  token: string,
  id: string,
  type: ContactEmailRetryType = "TOUS",
): Promise<{ message: ContactMessageEntry; relances: Record<string, string | null | undefined> }> {
  return callApi(`admin/messages-contact/${encodeURIComponent(id)}/renvoyer-courriel`, {
    token,
    method: "POST",
    body: { type },
  });
}

export function submitPublicContactApi(payload: {
  nom: string;
  courriel: string;
  sujet: string;
  message: string;
  siteWeb: string;
}): Promise<PublicContactSubmissionResponse> {
  return callApi<PublicContactSubmissionResponse>("contact", { method: "POST", body: payload });
}
