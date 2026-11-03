import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock3, Download, FileSpreadsheet, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts";
import { useSre } from "@/contexts";
import {
  Button,
  DataTable,
  EmptyState,
  INLINE_LOADER_CLASS,
  PAGE_CONTENT_CLASS,
  PageHeader,
  SECURITY_ALERT_BANNER_CLASS,
  TAX_NOTE_CLASS,
  TEXT_HELP_CLASS,
  toTanstackColumns,
} from "@/components";
import {
  EMPTY_PAYMENT_FILTERS,
  PaymentFilterBar,
  PaymentFilterSummary,
  countActiveFilters,
  toPaymentFilters,
  type PaymentFilterState,
} from "@/components/PaymentsComponents";
import { createPaymentColumns as createAdminPaymentColumns } from "@/components/PaymentsComponents/tables/admin";
import { downloadStatisticsExportApi, searchPaymentsApi } from "@/services/payments";
import { useTableState } from "@/hooks";
import { downloadPdfApi } from "@/services/documents";
import type { Payment, PaymentPage } from "@/types";

const EMPTY_PAGE: PaymentPage = { donnees: [], total: 0, page: 1, parPage: 25, pages: 1 };

export function AdminPaymentsPage({
  verificationOnly = false,
}: Readonly<{ verificationOnly?: boolean }>) {
  const { session } = useAuth();
  const { state, notify } = useSre();
  const table = useTableState(25);
  const [filters, setFilters] = useState<PaymentFilterState>(
    verificationOnly
      ? { ...EMPTY_PAYMENT_FILTERS, statut: "EN_VERIFICATION" }
      : EMPTY_PAYMENT_FILTERS,
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
      } catch (cause) {
        console.error("Recherche de paiements impossible.", cause);
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
    } catch (cause) {
      console.error("Téléchargement du reçu impossible.", cause);
      notify("Le reçu n’a pas pu être téléchargé.", "error");
    }
  };

  const columns = useMemo(
    () =>
      createAdminPaymentColumns({
        taxpayers: state.taxpayers,
        onDownloadReceipt: (payment) => void downloadReceipt(payment),
      }),
    [state.taxpayers],
  );

  const exportFile = async (format: "csv" | "pdf") => {
    if (!session?.apiToken) return;
    setIsExporting(format);
    try {
      const { page: _page, parPage: _parPage, ...exportFilters } = toPaymentFilters(applied);
      await downloadStatisticsExportApi(session.apiToken, format, exportFilters);
      notify(`Export ${format.toUpperCase()} généré depuis les données serveur.`, "success");
    } catch (cause) {
      console.error("Export des paiements impossible.", cause);
      notify("L’export n’a pas pu être généré.", "error");
    } finally {
      setIsExporting(null);
    }
  };

  const activeFilters = countActiveFilters(applied);

  return (
    <div className={PAGE_CONTENT_CLASS}>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => void fetchPage(applied, table.page, table.perPage)}
              disabled={isLoading}
            >
              <RefreshCw size={14} /> Actualiser
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void exportFile("csv")}
              disabled={isExporting !== null}
            >
              <FileSpreadsheet size={14} /> {isExporting === "csv" ? "Export…" : "Export CSV"}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => void exportFile("pdf")}
              disabled={isExporting !== null}
            >
              <Download size={14} /> {isExporting === "pdf" ? "Export…" : "Rapport PDF"}
            </Button>
          </>
        }
      />
      {verificationOnly && (
        <div className={TAX_NOTE_CLASS} style={{ marginBottom: 12 }}>
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
        <div className={SECURITY_ALERT_BANNER_CLASS} role="alert">
          <span>!</span>
          <div>
            <strong>Recherche impossible</strong>
            <p>{error}</p>
          </div>
        </div>
      )}
      {isLoading && result.donnees.length === 0 ? (
        <div className={INLINE_LOADER_CLASS}>
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
      <p className={TEXT_HELP_CLASS}>
        Page {result.page} sur {result.pages} · {result.total} paiement(s) correspondant aux
        filtres, pagination assurée par le serveur.
      </p>
    </div>
  );
}
