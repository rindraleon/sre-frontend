import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarRange,
  CircleDollarSign,
  Clock3,
  FileSpreadsheet,
  RefreshCw,
  Users,
  WalletCards,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader, StatusBadge, EmptyState } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { ROUTES_ADMIN } from "@/constants";
import { loadStatisticsApi } from "@/services/api-payments";
import { formatMoney, formatDate } from "@/utils/format";
import { PAYMENT_STATUS_LABELS } from "@/constants/payment-statuses";
import type { Statistics } from "@/types";

const GRANULARITIES = [
  { value: "jour", label: "Par jour" },
  { value: "mois", label: "Par mois" },
  { value: "trimestre", label: "Par trimestre" },
  { value: "annee", label: "Par année" },
] as const;

function ChartBars({
  rows,
  emptyLabel,
}: Readonly<{
  rows: Array<{ label: string; value: number; display: string }>;
  emptyLabel: string;
}>) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  if (!rows.length) return <p className="text-help-sre">{emptyLabel}</p>;
  return (
    <div className="chart-bars-sre">
      {rows.map((row) => (
        <div className="chart-bars-sre__row" key={row.label}>
          <span title={row.label}>{row.label}</span>
          <span className="chart-bars-sre__track">
            <i style={{ width: `${Math.max(2, Math.round((row.value / max) * 100))}%` }} />
          </span>
          <strong>{row.display}</strong>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboardPage() {
  const { session } = useAuth();
  const { state } = useSre();
  const [granularity, setGranularity] = useState<"jour" | "mois" | "trimestre" | "annee">("mois");
  const [stats, setStats] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!session?.apiToken) return;
    setIsLoading(true);
    setError("");
    try {
      setStats(await loadStatisticsApi(session.apiToken, { granularite: granularity }));
    } catch {
      setError("Les statistiques ne sont pas disponibles pour le moment.");
    } finally {
      setIsLoading(false);
    }
  }, [granularity, session?.apiToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const indicators = stats?.indicateurs;
  const activeTaxpayers = state.taxpayers.filter((taxpayer) => taxpayer.status === "ACTIF");
  const byNature = useMemo(
    () =>
      (stats?.parNatureImpot ?? [])
        .filter((row) => row.declarations > 0)
        .slice(0, 8)
        .map((row) => ({
          label: row.nature,
          value: row.montantConfirme,
          display: formatMoney(row.montantConfirme),
        })),
    [stats?.parNatureImpot],
  );
  const evolutionRows = useMemo(
    () =>
      (stats?.evolution ?? []).slice(-10).map((row) => ({
        label: row.periode,
        value: row.montantConfirme,
        display: formatMoney(row.montantConfirme),
      })),
    [stats?.evolution],
  );

  return (
    <div className="page-content-sre">
      <PageHeader
        title="Tableau de bord"
        description={`Indicateurs calculés sur les paiements réellement enregistrés · périmètre ${stats?.perimetre ?? "régional"} · généré le ${stats ? formatDate(stats.genereLe, true) : "—"}. Les montants confirmés sont distingués des montants déclarés.`}
        breadcrumb={["Accueil", "Tableau de bord"]}
        actions={
          <>
            <Select
              value={granularity}
              onChange={(event) =>
                setGranularity(event.target.value as typeof granularity)
              }
              aria-label="Granularité de l’évolution"
            >
              {GRANULARITIES.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </Select>
            <button
              type="button"
              className="button-sre button-sre--outline"
              onClick={() => void load()}
              disabled={isLoading}
            >
              <RefreshCw size={14} /> Actualiser
            </button>
            <Link className="button-sre button-sre--primary" to={ROUTES_ADMIN.reports}>
              <FileSpreadsheet size={14} /> Rapports
            </Link>
          </>
        }
      />

      {error && (
        <div className="security-alert-banner-sre" role="alert" style={{ marginBottom: 12 }}>
          <AlertTriangle size={16} />
          <div>
            <strong>Statistiques indisponibles</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {isLoading && !stats ? (
        <div className="inline-loader-sre">
          <i /> Calcul des indicateurs depuis la base de données…
        </div>
      ) : !stats || !indicators ? (
        <EmptyState
          title="Aucune donnée statistique"
          description="Les indicateurs apparaîtront dès que des paiements seront enregistrés."
        />
      ) : (
        <>
          <div className="kpi-grid-sre">
            <div className="kpi-sre is-confirmed">
              <span>
                <BadgeCheck size={13} /> Montant confirmé
              </span>
              <strong>{formatMoney(indicators.montantConfirme)}</strong>
              <small>{indicators.nombrePaiementsConfirmes} paiement(s) confirmé(s)</small>
            </div>
            <div className="kpi-sre">
              <span>
                <WalletCards size={13} /> Total des paiements
              </span>
              <strong>{indicators.totalDeclarations}</strong>
              <small>{formatMoney(indicators.montantDeclareTotal)} déclarés</small>
            </div>
            <div className="kpi-sre">
              <span>
                <Clock3 size={13} /> En attente
              </span>
              <strong>{formatMoney(indicators.montantEnAttente)}</strong>
              <small>{indicators.nombreEnAttente} paiement(s) sans reçu</small>
            </div>
            <div className="kpi-sre">
              <span>
                <AlertTriangle size={13} /> Non aboutis
              </span>
              <strong>{formatMoney(indicators.montantNonAbouti)}</strong>
              <small>
                {indicators.nombreNonAbouti} échec(s)/annulation(s)/rejet(s) ·{" "}
                {indicators.nombreEchecs} échec(s)
              </small>
            </div>
            <div className="kpi-sre">
              <span>
                <Users size={13} /> Contribuables payeurs
              </span>
              <strong>{indicators.nombreContribuablesPayeurs}</strong>
              <small>{activeTaxpayers.length} contribuable(s) actif(s) au total</small>
            </div>
          </div>

          <div className="payment-detail-grid-sre" style={{ marginTop: 14 }}>
            <section className="card-sre">
              <div className="card-sre__header">
                <div>
                  <h2>Répartition par nature d’impôt</h2>
                  <p>Montants confirmés</p>
                </div>
                <CircleDollarSign size={17} />
              </div>
              <ChartBars rows={byNature} emptyLabel="Aucun paiement confirmé par nature." />
            </section>
            <section className="card-sre">
              <div className="card-sre__header">
                <div>
                  <h2>Répartition par statut</h2>
                  <p>Toutes déclarations de la période</p>
                </div>
                <CalendarRange size={17} />
              </div>
              <ChartBars
                rows={(stats.parStatut ?? []).map((row) => ({
                  label: PAYMENT_STATUS_LABELS[row.statut] ?? row.statut,
                  value: row.declarations,
                  display: `${row.declarations}`,
                }))}
                emptyLabel="Aucune déclaration enregistrée."
              />
            </section>
          </div>

          <div className="payment-detail-grid-sre" style={{ marginTop: 14 }}>
            <section className="card-sre">
              <div className="card-sre__header">
                <div>
                  <h2>Évolution ({GRANULARITIES.find((g) => g.value === granularity)?.label})</h2>
                  <p>Montants confirmés par période</p>
                </div>
              </div>
              <ChartBars rows={evolutionRows} emptyLabel="Aucune période à afficher." />
            </section>
            <section className="card-sre">
              <div className="card-sre__header">
                <div>
                  <h2>Principaux contribuables</h2>
                  <p>Montants confirmés (10 premiers)</p>
                </div>
              </div>
              <ul className="mini-list-sre">
                {(stats.principauxContribuables ?? []).map((row) => (
                  <li key={row.id}>
                    <span>
                      <strong>{row.nom}</strong>
                      <small>
                        {row.nif ? `NIF ${row.nif} · ` : ""}
                        {row.paiementsConfirmes} paiement(s)
                      </small>
                    </span>
                    <strong>{formatMoney(row.montantConfirme)}</strong>
                  </li>
                ))}
                {!(stats.principauxContribuables ?? []).length && (
                  <li>
                    <span>
                      <strong>Aucun paiement confirmé</strong>
                      <small>Les contributions apparaîtront après confirmation.</small>
                    </span>
                  </li>
                )}
              </ul>
            </section>
          </div>

          <section className="card-sre" style={{ marginTop: 14 }}>
            <div className="card-sre__header">
              <div>
                <h2>Transactions à suivre</h2>
                <p>Déclarations sans reçu définitif : en attente, échec, annulation ou rejet</p>
              </div>
              <Link className="button-sre button-sre--outline" to={ROUTES_ADMIN.payments}>
                Voir tous les paiements
              </Link>
            </div>
            <ul className="mini-list-sre">
              {(stats.aSuivre ?? []).map((row) => (
                <li key={row.id}>
                  <span>
                    <strong>
                      {row.referenceInterne} · {row.contribuable}
                    </strong>
                    <small>
                      {row.nature ?? "Nature non précisée"} · {formatDate(row.dateTransaction)} ·{" "}
                      {formatMoney(row.montant)}
                    </small>
                  </span>
                  <StatusBadge status={row.statut} />
                </li>
              ))}
              {!(stats.aSuivre ?? []).length && (
                <li>
                  <span>
                    <strong>Aucune transaction en souffrance</strong>
                    <small>Toutes les déclarations sont confirmées.</small>
                  </span>
                </li>
              )}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
