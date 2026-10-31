import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock3, Download, FileSpreadsheet, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader, DataTable, toTanstackColumns, EmptyState } from "@/components/ui";
import { createPaymentColumns } from "@/components/tables/admin/payments-columns";
import { useTableState } from "@/hooks";
import {
  EMPTY_PAYMENT_FILTERS,
  PaymentFilterBar,
  PaymentFilterSummary,
  countActiveFilters,
  toPaymentFilters,
  type PaymentFilterState,
} from "@/components/payments/payment-filter-bar";
import { downloadStatisticsExportApi, searchPaymentsApi } from "@/services/api-payments";
import { downloadPdfApi } from "@/services/api-client";
import type { Payment, PaymentPage } from "@/types";

const EMPTY_PAGE: PaymentPage = { donnees: [], total: 0, page: 1, parPage: 25, pages: 1 };

export function AdminPaymentsPage({ verificationOnly = false }: Readonly<{ verificationOnly?: boolean }>) {
  const { session } = useAuth();
  const { state, notify } = useSre();
  const table = useTableState(25);
  const [filters, setFilters] = useState<PaymentFilterState>(
    verificationOnly ? { ...EMPTY_PAYMENT_FILTERS, statut: "EN_VERIFICATION" } : EMPTY_PAYMENT_FILTERS,
  );
  const [applied, setApplied] = useState<PaymentFilterState>(filters);
  const [result, setResult] = useState<PaymentPage>(EMPTY_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState<"csv" | "pdf" | null>(null);

  const fetchPage = useCallback(
    async (filterState: PaymentFilterState, page: number, perPage: number) => {
      if (!session?.apiToken) return;
      setIsLoading(true);
      setError("");
      try {
        const data = await searchPaymentsApi(
          session.apiToken,
          toPaymentFilters(filterState, page, perPage),
        );
        setResult(data);
      } catch {
        setError("La recherche n’a pas abouti. Vérifiez les filtres ou réessayez.");
      } finally {
        setIsLoading(false);
      }
    },
    [session?.apiToken],
  );

  useEffect(() => {
    void fetchPage(applied, table.page, table.perPage);
  }, [applied, fetchPage, table.page, table.perPage]);

  const downloadReceipt = async (payment: Payment) => {
    if (!session?.apiToken || !payment.receipt) return;
    try {
      await downloadPdfApi(payment.receipt.id, session.apiToken, payment.receipt.number);
    } catch {
      notify("Le reçu n’a pas pu être téléchargé.", "error");
    }
  };

  const columns = useMemo(
    () =>
      createPaymentColumns({
        taxpayers: state.taxpayers,
        onDownloadReceipt: (payment) => void downloadReceipt(payment),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.taxpayers],
  );

  const exportFile = async (format: "csv" | "pdf") => {
    if (!session?.apiToken) return;
    setIsExporting(format);
    try {
      const { page: _page, parPage: _parPage, ...exportFilters } = toPaymentFilters(applied);
      await downloadStatisticsExportApi(session.apiToken, format, exportFilters);
      notify(`Export ${format.toUpperCase()} généré depuis les données serveur.`, "success");
    } catch {
      notify("L’export n’a pas pu être généré.", "error");
    } finally {
      setIsExporting(null);
    }
  };

  const activeFilters = countActiveFilters(applied);

  return (
    <div className="page-content-sre">
      <PageHeader
        title={verificationOnly ? "Transactions à suivre" : "Paiements"}
        description={
          verificationOnly
            ? "Déclarations en vérification : aucune n’a encore de reçu définitif."
            : "Recherche multicritère sur les paiements réels enregistrés (montants confirmés distingués des déclarés)."
        }
        breadcrumb={["Accueil", verificationOnly ? "Transactions à suivre" : "Paiements"]}
        actions={
          <>
            <button
              type="button"
              className="button-sre button-sre--outline"
              onClick={() => void fetchPage(applied, table.page, table.perPage)}
              disabled={isLoading}
            >
              <RefreshCw size={14} /> Actualiser
            </button>
            <button
              type="button"
              className="button-sre button-sre--outline"
              onClick={() => void exportFile("csv")}
              disabled={isExporting !== null}
            >
              <FileSpreadsheet size={14} /> {isExporting === "csv" ? "Export…" : "Export CSV"}
            </button>
            <button
              type="button"
              className="button-sre button-sre--primary"
              onClick={() => void exportFile("pdf")}
              disabled={isExporting !== null}
            >
              <Download size={14} /> {isExporting === "pdf" ? "Export…" : "Rapport PDF"}
            </button>
          </>
        }
      />
      {verificationOnly && (
        <div className="tax-note-sre" style={{ marginBottom: 12 }}>
          <Clock3 size={15} />
          <p>
            {result.total} déclaration(s) à examiner. Une confirmation par rapprochement
            administratif déclenche l’émission automatique du reçu.
          </p>
        </div>
      )}
      <PaymentFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => {
          const reset = verificationOnly
            ? { ...EMPTY_PAYMENT_FILTERS, statut: "EN_VERIFICATION" }
            : EMPTY_PAYMENT_FILTERS;
          setFilters(reset);
          setApplied(reset);
          table.resetPage();
        }}
        onSubmit={() => {
          setApplied({ ...filters });
          table.resetPage();
        }}
        taxpayers={state.taxpayers}
        taxTypes={state.taxTypes}
        isSearching={isLoading}
      />
      <PaymentFilterSummary
        filters={applied}
        taxpayers={state.taxpayers}
        taxTypes={state.taxTypes}
        total={result.total}
      />
      {error && (
        <div className="security-alert-banner-sre" role="alert">
          <span>!</span>
          <div>
            <strong>Recherche impossible</strong>
            <p>{error}</p>
          </div>
        </div>
      )}
      {isLoading && result.donnees.length === 0 ? (
        <div className="inline-loader-sre">
          <i /> Chargement des paiements depuis le serveur…
        </div>
      ) : !isLoading && result.donnees.length === 0 ? (
        <EmptyState
          title="Aucun paiement ne correspond"
          description={
            activeFilters
              ? "Assouplissez les filtres pour élargir la recherche."
              : "Les paiements enregistrés apparaîtront ici."
          }
        />
      ) : (
        <DataTable
          data={result.donnees}
          columns={toTanstackColumns(columns)}
          label={verificationOnly ? "Transactions à suivre" : "Paiements"}
          getRowId={(payment) => payment.id}
          searchPlaceholder="Filtrer la page affichée…"
          searchValue={table.search}
          onSearchChange={table.changeSearch}
          columnToggle
          page={table.page}
          rowsPerPage={table.perPage}
          onPageChange={table.changePage}
          onRowsPerPageChange={table.changePerPage}
        />
      )}
      <p className="text-help-sre">
        Page {result.page} sur {result.pages} · {result.total} paiement(s) correspondant aux
        filtres, pagination assurée par le serveur.
      </p>
    </div>
  );
}
