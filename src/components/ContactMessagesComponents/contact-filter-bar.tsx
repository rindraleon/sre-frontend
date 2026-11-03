import { Search } from "lucide-react";
import { Card, CardContent, Input, Select } from "@/components";
import type { ContactEmailStatus, ContactMessageSource, ContactMessageStatus } from "@/types";
import {
  CONTACT_EMAIL_STATUS_FILTER_OPTIONS,
  CONTACT_SORT_OPTIONS,
  CONTACT_SOURCE_FILTER_OPTIONS,
  CONTACT_STATUS_FILTER_OPTIONS,
  type ContactFilterValue,
  type ContactSortOption,
} from "@/data";

const LABEL_CLASS = "block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1";

export function ContactFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  source,
  onSourceChange,
  emailStatus,
  onEmailStatusChange,
  sort,
  onSortChange,
}: Readonly<{
  search: string;
  onSearchChange: (value: string) => void;
  status: ContactFilterValue<ContactMessageStatus>;
  onStatusChange: (value: ContactFilterValue<ContactMessageStatus>) => void;
  source: ContactFilterValue<ContactMessageSource>;
  onSourceChange: (value: ContactFilterValue<ContactMessageSource>) => void;
  emailStatus: ContactFilterValue<ContactEmailStatus>;
  onEmailStatusChange: (value: ContactFilterValue<ContactEmailStatus>) => void;
  sort: ContactSortOption;
  onSortChange: (value: ContactSortOption) => void;
}>) {
  return (
    <Card className="mb-5">
      <CardContent className="pt-5">
        <div className="grid gap-3 md:grid-cols-12 items-end">
          <div className="md:col-span-4 relative">
            <label htmlFor="search-contact-messages" className={LABEL_CLASS}>
              Rechercher
            </label>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <Input
                id="search-contact-messages"
                aria-label="Rechercher dans les messages"
                placeholder="Nom, e-mail, référence MSG-..., sujet ou texte…"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="filter-status-contact" className={LABEL_CLASS}>
              Statut
            </label>
            <Select
              id="filter-status-contact"
              aria-label="Filtrer par statut du message"
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as ContactFilterValue<ContactMessageStatus>)
              }
            >
              <option value="TOUS">Tous les statuts</option>
              {CONTACT_STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="filter-source-contact" className={LABEL_CLASS}>
              Origine
            </label>
            <Select
              id="filter-source-contact"
              aria-label="Filtrer par origine"
              value={source}
              onChange={(event) =>
                onSourceChange(event.target.value as ContactFilterValue<ContactMessageSource>)
              }
            >
              <option value="TOUS">Toutes les origines</option>
              {CONTACT_SOURCE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="filter-email-contact" className={LABEL_CLASS}>
              Notification e-mail
            </label>
            <Select
              id="filter-email-contact"
              aria-label="Filtrer par statut d'e-mail"
              value={emailStatus}
              onChange={(event) =>
                onEmailStatusChange(event.target.value as ContactFilterValue<ContactEmailStatus>)
              }
            >
              <option value="TOUS">Tous les envois</option>
              {CONTACT_EMAIL_STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="sort-contact-messages" className={LABEL_CLASS}>
              Trier par
            </label>
            <Select
              id="sort-contact-messages"
              aria-label="Trier les messages"
              value={sort}
              onChange={(event) => onSortChange(event.target.value as ContactSortOption)}
            >
              {CONTACT_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
