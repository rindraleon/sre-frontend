import { useCallback, useEffect, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Button,
  DataTable,
  PageHeader,
  StatusBadge,
  convertirColonnesTanstack,
  type TableColumn,
} from "@/components/ui";
import { useTableState } from "@/hooks";
import { loadActivityLogApi } from "@/services/api-client";
import type { ActivityLogEntry } from "@/types";
import { formatDate } from "@/utils/format";

const colonnes: TableColumn<ActivityLogEntry>[] = [
  {
    id: "date",
    titre: "Date",
    afficher: (entree) => formatDate(entree.date, true),
    valeurTri: (entree) => entree.date,
  },
  {
    id: "acteur",
    titre: "Acteur",
    afficher: (entree) => (
      <div>
        <strong>{entree.acteur}</strong>
        {entree.details && <small className="sous-ligne-sre">{entree.details}</small>}
      </div>
    ),
    valeurTri: (entree) => entree.acteur,
  },
  {
    id: "role",
    titre: "Rôle",
    afficher: (entree) => <StatusBadge statut={entree.role} />,
    valeurTri: (entree) => entree.role,
  },
  {
    id: "action",
    titre: "Action",
    afficher: (entree) => entree.action,
    valeurTri: (entree) => entree.action,
  },
  {
    id: "ressource",
    titre: "Ressource",
    afficher: (entree) => entree.ressource,
    valeurTri: (entree) => entree.ressource,
  },
  
  {
    id: "resultat",
    titre: "Résultat",
    afficher: (entree) => <StatusBadge statut={entree.resultat} />,
    valeurTri: (entree) => entree.resultat,
  },
];

export function AdminActivityLogPage() {
  const { session } = useAuth();
  const table = useTableState(20);
  const [entrees, setEntrees] = useState<ActivityLogEntry[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreurChargement, setErreurChargement] = useState<string | null>(null);

  const chargerJournal = useCallback(async () => {
    if (!session?.jetonApi) return;
    setChargement(true);
    setErreurChargement(null);
    try {
      setEntrees(await loadActivityLogApi(session.jetonApi, 500));
    } catch (cause) {
      setErreurChargement(
        cause instanceof Error ? cause.message : "Impossible de charger le journal d’activité.",
      );
    } finally {
      setChargement(false);
    }
  }, [session?.jetonApi]);

  useEffect(() => {
    void chargerJournal();
  }, [chargerJournal]);

  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Journal d’activité"
        description="Actions réalisées par les comptes : acteur, ressource, résultat et horodatage."
        filAriane={["Accueil", "Journal d’activité"]}
        actions={
          <Button variante="contour" onClick={() => void chargerJournal()} chargement={chargement}>
            <RefreshCw size={15} /> Actualiser
          </Button>
        }
      />
      <div className="bandeau-info-sre">
        <span>
          <Activity size={17} />
        </span>
        <div>
          <strong>Traçabilité serveur</strong>
          <p>
            Chaque action métier (création, modification, suppression, décision) est enregistrée par
            le serveur, succès comme échec, avec son auteur et son horodatage.
          </p>
        </div>
      </div>
      {erreurChargement && (
        <p className="message-erreur-sre" role="alert">
          {erreurChargement}
        </p>
      )}
      <DataTable
        data={entrees}
        columns={convertirColonnesTanstack(colonnes)}
        label="Journal d’activité"
        getRowId={(entree) => entree.id}
        searchPlaceholder="Acteur, action, ressource, référence…"
        searchValue={table.recherche}
        onSearchChange={table.rechercher}
        toolbarActions={
          <span className="text-xs text-muted-foreground">
            {entrees.length} événement{entrees.length === 1 ? "" : "s"}
          </span>
        }
        columnToggle
        emptyTitle={chargement ? "Chargement…" : "Aucun événement"}
        emptyDescription={
          chargement
            ? "Récupération du journal depuis le serveur."
            : "Réglez un compte puis réalisez une action : chaque écriture serveur apparaîtra ici."
        }
        page={table.page}
        rowsPerPage={table.parPage}
        onPageChange={table.changerPage}
        onRowsPerPageChange={table.changerParPage}
      />
    </div>
  );
}
