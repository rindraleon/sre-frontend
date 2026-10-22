import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
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
import { loadActivityLogApi } from "@/services/api-client";
import type { ActivityLogEntry } from "@/types";
import { formatDate } from "@/utils/format";

const columns: TableColumn<ActivityLogEntry>[] = [
  {
    id: "date",
    title: "Date",
    render: (entry) => formatDate(entry.date, true),
    sortValue: (entry) => entry.date,
  },
  {
    id: "acteur",
    title: "Acteur",
    render: (entry) => (
      <div>
        <strong>{entry.acteur}</strong>
        {entry.details && <small className="sub-row-sre">{entry.details}</small>}
      </div>
    ),
    sortValue: (entry) => entry.acteur,
  },
  {
    id: "role",
    title: "Rôle",
    render: (entry) => <StatusBadge status={entry.role} />,
    sortValue: (entry) => entry.role,
  },
  {
    id: "action",
    title: "Action",
    render: (entry) => entry.action,
    sortValue: (entry) => entry.action,
  },
  {
    id: "ressource",
    title: "Ressource",
    render: (entry) => entry.ressource,
    sortValue: (entry) => entry.ressource,
  },
  
  {
    id: "resultat",
    title: "Résultat",
    render: (entry) => <StatusBadge status={entry.resultat} />,
    sortValue: (entry) => entry.resultat,
  },
];

export function AdminActivityLogPage() {
  const { session } = useAuth();
  const table = useTableState(20);
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const loadLog = useCallback(async () => {
    if (!session?.apiToken) return;
    setLoading(true);
    setLoadingError(null);
    try {
      setEntries(await loadActivityLogApi(session.apiToken, 500));
    } catch (cause) {
      setLoadingError(
        cause instanceof Error ? cause.message : "Impossible de charger le journal d’activité.",
      );
    } finally {
      setLoading(false);
    }
  }, [session?.apiToken]);

  useEffect(() => {
    void loadLog();
  }, [loadLog]);

  return (
    <div className="page-content-sre">
      <PageHeader
        title="Journal d’activité"
        description="Actions réalisées par les comptes : acteur, ressource, résultat et horodatage."
        breadcrumb={["Accueil", "Journal d’activité"]}
        actions={
          <Button variant="outline" onClick={() => void loadLog()} loading={loading}>
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
        data={entries}
        columns={toTanstackColumns(columns)}
        label="Journal d’activité"
        getRowId={(entry) => entry.id}
        searchPlaceholder="Acteur, action, ressource, référence…"
        searchValue={table.search}
        onSearchChange={table.changeSearch}
        toolbarActions={
          <span className="text-xs text-muted-foreground">
            {entries.length} événement{entries.length === 1 ? "" : "s"}
          </span>
        }
        columnToggle
        emptyTitle={loading ? "Chargement…" : "Aucun événement"}
        emptyDescription={
          loading
            ? "Récupération du journal depuis le serveur."
            : "Réglez un compte puis réalisez une action : chaque écriture serveur apparaîtra ici."
        }
        page={table.page}
        rowsPerPage={table.perPage}
        onPageChange={table.changePage}
        onRowsPerPageChange={table.changePerPage}
      />
    </div>
  );
}
