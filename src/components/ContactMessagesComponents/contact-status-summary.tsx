import type { ContactMessageStatus, ContactMessagesCounts } from "@/types";
import { CONTACT_STATUS_CARDS, statusCardValue, type ContactFilterValue } from "@/data";

export function ContactStatusSummary({
  counts,
  unread,
  total,
  activeFilter,
  onFilterChange,
}: Readonly<{
  counts: ContactMessagesCounts;
  unread: number;
  total: number;
  activeFilter: ContactFilterValue<ContactMessageStatus>;
  onFilterChange: (status: ContactFilterValue<ContactMessageStatus>) => void;
}>) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mb-5"
      role="region"
      aria-label="Synthèse des messages par statut"
    >
      {CONTACT_STATUS_CARDS.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.key;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onFilterChange(card.key)}
            aria-pressed={isActive}
            className={`text-left rounded-xl border p-3.5 transition-all ${
              isActive
                ? card.activeClass
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{card.label}</span>
              <Icon size={15} className={card.iconClass} />
            </div>
            <div className={`mt-1.5 text-2xl font-bold ${card.valueClass}`}>
              {statusCardValue(card.key, counts, unread, total)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
