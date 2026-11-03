import { StatusBadge } from "@/components";
import type { ContactReplyHistoryItem } from "@/types";
import { formatDate } from "@/utils";

export function ContactReplyHistory({
  replies,
}: Readonly<{ replies: readonly ContactReplyHistoryItem[] }>) {
  if (replies.length === 0) return null;
  return (
    <div className="mb-5">
      <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        Historique des réponses ({replies.length})
      </span>
      <div className="space-y-2.5">
        {replies.map((reply) => (
          <div
            key={reply.id}
            className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="font-semibold text-slate-800 dark:text-slate-100">
                {reply.sujet} · par {reply.reponduParNom}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">{formatDate(reply.reponduLe, true)}</span>
                <StatusBadge status={reply.statutCourriel} />
              </div>
            </div>
            <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-200 leading-relaxed">
              {reply.message}
            </div>
            {reply.erreurCourriel && (
              <p className="mt-1.5 text-red-600 dark:text-red-400">
                Erreur : {reply.erreurCourriel}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
