import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components";
import { useAuth } from "@/contexts";
import { ContactFilterBar } from "@/components/ContactMessagesComponents";
import { ContactMessageDetail } from "@/components/ContactMessagesComponents";
import { ContactMessageList } from "@/components/ContactMessagesComponents";
import { ContactStatusSummary } from "@/components/ContactMessagesComponents";
import { useContactMessagesInbox } from "@/hooks";

export function AdminContactMessagesPage() {
  const { session } = useAuth();
  const token = session?.apiToken ?? "";
  const { list, detail, reply } = useContactMessagesInbox(token);

  return (
    <div className="min-w-0">
      <div className="mb-[21px]">
        <div>
          <span className="">Administration · Messagerie centralisée</span>
          <h1 className="m-0 text-[clamp(24px,2.15vw,30px)] leading-[1.2] font-[770] tracking-[-0.9px] text-sre-ink">
            Messagerie & demandes de contact
          </h1>
          <p className="mt-[7px] mb-0 text-[13px] leading-[1.65] text-sre-muted">
            Consultez les messages reçus depuis le formulaire public et l’espace contribuable, gérez
            leur statut de suivi et répondez directement par e-mail aux expéditeurs.
          </p>
        </div>
        <div className="">
          <Button
            type="button"
            variant="secondary"
            disabled={list.loading}
            onClick={() => void list.reload()}
          >
            <RefreshCw size={15} /> Actualiser
          </Button>
        </div>
      </div>

      <ContactStatusSummary
        counts={list.counts}
        unread={list.unread}
        total={list.total}
        activeFilter={list.filters.status}
        onFilterChange={(status) => list.updateFilter("status", status)}
      />

      <ContactFilterBar
        search={list.filters.search}
        onSearchChange={(value) => list.updateFilter("search", value)}
        status={list.filters.status}
        onStatusChange={(value) => list.updateFilter("status", value)}
        source={list.filters.source}
        onSourceChange={(value) => list.updateFilter("source", value)}
        emailStatus={list.filters.emailStatus}
        onEmailStatusChange={(value) => list.updateFilter("emailStatus", value)}
        sort={list.filters.sort}
        onSortChange={(value) => list.updateFilter("sort", value)}
      />

      {list.error && (
        <div
          className="mb-[15px] flex items-start gap-[11px] rounded-[10px] border border-[#f0dddd] bg-[#fbf1f1] px-[15px] py-3 text-[#a44849] dark:border-[#6e3438] dark:bg-[#3a1d20] dark:text-[#f0b6b8]"
          role="alert"
        >
          <AlertTriangle size={16} />
          <span>{list.error}</span>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-12 items-start">
        <div className={detail.selected ? "lg:col-span-5 w-full" : "lg:col-span-12 w-full"}>
          <ContactMessageList
            messages={list.messages}
            selectedId={detail.selected?.id}
            unread={list.unread}
            loading={list.loading}
            onOpen={(entry) => void detail.open(entry)}
          />
        </div>

        {detail.selected && (
          <div className="lg:col-span-7 w-full" data-testid="contact-message-detail-panel">
            <ContactMessageDetail
              message={detail.selected}
              isLoading={detail.isLoading}
              isStatusUpdating={detail.isStatusUpdating}
              isRetryingEmails={detail.isRetryingEmails}
              onClose={detail.close}
              onStatusChange={(status) => void detail.changeStatus(status)}
              onRetryEmails={() => void detail.retryEmails()}
              reply={reply}
            />
          </div>
        )}
      </div>
    </div>
  );
}
