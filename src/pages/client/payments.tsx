import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CircleDollarSign, Download, ReceiptText } from "lucide-react";
import {
  Select,
  PageHeader,
  DataTable,
  toTanstackColumns,
  OptionsSelect,
  buttonVariants,
  PAGE_CONTENT_CLASS,
  KPI_GRID_CLASS,
  KPI_CONFIRMED_CLASS,
  KPI_CLASS,
  COMPACT_FILTER_CLASS,
  INLINE_LOADER_CLASS,
} from "@/components";
import { useAuth } from "@/contexts";
import { useSre } from "@/contexts";
import { createPaymentColumns as createClientPaymentColumns } from "@/components/PaymentsComponents/tables/client";
import { PAYMENT_STATUS_OPTIONS } from "@/data";
import { useTableState } from "@/hooks";
import { ALL, ROUTES_CLIENT } from "@/data";
import { formatMoney } from "@/utils";
import { downloadPdfApi } from "@/services/documents";
import type { Payment } from "@/types";

export function ClientPaymentsPage() {
  const { session } = useAuth();
  const { state, notify } = useSre();
  const table = useTableState();
  const [status, setStatus] = useState<string>(ALL);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const payments = useMemo(
    () =>
      state.payments
        .filter((payment) => payment.taxpayerId === session?.taxpayerId)
        .filter((payment) => status === ALL || payment.status === status)
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [state.payments, session?.taxpayerId, status],
  );

  const totals = useMemo(() => {
    const mine = state.payments.filter((payment) => payment.taxpayerId === session?.taxpayerId);
    const confirmed = mine.filter((payment) => payment.status === "CONFIRME");
    return {
      confirmedAmount: confirmed.reduce((sum, payment) => sum + payment.amount, 0),
      confirmedCount: confirmed.length,
      pendingCount: mine.filter(
        (payment) => payment.status === "EN_ATTENTE" || payment.status === "EN_VERIFICATION",
      ).length,
      receipts: mine.filter((payment) => payment.receipt).length,
    };
  }, [state.payments, session?.taxpayerId]);

  const downloadReceipt = async (payment: Payment) => {
    if (!session?.apiToken || !payment.receipt) return;
    setDownloadingId(payment.id);
    try {
      await downloadPdfApi(payment.receipt.id, session.apiToken, payment.receipt.number);
    } catch (cause) {
      console.error("Téléchargement du reçu impossible.", cause);
      notify("Le reçu n’a pas pu être téléchargé.", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = createClientPaymentColumns({
    onDownloadReceipt: (payment) => void downloadReceipt(payment),
  });

  return (
    <div className={PAGE_CONTENT_CLASS}>
      <PageHeader
        title="Mes paiements"
        description="Déclarations, statuts et reçus définitifs de votre compte."
        breadcrumb={["Accueil", "Mes paiements"]}
      />
      <div className={KPI_GRID_CLASS} style={{ marginBottom: 14 }}>
        <div className={KPI_CONFIRMED_CLASS}>
          <span>
            <ReceiptText size={13} /> Montant confirmé
          </span>
          <strong>{formatMoney(totals.confirmedAmount)}</strong>
          <small>{totals.confirmedCount} paiement(s) avec reçu définitif</small>
        </div>
        <div className={KPI_CLASS}>
          <span>
            <CircleDollarSign size={13} /> En attente
          </span>
          <strong>{totals.pendingCount}</strong>
          <small>Suivi en cours, sans reçu</small>
        </div>
        <div className={KPI_CLASS}>
          <span>
            <Download size={13} /> Reçus disponibles
          </span>
          <strong>{totals.receipts}</strong>
          <small>Téléchargeables et imprimables</small>
        </div>
      </div>
      <DataTable
        data={payments}
        columns={toTanstackColumns(columns)}
        label="Mes paiements"
        getRowId={(payment) => payment.id}
        getSearchText={(payment) =>
          `${payment.internalReference} ${payment.transactionReference} ${payment.taxTypeName} ${payment.period} ${payment.receipt?.number ?? ""}`
        }
        searchPlaceholder="Référence, impôt, période, reçu…"
        searchValue={table.search}
        onSearchChange={table.changeSearch}
        toolbarActions={
          <label className={COMPACT_FILTER_CLASS}>
            Statut
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                table.resetPage();
              }}
            >
              <OptionsSelect options={PAYMENT_STATUS_OPTIONS} />
            </Select>
          </label>
        }
        actionPrimary={
          <Link className={buttonVariants({ variant: "primary" })} to={ROUTES_CLIENT.newPayment}>
            <CircleDollarSign size={16} /> Déclarer un paiement
          </Link>
        }
        columnToggle
        emptyTitle="Aucun paiement"
        emptyDescription="Vos déclarations et leurs reçus apparaîtront ici."
        page={table.page}
        rowsPerPage={table.perPage}
        onPageChange={table.changePage}
        onRowsPerPageChange={table.changePerPage}
      />
      {downloadingId && (
        <div className={INLINE_LOADER_CLASS}>
          <i /> Préparation du reçu…
        </div>
      )}
    </div>
  );
}
