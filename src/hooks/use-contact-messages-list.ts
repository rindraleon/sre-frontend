import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ContactEmailStatus,
  ContactMessageEntry,
  ContactMessageSource,
  ContactMessagesCounts,
  ContactMessageStatus,
} from "@/types";
import { loadContactMessagesApi, notifyContactMessagesUpdated } from "@/services/contact-messages";
import {
  countByStatus,
  countUnread,
  type ContactFilterValue,
  type ContactSortOption,
} from "@/data";

export interface ContactMessageFilters {
  status: ContactFilterValue<ContactMessageStatus>;
  source: ContactFilterValue<ContactMessageSource>;
  emailStatus: ContactFilterValue<ContactEmailStatus>;
  sort: ContactSortOption;
  search: string;
}

const DEFAULT_FILTERS: ContactMessageFilters = {
  status: "TOUS",
  source: "TOUS",
  emailStatus: "TOUS",
  sort: "non_lus",
  search: "",
};

const EMPTY_COUNTS: ContactMessagesCounts = {
  nonLus: 0,
  lus: 0,
  enAttenteReponse: 0,
  repondus: 0,
};

export function useContactMessagesList(token: string) {
  const [messages, setMessages] = useState<ContactMessageEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [counts, setCounts] = useState<ContactMessagesCounts>(EMPTY_COUNTS);
  const [filters, setFilters] = useState<ContactMessageFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFilter = useCallback(
    <K extends keyof ContactMessageFilters>(key: K, value: ContactMessageFilters[K]) => {
      setFilters((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await loadContactMessagesApi(token, {
        statut: filters.status,
        source: filters.source,
        statutCourriel: filters.emailStatus,
        recherche: filters.search,
        tri: filters.sort,
        limite: 150,
      });
      setMessages(response.messages);
      setTotal(response.total);
      setUnread(response.unread);
      setCounts(response.counts ?? countByStatus(response.messages));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Impossible de charger les messages de contact.",
      );
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    void load();
  }, [load]);

  const synchronizeEntry = useCallback((updated: ContactMessageEntry) => {
    setMessages((previous) => {
      const next = previous.map((item) => (item.id === updated.id ? updated : item));
      setUnread(countUnread(next));
      setCounts(countByStatus(next));
      return next;
    });
    notifyContactMessagesUpdated();
  }, []);

  const filteredCount = useMemo(() => messages.length, [messages]);

  return {
    messages,
    filteredCount,
    total,
    unread,
    counts,
    filters,
    updateFilter,
    loading,
    error,
    reload: load,
    synchronizeEntry,
  };
}

export type ContactMessagesListState = ReturnType<typeof useContactMessagesList>;
