import { useCallback, useEffect, useMemo, useState } from "react";
import { BellRing, History, Send, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import {
  Button,
  DataTable,
  Modal,
  PageHeader,
  Select,
  StatusBadge,
  toTanstackColumns,
  type TableColumn,
} from "@/components/ui";
import { OptionsSelect } from "@/components/forms/options-select";
import { FormField, FormError } from "@/components/forms/form-field";
import {
  createOverdueColumns,
  SITUATION_LABELS,
} from "@/components/tables/admin/overdue-columns";
import { useTableState } from "@/hooks";
import { callApi } from "@/services/api-client";
import type { CampaignSummary, DispatchHistoryEntry, OverdueRow } from "@/types";
import { formatDate, formatMoney } from "@/utils/format";

const DEFAULT_TEMPLATE =
  "Bonjour {nom},\n\nLe dossier {reference} ({typeImpot}, période {periode}) présente un retard de {joursRetard} jour(s) au {echeance}, pour un montant de {montant}.\nMerci de régulariser votre situation en suivant les démarches indiquées dans votre espace.\n\nService Régional des Impôts — Haute Matsiatra";

const SITUATION_OPTIONS = [
  { value: "TOUS", label: "Toutes les situations" },
  ...Object.entries(SITUATION_LABELS).map(([value, label]) => ({ value, label })),
];

const ENTITY_TYPE_OPTIONS = [
  { value: "TOUS", label: "Toutes les entités" },
  { value: "PARTICULIER", label: "Particuliers" },
  { value: "ENTREPRISE", label: "Entreprises" },
];

const historyColumns: TableColumn<DispatchHistoryEntry>[] = [
  {
    id: "date",
    title: "Date",
    render: (entry) => formatDate(entry.dateEnvoi),
    sortValue: (entry) => entry.dateEnvoi,
  },
  {
    id: "destinataire",
    title: "Destinataire",
    render: (entry) => (
      <div>
        <strong>{entry.destinataire.nom}</strong>
        <small className="sub-row-sre">{entry.destinataire.courriel}</small>
      </div>
    ),
    sortValue: (entry) => entry.destinataire.nom,
  },
  {
    id: "dossier",
    title: "Dossier",
    render: (entry) => entry.dossier.reference,
    sortValue: (entry) => entry.dossier.reference,
  },
  {
    id: "auteur",
    title: "Initiée par",
    render: (entry) => entry.initiePar,
    sortValue: (entry) => entry.initiePar,
  },
  {
    id: "statut",
    title: "Statut d’envoi",
    render: (entry) => <StatusBadge status={entry.statutCourriel} />,
    sortValue: (entry) => entry.statutCourriel,
  },
  {
    id: "error",
    title: "Détail",
    render: (entry) => entry.derniereErreurCourriel ?? "—",
  },
];

export function AdminOverduePage() {
  const { session } = useAuth();
  const { notify } = useSre();
  const table = useTableState();
  const [rows, setRows] = useState<OverdueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [situation, setSituation] = useState("TOUS");
  const [typeEntity, setTypeEntity] = useState("TOUS");
  const [includeSettled, setIncludeSettled] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [modalDispatch, setModalDispatch] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState(
    "Notification de retard — dossier fiscal",
  );
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_TEMPLATE);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [dispatchInProgress, setDispatchInProgress] = useState(false);
  const [summary, setSummary] = useState<CampaignSummary | null>(null);
  const [history, setHistory] = useState<DispatchHistoryEntry[]>([]);

  const loadOverdue = useCallback(async () => {
    if (!session?.apiToken) return;
    setLoading(true);
    setLoadingError(null);
    try {
      const settings = new URLSearchParams();
      if (includeSettled) settings.set("inclureRegularises", "true");
      const query = settings.toString();
      const response = await callApi<OverdueRow[]>(
        "admin/retards" + (query ? `?${query}` : ""),
        { token: session.apiToken },
      );
      setRows(response);
    } catch (cause) {
      setLoadingError(
        cause instanceof Error ? cause.message : "Impossible de charger les dossiers en retard.",
      );
    } finally {
      setLoading(false);
    }
  }, [session?.apiToken, includeSettled]);

  const loadHistory = useCallback(async () => {
    if (!session?.apiToken) return;
    try {
      setHistory(
        await callApi<DispatchHistoryEntry[]>("admin/notifications/historique-envois", {
          token: session.apiToken,
        }),
      );
    } catch {
      // The history remains viewable even if loading it fails.
    }
  }, [session?.apiToken]);

  useEffect(() => {
    void loadOverdue();
  }, [loadOverdue]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (situation !== "TOUS" && row.situation !== situation) return false;
        if (typeEntity !== "TOUS" && row.entite.type !== typeEntity) return false;
        return true;
      }),
    [rows, situation, typeEntity],
  );

  const validSelection = useMemo(
    () =>
      filteredRows
        .filter((row) => selected.has(row.obligationId))
        .filter((row) => row.situation !== "REGULARISE"),
    [filteredRows, selected],
  );

  const sendCampaign = async () => {
    if (!session?.apiToken || validSelection.length === 0) return;
    setDispatchInProgress(true);
    setDispatchError(null);
    try {
      const result = await callApi<CampaignSummary>("admin/notifications/groupes", {
        method: "POST",
        token: session.apiToken,
        body: {
          obligationIds: validSelection.map((row) => row.obligationId),
          titre: notificationTitle.trim() || undefined,
          message: messageTemplate,
        },
      });
      setSummary(result);
      setModalDispatch(false);
      setSelected(new Set());
      const message = `Campagne terminée : ${result.notificationsCreees} notification(s) créée(s), ${result.dejaEnvoyees} déjà envoyée(s), ${result.echecs} échec(s), ${result.ignorees} ignorée(s).`;
      notify(message, result.echecs > 0 ? "warning" : "success");
      await loadHistory();
    } catch (cause) {
      setDispatchError(
        cause instanceof Error ? cause.message : "L’envoi groupé a échoué. Réessayez.",
      );
    } finally {
      setDispatchInProgress(false);
    }
  };

  const columns = createOverdueColumns();

  return (
    <div className="page-content-sre">
      <PageHeader
        title="Retards & notifications"
        description="Dossiers en retard et notifications groupées aux entités concernées."
        breadcrumb={["Accueil", "Retards & notifications"]}
      />
      {loadingError && (
        <p className="error-message-sre" role="alert">
          {loadingError}
        </p>
      )}
      <DataTable
        data={filteredRows}
        columns={toTanstackColumns(columns)}
        label="Dossiers en retard"
        getRowId={(row) => row.obligationId}
        searchPlaceholder="Entité, STAT ou référence…"
        searchValue={table.search}
        onSearchChange={table.changeSearch}
        selectable
        selectedRowIds={selected}
        onSelectedRowIdsChange={(ids) => setSelected(new Set(ids))}
        toolbarActions={
          <>
            <label className="compact-filter-sre">
              Situation
              <Select
                value={situation}
                onChange={(event) => {
                  setSituation(event.target.value);
                  table.resetPage();
                }}
              >
                <OptionsSelect options={SITUATION_OPTIONS} />
              </Select>
            </label>
            <label className="compact-filter-sre">
              Entité
              <Select
                value={typeEntity}
                onChange={(event) => {
                  setTypeEntity(event.target.value);
                  table.resetPage();
                }}
              >
                <OptionsSelect options={ENTITY_TYPE_OPTIONS} />
              </Select>
            </label>
            <label className="compact-filter-sre inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={includeSettled}
                onChange={(event) => setIncludeSettled(event.target.checked)}
              />
              Inclure les régularisés
            </label>
          </>
        }
        actionPrimary={
          <Button
            onClick={() => {
              setDispatchError(null);
              setModalDispatch(true);
            }}
            disabled={validSelection.length === 0 || dispatchInProgress}
          >
            <Send size={15} /> Envoyer une notification
            {validSelection.length > 0 && ` (${validSelection.length})`}
          </Button>
        }
        columnToggle
        emptyTitle={loading ? "Chargement…" : "Aucun dossier en retard"}
        emptyDescription={
          loading
            ? "Récupération des dossiers depuis le serveur."
            : "Aucun dossier ne correspond à ces critères."
        }
        page={table.page}
        rowsPerPage={table.perPage}
        onPageChange={table.changePage}
        onRowsPerPageChange={table.changePerPage}
      />

      <section className="mt-6">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <History size={15} /> Historique des envois groupés
        </h2>
        <DataTable
          data={history}
          columns={toTanstackColumns(historyColumns)}
          label="Historique des envois groupés"
          getRowId={(entry) => entry.id}
          columnToggle
          emptyTitle="Aucun envoi"
          emptyDescription="Les campagnes envoyées apparaîtront ici."
          page={1}
          rowsPerPage={10}
          onPageChange={() => undefined}
          onRowsPerPageChange={() => undefined}
        />
      </section>

      <Modal
        open={modalDispatch}
        title="Envoyer une notification groupée"
        description={`${validSelection.length} destinataire(s) sélectionné(s). Vérifiez le récapitulatif avant l’envoi.`}
        close={() => {
          if (!dispatchInProgress) setModalDispatch(false);
        }}
        disableClose={dispatchInProgress}
        width="large"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setModalDispatch(false)}
              disabled={dispatchInProgress}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={() => void sendCampaign()}
              loading={dispatchInProgress}
              disabled={dispatchInProgress || validSelection.length === 0}
            >
              {dispatchInProgress ? (
                "Envoi en cours…"
              ) : (
                <>
                  <Send size={15} /> Confirmer l’envoi
                </>
              )}
            </Button>
          </>
        }
      >
        <div className="form-sre">
          <FormField label="Titre de la notification" required>
            {(p) => (
              <input
                {...p}
                className="field-simple-sre"
                value={notificationTitle}
                onChange={(event) => setNotificationTitle(event.target.value)}
                maxLength={160}
              />
            )}
          </FormField>
          <FormField
            label="Message"
            help="Variables par destinataire : {nom} {reference} {typeImpot} {periode} {echeance} {joursRetard} {montant}"
            required
          >
            {(p) => (
              <textarea
                {...p}
                className="field-simple-sre"
                rows={7}
                value={messageTemplate}
                onChange={(event) => setMessageTemplate(event.target.value)}
              />
            )}
          </FormField>
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Users size={13} /> Destinataires ({validSelection.length})
            </p>
            <ul className="max-h-40 overflow-y-auto rounded-md border border-border p-2 text-xs">
              {validSelection.map((row) => (
                <li key={row.obligationId} className="flex items-center justify-between py-0.5">
                  <span>{row.entite.nom}</span>
                  <span className="text-muted-foreground">
                    {row.referenceFiscale} · {formatMoney(Number(row.montant))}
                  </span>
                </li>
              ))}
              {validSelection.length === 0 && (
                <li className="text-muted-foreground">
                  Aucun destinataire valide (les dossiers régularisés sont exclus).
                </li>
              )}
            </ul>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BellRing size={13} />
            Les notifications in-app sont créées pour chaque entité ; les courriels dépendent de la
            configuration du transport. Les envois déjà effectués aujourd’hui pour un même dossier
            sont ignorés.
          </p>
          <FormError message={dispatchError} />
        </div>
      </Modal>

      {summary && (
        <section className="mt-6 rounded-md border border-border p-4">
          <h2 className="mb-2 text-sm font-bold">Résultat de la dernière campagne</h2>
          <p className="mb-2 text-xs text-muted-foreground">
            {summary.notificationsCreees} créée(s) · {summary.dejaEnvoyees} déjà envoyée(s) ·{" "}
            {summary.ignorees} ignorée(s) · {summary.echecs} échec(s) · {summary.courrielsEnvoyes}{" "}
            courriel(s) remis · {summary.courrielsNonConfigures} sans transport
          </p>
          <ul className="flex flex-col gap-1 text-xs">
            {summary.details.map((detail) => (
              <li key={`${detail.obligationId}-${detail.resultat}`} className="flex gap-2">
                <StatusBadge status={detail.resultat} />
                <span>
                  {detail.destinataire} ({detail.reference}) —{" "}
                  {detail.erreur ?? `courriel : ${detail.statutCourriel}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
