import { Card, CardContent, CardHeader, CardTitle, EmptyState, StatusBadge } from "@/components";
import type { ContactMessageEntry } from "@/types";
import { formatDate } from "@/utils";
import { CONTACT_SOURCE_LABELS, messageReference, resolveMessageStatus } from "@/data";

export function ContactMessageList({
  messages,
  selectedId,
  unread,
  loading,
  onOpen,
}: Readonly<{
  messages: readonly ContactMessageEntry[];
  selectedId?: string;
  unread: number;
  loading: boolean;
  onOpen: (entry: ContactMessageEntry) => void;
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Boîte de réception</CardTitle>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {messages.length} message(s) affiché(s) · {unread} non lu(s)
        </p>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <EmptyState
            title={loading ? "Chargement en cours…" : "Aucun message trouvé"}
            description="Les messages envoyés depuis le formulaire de contact public ou l'espace client apparaissent ici en temps réel."
          />
        ) : (
          <div
            className="divide-y divide-slate-200 dark:divide-slate-800"
            role="list"
            aria-label="Liste des messages de contact"
          >
            {messages.map((item) => (
              <ContactMessageRow
                key={item.id}
                entry={item}
                isSelected={selectedId === item.id}
                onOpen={onOpen}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContactMessageRow({
  entry,
  isSelected,
  onOpen,
}: Readonly<{
  entry: ContactMessageEntry;
  isSelected: boolean;
  onOpen: (entry: ContactMessageEntry) => void;
}>) {
  const status = resolveMessageStatus(entry);
  const isUnread = status === "NON_LU" || !entry.lue;

  const stateClass = isSelected
    ? "bg-blue-50/90 dark:bg-blue-950/50 ring-1 ring-blue-500/40"
    : isUnread
      ? "bg-amber-50/40 dark:bg-amber-950/20 hover:bg-slate-50 dark:hover:bg-slate-800/60"
      : "hover:bg-slate-50 dark:hover:bg-slate-800/50";

  return (
    <div
      role="listitem"
      data-testid={`contact-message-row-${entry.id}`}
      onClick={() => onOpen(entry)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(entry);
        }
      }}
      tabIndex={0}
      className={`cursor-pointer p-4 transition-colors rounded-lg ${stateClass}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          {isUnread && (
            <span
              className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"
              title="Message non lu"
            />
          )}
          <span
            className={`truncate text-sm ${
              isUnread
                ? "font-bold text-slate-900 dark:text-white"
                : "font-semibold text-slate-800 dark:text-slate-200"
            }`}
          >
            {entry.nom}
          </span>
          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {messageReference(entry)}
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(entry.creeLe, true)}
        </span>
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex flex-wrap items-center gap-2">
        <span>{entry.courriel}</span>
        <span>·</span>
        <span>{CONTACT_SOURCE_LABELS[entry.source ?? "SITE_PUBLIC"]}</span>
      </div>

      <div
        className={`text-sm mb-1 ${
          isUnread
            ? "font-semibold text-slate-900 dark:text-white"
            : "font-medium text-slate-700 dark:text-slate-300"
        }`}
      >
        {entry.sujet}
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2.5">
        {entry.message}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={status} />
          {entry.statutAccuse && <StatusBadge status={entry.statutAccuse} />}
          {entry.statutCourriel === "ECHEC" && <StatusBadge status="ECHEC" />}
        </div>

        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
          {isSelected ? "Ouvert" : "Ouvrir & répondre →"}
        </span>
      </div>
    </div>
  );
}
