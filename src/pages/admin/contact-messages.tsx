import { useCallback, useEffect, useMemo, useState } from "react";
import { Mail, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Button,
  DataTable,
  PageHeader,
  StatusBadge,
  toTanstackColumns,
  type TableColumn,
} from "@/components/ui";
import { useTableState } from "@/hooks";
import {
  loadContactMessagesApi,
  markContactMessageAsReadApi,
} from "@/services/api-client";
import type { ContactMessageEntry } from "@/types";
import { formatDate } from "@/utils/format";

const columns: TableColumn<ContactMessageEntry>[] = [
  {
    id: "date",
    title: "Reçu le",
    render: (entry) => formatDate(entry.creeLe, true),
    sortValue: (entry) => entry.creeLe,
  },
  {
    id: "expediteur",
    title: "Expéditeur",
    render: (entry) => (
      <div>
        <strong>{entry.nom}</strong>
        <small className="sub-row-sre">{entry.courriel}</small>
      </div>
    ),
    sortValue: (entry) => entry.nom,
  },
  {
    id: "sujet",
    title: "Sujet",
    render: (entry) => (
      <div>
        <strong>{entry.sujet}</strong>
        <small className="sub-row-sre">{entry.message}</small>
      </div>
    ),
    sortValue: (entry) => entry.sujet,
  },
  {
    id: "statut",
    title: "Statut",
    render: (entry) => <StatusBadge status={entry.lue ? "LUE" : "NON_LU"} />,
    sortValue: (entry) => (entry.lue ? 1 : 0),
  },
  {
    id: "courriel",
    title: "Notification e-mail",
    render: (entry) => <StatusBadge status={entry.statutCourriel} />,
    sortValue: (entry) => entry.statutCourriel,
  },
];

export function AdminContactMessagesPage() {
  const { session } = useAuth();
  const table = useTableState(20);
  const [messages, setMessages] = useState<ContactMessageEntry[]>([]);
  const [unread, setUnread] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!session?.apiToken) return;
    setLoading(true);
    setLoadingError(null);
    try {
      const response = await loadContactMessagesApi(session.apiToken, {
        recherche: table.search,
        limite: 200,
      });
      setMessages(response.messages);
      setUnread(response.unread);
      setTotal(response.total);
    } catch (cause) {
      setLoadingError(
        cause instanceof Error
          ? cause.message
          : "Impossible de charger les messages du formulaire de contact.",
      );
    } finally {
      setLoading(false);
    }
  }, [session?.apiToken, table.search]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const markAsRead = useCallback(
    async (entry: ContactMessageEntry) => {
      if (!session?.apiToken || entry.lue) return;
      setMessages((current) =>
        current.map((row) => (row.id === entry.id ? { ...row, lue: true } : row)),
      );
      setUnread((count) => Math.max(0, count - 1));
      try {
        await markContactMessageAsReadApi(session.apiToken, entry.id);
      } catch (cause) {
        setLoadingError(
          cause instanceof Error
            ? cause.message
            : "Impossible de marquer le message comme lu.",
        );
        void loadMessages();
      }
    },
    [session?.apiToken, loadMessages],
  );

  const subtitle = useMemo(
    () => `${total} message${total === 1 ? "" : "s"} — ${unread} non lu${unread === 1 ? "" : "s"}`,
    [total, unread],
  );

  return (
    <div className="page-content-sre">
      <PageHeader
        title="Messages du site public"
        description="Messages reçus via le formulaire de contact du portail. Chaque message est conservé dans le portail ; le courriel aux administrateurs n’est qu’une notification."
        breadcrumb={["Accueil", "Messages du site public"]}
        actions={
          <Button variant="outline" onClick={() => void loadMessages()} loading={loading}>
            <RefreshCw size={15} /> Actualiser
          </Button>
        }
      />
      {loadingError && (
        <p className="error-message-sre" role="alert">
          {loadingError}
        </p>
      )}
      <DataTable
        data={messages}
        columns={toTanstackColumns(columns)}
        label="Messages du site public"
        getRowId={(entry) => entry.id}
        searchPlaceholder="Nom, e-mail, sujet, message…"
        searchValue={table.search}
        onSearchChange={table.changeSearch}
        toolbarActions={
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        }
        columnToggle
        onRowClick={(entry) => void markAsRead(entry)}
        emptyTitle={loading ? "Chargement…" : "Aucun message"}
        emptyDescription={
          loading
            ? "Récupération des messages depuis le serveur."
            : "Aucun message n’a encore été envoyé depuis le formulaire public de contact."
        }
        page={table.page}
        rowsPerPage={table.perPage}
        onPageChange={table.changePage}
        onRowsPerPageChange={table.changePerPage}
      />
      <p className="contact-message-hint-sre">
        <Mail size={14} aria-hidden="true" /> Un clic sur une ligne marque le message comme
        lu. La colonne « Notification e-mail » indique si l’alerte par courriel a pu être
        envoyée ; le message reste de toute façon consultable ici.
      </p>
    </div>
  );
}
