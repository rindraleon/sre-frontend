import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ContactMessageEntry, ContactMessageStatus } from "@/types";
import {
  getContactMessageDetailApi,
  retryContactMessageEmailsApi,
  updateContactMessageStatusApi,
} from "@/services/contact-messages";
import { CONTACT_STATUS_LABELS } from "@/data";
import { useSre } from "@/contexts";

export function useContactMessageDetail(
  token: string,
  onEntryUpdated: (entry: ContactMessageEntry) => void,
) {
  const { notify } = useSre();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState<ContactMessageEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isRetryingEmails, setIsRetryingEmails] = useState(false);

  const open = useCallback(
    async (entryOrId: ContactMessageEntry | string) => {
      if (!token) return;
      const id = typeof entryOrId === "string" ? entryOrId : entryOrId.id;
      if (typeof entryOrId !== "string") setSelected(entryOrId);

      setIsLoading(true);
      try {
        const detailed = await getContactMessageDetailApi(token, id);
        setSelected(detailed);
        onEntryUpdated(detailed);
      } catch (cause) {
        notify(
          cause instanceof Error ? cause.message : "Impossible d'ouvrir le détail de ce message.",
          "error",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [token, notify, onEntryUpdated],
  );

  useEffect(() => {
    const messageId = searchParams.get("messageId");
    if (messageId && token && selected?.id !== messageId) void open(messageId);
  }, [searchParams, token, selected?.id, open]);

  const close = useCallback(() => {
    setSelected(null);
    if (searchParams.has("messageId")) {
      const next = new URLSearchParams(searchParams);
      next.delete("messageId");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const changeStatus = useCallback(
    async (status: ContactMessageStatus) => {
      if (!token || !selected) return;
      setIsStatusUpdating(true);
      try {
        const updated = await updateContactMessageStatusApi(token, selected.id, status);
        setSelected(updated);
        onEntryUpdated(updated);
        notify(`Statut mis à jour : « ${CONTACT_STATUS_LABELS[status]} ».`, "success");
      } catch (cause) {
        notify(
          cause instanceof Error ? cause.message : "Impossible de modifier le statut du message.",
          "error",
        );
      } finally {
        setIsStatusUpdating(false);
      }
    },
    [token, selected, notify, onEntryUpdated],
  );

  const retryEmails = useCallback(async () => {
    if (!token || !selected) return;
    setIsRetryingEmails(true);
    try {
      const response = await retryContactMessageEmailsApi(token, selected.id, "TOUS");
      setSelected(response.message);
      onEntryUpdated(response.message);
      notify("Relance des courriels effectuée.", "success");
    } catch (cause) {
      notify(
        cause instanceof Error ? cause.message : "Impossible de relancer les courriels.",
        "error",
      );
    } finally {
      setIsRetryingEmails(false);
    }
  }, [token, selected, notify, onEntryUpdated]);

  return {
    selected,
    isLoading,
    isStatusUpdating,
    isRetryingEmails,
    open,
    close,
    changeStatus,
    retryEmails,
  };
}
