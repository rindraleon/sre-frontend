import { useCallback, useEffect, useState } from "react";
import { CalendarRange, Download, FileSpreadsheet, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader, EmptyState, Select } from "@/components/ui";
import {
  EMPTY_PAYMENT_FILTERS,
  PaymentFilterBar,
  PaymentFilterSummary,
  countActiveFilters,
  toPaymentFilters,
  type PaymentFilterState,
} from "@/components/payments/payment-filter-bar";
import { downloadStatisticsExportApi, loadStatisticsApi } from "@/services/api-payments";
import { formatMoney, formatDate } from "@/utils/format";
import { PAYMENT_STATUS_LABELS } from "@/constants/payment-statuses";
import type { Statistics } from "@/types";

function firstDayOfYear() {
  return `${new Date().getFullYear()}-01-01`;
}

export function AdminReportsPage() {
  const { session } = useAuth();
  const { state, notify } = useSre();
  const [filters, setFilters] = useState<PaymentFilterState>({
    ...EMPTY_PAYMENT_FILTERS,
    du: firstDayOfYear(),
    au: new Date().toISOString().slice(0, 10),
  });
  const [applied, setApplied] = useState<PaymentFilterState>(filters);
  const [granularity, setGranularity] = useState<"jour" | "mois" | "trimestre" | "annee">("mois");
  const [stats, setStats] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState<"csv" | "pdf" | null>(null);

  const load = useCallback(async () => {
    if (!session?.apiToken) return;
    setIsLoading(true);
    setError("");
    try {
      const { page: _page, parPage: _parPage, ...apiFilters } = toPaymentFilters(applied);
      setStats(
        await loadStatisticsApi(session.apiToken, { ...apiFilters, granularite: granularity }),
      );
    } catch {
      setError("Le rapport n’a pas pu être calculé. Vérifiez les filtres appliqués.");
    } finally {
      setIsLoading(false);
    }
  }, [applied, granularity, session?.apiToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const exportFile = async (format: "csv" | "pdf") => {
    if (!session?.apiToken) return;
    setIsExporting(format);
    try {
      const { page: _page, parPage: _parPage, ...apiFilters } = toPaymentFilters(applied);
      await downloadStatisticsExportApi(session.apiToken, format, apiFilters);
      notify(
        format === "csv"
          ? "Export CSV (compatible Excel) généré depuis les données serveur."
          : "Rapport PDF généré depuis les données serveur.",
        "success",
      );
    } catch {
      notify("L’export n’a pas pu être généré.", "error");
    } finally {
      setIsExporting(null);
    }
  };

  const indicators = stats?.indicateurs;
  const activeFilters = countActiveFilters(applied);

  return (
    <div className="page-content-sre">
      <PageHeader
        title="Rapports et exports"
        description="Rapports cohérents avec les filtres appliqués. Les fichiers CSV et PDF sont produits par le serveur à partir des paiements réels."
        breadcrumb={["Accueil", "Rapports"]}
        actions={
          <>
            <button
              type="button"
              className="button-sre button-sre--outline"
              onClick={() => void load()}
              disabled={isLoading}
            >
              <RefreshCw size={14} /> {isLoading ? "Calcul…" : "Recalculer"}
            </button>
            <button
              type="button"
              className="button-sre button-sre--outline"
              onClick={() => void exportFile("csv")}
              disabled={isExporting !== null}
            >
              <FileSpreadsheet size={14} /> {isExporting === "csv" ? "Export…" : "Export Excel (CSV)"}
            </button>
            <button
              type="button"
              className="button-sre button-sre--primary"
              onClick={() => void exportFile("pdf")}
              disabled={isExporting !== null}
            >
              <Download size={14} /> {isExporting === "pdf" ? "Export…" : "Export PDF"}
            </button>
          </>
        }
      />
      <PaymentFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => {
          const reset = { ...EMPTY_PAYMENT_FILTERS, du: firstDayOfYear(), au: new Date().toISOString().slice(0, 10) };
          setFilters(reset);
          setApplied(reset);
        }}
        onSubmit={() => setApplied({ ...filters })}
        taxpayers={state.taxpayers}
        taxTypes={state.taxTypes}
        isSearching={isLoading}
      />
      <PaymentFilterSummary
        filters={applied}
        taxpayers={state.taxpayers}
        taxTypes={state.taxTypes}
        total={indicators?.totalDeclarations}
      />
      <div className="form-actions-sre" style={{ justifyContent: "flex-start" }}>
        <label className="compact-filter-sre">
          <CalendarRange size={13} /> Granularité
          <Select
            value={granularity}
            onChange={(event) => setGranularity(event.target.value as typeof granularity)}
          >
            <option value="jour">Par jour</option>
            <option value="mois">Par mois</option>
            <option value="trimestre">Par trimestre</option>
            <option value="annee">Par année</option>
          </Select>
        </label>
      </div>
      {error && (
        <div className="security-alert-banner-sre" role="alert">
          <span>!</span>
          <div>
            <strong>Rapport indisponible</strong>
            <p>{error}</p>
          </div>
        </div>
      )}
      {isLoading && !stats ? (
        <div className="inline-loader-sre">
          <i /> Calcul du rapport depuis la base de données…
        </div>
      ) : !stats || !indicators ? (
        <EmptyState
          title="Aucun résultat"
          description={activeFilters ? "Aucun paiement ne correspond aux filtres." : "Aucune donnée disponible."}
        />
      ) : (
        <>
          <div className="kpi-grid-sre">
            <div className="kpi-sre is-confirmed">
              <span>Montant confirmé</span>
              <strong>{formatMoney(indicators.montantConfirme)}</strong>
              <small>{indicators.nombrePaiementsConfirmes} paiement(s)</small>
            </div>
            <div className="kpi-sre">
              <span>Montant déclaré total</span>
              <strong>{formatMoney(indicators.montantDeclareTotal)}</strong>
              <small>{indicators.totalDeclarations} déclaration(s)</small>
            </div>
            <div className="kpi-sre">
              <span>En attente</span>
              <strong>{formatMoney(indicators.montantEnAttente)}</strong>
              <small>{indicators.nombreEnAttente} paiement(s)</small>
            </div>
            <div className="kpi-sre">
              <span>Non aboutis</span>
              <strong>{formatMoney(indicators.montantNonAbouti)}</strong>
              <small>{indicators.nombreNonAbouti} paiement(s)</small>
            </div>
          </div>
          <div className="payment-detail-grid-sre" style={{ marginTop: 14 }}>
            <section className="card-sre">
              <div className="card-sre__header">
                <div>
                  <h2>Par nature d’impôt</h2>
                  <p>Déclarations et montants confirmés</p>
                </div>
              </div>
              <table className="table-sre">
                <thead>
                  <tr>
                    <th>Nature</th>
                    <th>Déclarations</th>
                    <th>Confirmés</th>
                    <th>Montant confirmé</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.parNatureImpot.map((row) => (
                    <tr key={row.nature}>
                      <td>{row.nature}</td>
                      <td>{row.declarations}</td>
                      <td>{row.confirmes}</td>
                      <td>{formatMoney(row.montantConfirme)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section className="card-sre">
              <div className="card-sre__header">
                <div>
                  <h2>Par statut</h2>
                  <p>Suivi des déclarations</p>
                </div>
              </div>
              <table className="table-sre">
                <thead>
                  <tr>
                    <th>Statut</th>
                    <th>Déclarations</th>
                    <th>Montant déclaré</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.parStatut.map((row) => (
                    <tr key={row.statut}>
                      <td>{PAYMENT_STATUS_LABELS[row.statut] ?? row.statut}</td>
                      <td>{row.declarations}</td>
                      <td>{formatMoney(row.montant)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
          <section className="card-sre" style={{ marginTop: 14 }}>
            <div className="card-sre__header">
              <div>
                <h2>Évolution</h2>
                <p>Montants confirmés par période · généré le {formatDate(stats.genereLe, true)}</p>
              </div>
            </div>
            <table className="table-sre">
              <thead>
                <tr>
                  <th>Période</th>
                  <th>Déclarations</th>
                  <th>Confirmés</th>
                  <th>Montant confirmé</th>
                </tr>
              </thead>
              <tbody>
                {stats.evolution.map((row) => (
                  <tr key={row.periode}>
                    <td>{row.periode}</td>
                    <td>{row.declarations}</td>
                    <td>{row.confirmes}</td>
                    <td>{formatMoney(row.montantConfirme)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
