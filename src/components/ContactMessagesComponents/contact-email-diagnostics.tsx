import { RotateCcw } from "lucide-react";
import { Button, StatusBadge } from "@/components";
import type { ContactMessageEntry } from "@/types";
import { hasFailedEmail } from "@/data";

export function ContactEmailDiagnostics({
  message,
  isRetrying,
  onRetry,
}: Readonly<{ message: ContactMessageEntry; isRetrying: boolean; onRetry: () => void }>) {
  return (
    <div className="mb-5 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/60 dark:bg-slate-900/50">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Traçabilité des notifications & accusés e-mail
        </span>
        {hasFailedEmail(message) && (
          <Button type="button" variant="secondary" disabled={isRetrying} onClick={onRetry}>
            <RotateCcw size={14} />{" "}
            {isRetrying ? "Relance en cours…" : "Relancer les envois en échec"}
          </Button>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-3 text-xs">
        <DiagnosticCard
          title="Notification e-mail admin"
          status={message.statutCourriel}
          error={message.derniereErreurCourriel}
        />
        <DiagnosticCard
          title="Accusé de réception visiteur"
          status={message.statutAccuse ?? "NON_CONFIGURE"}
          error={message.derniereErreurAccuse}
        />
        {message.statutCourrielReponse ? (
          <DiagnosticCard
            title="Courriel de réponse admin"
            status={message.statutCourrielReponse}
            error={message.derniereErreurCourrielReponse}
          />
        ) : (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5">
            <div className="text-slate-500 mb-1">Courriel de réponse admin</div>
            <span className="text-slate-400">Aucune réponse envoyée</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DiagnosticCard({
  title,
  status,
  error,
}: Readonly<{ title: string; status?: string | null; error?: string | null }>) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5">
      <div className="text-slate-500 mb-1">{title}</div>
      {status ? <StatusBadge status={status} /> : null}
      {error && <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
