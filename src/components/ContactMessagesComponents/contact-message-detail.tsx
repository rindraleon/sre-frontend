import { UserRound, X } from "lucide-react";
import { Button, Card, CardContent, StatusBadge } from "@/components";
import type { ContactMessageEntry, ContactMessageStatus } from "@/types";
import { formatDate } from "@/utils";
import {
  CONTACT_STATUS_LABELS,
  CONTACT_STATUS_ORDER,
  CONTACT_SOURCE_LABELS,
  messageReference,
  resolveMessageStatus,
} from "@/data";
import { ContactEmailDiagnostics } from "./contact-email-diagnostics";
import { ContactReplyHistory } from "./contact-reply-history";
import { ContactReplyForm } from "./contact-reply-form";
import type { ReplyBanner } from "@/hooks";

const SECTION_LABEL_CLASS =
  "block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400";

export function ContactMessageDetail({
  message,
  isLoading,
  isStatusUpdating,
  isRetryingEmails,
  onClose,
  onStatusChange,
  onRetryEmails,
  reply,
}: Readonly<{
  message: ContactMessageEntry;
  isLoading: boolean;
  isStatusUpdating: boolean;
  isRetryingEmails: boolean;
  onClose: () => void;
  onStatusChange: (status: ContactMessageStatus) => void;
  onRetryEmails: () => void;
  reply: {
    subject: string;
    setSubject: (value: string) => void;
    body: string;
    setBody: (value: string) => void;
    isSending: boolean;
    banner: ReplyBanner | null;
    send: () => void;
  };
}>) {
  const status = resolveMessageStatus(message);

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {messageReference(message)}
              </span>
              <StatusBadge status={status} />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {CONTACT_SOURCE_LABELS[message.source ?? "SITE_PUBLIC"]}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{message.sujet}</h2>
          </div>

          <Button
            type="button"
            variant="ghost"
            aria-label="Fermer le détail du message"
            onClick={onClose}
          >
            <X size={16} /> Fermer
          </Button>
        </div>

        {isLoading && <p className="text-xs text-slate-500 mb-3">Synchronisation du message…</p>}

        <SenderCard message={message} />

        <div className="mb-4">
          <span className={`${SECTION_LABEL_CLASS} mb-2`}>Gérer le statut du message</span>
          <div className="flex flex-wrap gap-2">
            {CONTACT_STATUS_ORDER.map((candidate) => {
              const isActive = status === candidate;
              return (
                <Button
                  key={candidate}
                  type="button"
                  variant={isActive ? "primary" : "secondary"}
                  disabled={isStatusUpdating || isActive}
                  onClick={() => onStatusChange(candidate)}
                >
                  {CONTACT_STATUS_LABELS[candidate]}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="mb-5">
          <span className={`${SECTION_LABEL_CLASS} mb-1.5`}>Contenu complet du message</span>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-100">
            {message.message}
          </div>
        </div>

        <ContactEmailDiagnostics
          message={message}
          isRetrying={isRetryingEmails}
          onRetry={onRetryEmails}
        />

        <ContactReplyHistory replies={message.historiqueReponses ?? []} />

        <ContactReplyForm
          message={message}
          subject={reply.subject}
          onSubjectChange={reply.setSubject}
          body={reply.body}
          onBodyChange={reply.setBody}
          isSending={reply.isSending}
          banner={reply.banner}
          onSend={reply.send}
        />
      </CardContent>
    </Card>
  );
}

function SenderCard({ message }: Readonly<{ message: ContactMessageEntry }>) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 mb-4 text-xs">
      <div className="flex items-start gap-2.5">
        <UserRound size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <div className="text-slate-500 dark:text-slate-400">Expéditeur</div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm">{message.nom}</div>
          <a
            href={`mailto:${message.courriel}`}
            className="text-blue-600 dark:text-blue-400 underline"
          >
            {message.courriel}
          </a>
        </div>
      </div>

      <div className="space-y-1">
        <div>
          <span className="text-slate-500 dark:text-slate-400">Reçu le : </span>
          <strong className="text-slate-800 dark:text-slate-200">
            {formatDate(message.creeLe, true)}
          </strong>
        </div>
        {message.luLe && (
          <div>
            <span className="text-slate-500 dark:text-slate-400">Consulté le : </span>
            <strong className="text-slate-800 dark:text-slate-200">
              {formatDate(message.luLe, true)}
            </strong>
          </div>
        )}
        {message.reponduLe && (
          <div>
            <span className="text-slate-500 dark:text-slate-400">Dernière réponse : </span>
            <strong className="text-slate-800 dark:text-slate-200">
              {formatDate(message.reponduLe, true)}
              {message.reponduParNom ? ` par ${message.reponduParNom}` : ""}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
}
