import { useState } from "react";
import { AlertTriangle, CheckCircle2, MessageSquareReply, Send, Sparkles } from "lucide-react";
import { Button, Input, Textarea } from "@/components";
import type { ContactMessageEntry } from "@/types";
import { QUICK_REPLY_TEMPLATES } from "@/data";
import type { ReplyBanner } from "@/hooks";

export function ContactReplyForm({
  message,
  subject,
  onSubjectChange,
  body,
  onBodyChange,
  isSending,
  banner,
  onSend,
}: Readonly<{
  message: ContactMessageEntry;
  subject: string;
  onSubjectChange: (value: string) => void;
  body: string;
  onBodyChange: (value: string) => void;
  isSending: boolean;
  banner: ReplyBanner | null;
  onSend: () => void;
}>) {
  const [templateError, setTemplateError] = useState<string | null>(null);
  const bannerToneClasses: Record<ReplyBanner["tone"], string> = {
    success:
      "bg-emerald-100/80 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800",
    warning:
      "bg-amber-100/80 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200 border border-amber-300 dark:border-amber-800",
    error:
      "bg-red-100/80 text-red-900 dark:bg-red-950/70 dark:text-red-200 border border-red-300 dark:border-red-800",
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
      className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 p-4"
      aria-label="Répondre directement par e-mail"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <MessageSquareReply size={18} className="text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Répondre directement à {message.nom} ({message.courriel})
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Sparkles size={12} /> Modèles :
          </span>
          {QUICK_REPLY_TEMPLATES.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => {
                try {
                  onBodyChange(template.build(message));
                  setTemplateError(null);
                } catch (cause) {
                  console.error("Modèle de réponse indisponible.", cause);
                  setTemplateError("Ce modèle n'a pas pu être généré.");
                }
              }}
              className="text-xs px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>

      {templateError && (
        <p className="mb-2 text-xs text-red-600 dark:text-red-400" role="alert">
          {templateError}
        </p>
      )}

      {banner && (
        <output
          data-testid="contact-reply-confirmation"
          className={`mb-3 rounded-lg p-3 text-xs font-medium flex items-start gap-2 ${bannerToneClasses[banner.tone]}`}
        >
          {banner.tone === "success" ? (
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          )}
          <div>
            <div>{banner.text}</div>
            {banner.detail && (
              <div className="mt-1 opacity-85">Détail technique : {banner.detail}</div>
            )}
          </div>
        </output>
      )}

      <div className="space-y-3">
        <div>
          <label
            htmlFor="reply-subject-input"
            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Objet du courriel de réponse
          </label>
          <Input
            id="reply-subject-input"
            value={subject}
            onChange={(event) => onSubjectChange(event.target.value)}
            placeholder={`Re: ${message.sujet}`}
            required
          />
        </div>

        <div>
          <label
            htmlFor="reply-body-textarea"
            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Votre réponse (envoyée à {message.courriel})
          </label>
          <Textarea
            id="reply-body-textarea"
            rows={5}
            value={body}
            onChange={(event) => onBodyChange(event.target.value)}
            placeholder="Rédigez votre réponse officielle à destination de l'expéditeur…"
            required
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-xs text-slate-500">
            La réponse sera enregistrée dans le dossier et marquera le message comme « Répondu ».
          </span>
          <Button
            type="submit"
            variant="primary"
            disabled={isSending || body.trim().length < 5}
            data-testid="send-contact-reply-button"
          >
            <Send size={15} />{" "}
            {isSending ? "Envoi de la réponse…" : "Envoyer la réponse par e-mail"}
          </Button>
        </div>
      </div>
    </form>
  );
}
