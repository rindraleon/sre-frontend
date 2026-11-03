import { useCallback, useEffect, useState } from "react";
import type { ContactMessageEntry } from "@/types";
import { replyContactMessageApi } from "@/services/contact-messages";
import { useSre } from "@/contexts";

export interface ReplyBanner {
  tone: "success" | "warning" | "danger";
  text: string;
  detail?: string | null;
}

export function defaultReplySubject(message: ContactMessageEntry): string {
  if (message.sujetReponse) return message.sujetReponse;
  return message.sujet.toLowerCase().startsWith("re:") ? message.sujet : `Re: ${message.sujet}`;
}

export function useContactReply(
  token: string,
  message: ContactMessageEntry | null,
  onEntryUpdated: (entry: ContactMessageEntry) => void,
) {
  const { notify } = useSre();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [banner, setBanner] = useState<ReplyBanner | null>(null);

  const messageId = message?.id;
  const initialSubject = message ? defaultReplySubject(message) : "";
  useEffect(() => {
    setBanner(null);
    setSubject(initialSubject);
    setBody("");
  }, [messageId]);

  const send = useCallback(async () => {
    if (!token || !message) return false;
    const trimmedBody = body.trim();
    if (trimmedBody.length < 5) {
      notify("Veuillez saisir une réponse d'au moins 5 caractères.", "warning");
      return false;
    }

    setIsSending(true);
    setBanner(null);
    try {
      const response = await replyContactMessageApi(token, message.id, {
        sujet: subject.trim() || undefined,
        message: trimmedBody,
      });
      onEntryUpdated(response.message);

      switch (response.resultat) {
        case "ENVOYE":
        case "CAPTURE":
          setBody("");
          setBanner({ tone: "success", text: response.confirmation });
          notify(response.confirmation, "success");
          break;
        case "NON_CONFIGURE":
          setBody("");
          setBanner({ tone: "warning", text: response.confirmation });
          notify(response.confirmation, "info");
          break;
        default:
          setBanner({
            tone: "danger",
            text: response.confirmation,
            detail: response.erreurCourriel,
          });
          notify(response.confirmation, "warning");
      }
      return true;
    } catch (cause) {
      const message_ = cause instanceof Error ? cause.message : "Échec de l'envoi de la réponse.";
      setBanner({ tone: "danger", text: message_ });
      notify(message_, "error");
      return false;
    } finally {
      setIsSending(false);
    }
  }, [token, message, body, subject, notify, onEntryUpdated]);

  return { subject, setSubject, body, setBody, isSending, banner, send };
}
