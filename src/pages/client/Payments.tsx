import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CircleDollarSign } from "lucide-react";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader, DataTable, toTanstackColumns } from "@/components/ui";
import { OptionsSelect } from "@/components/forms/options-select";
import { createPaymentColumns } from "@/components/tables/client/payments-columns";
import { useTableState } from "@/hooks";
import { ALL, ROUTES_CLIENT } from "@/constants";
import { PAYMENT_STATUS_OPTIONS } from "@/constants/client-payments";

export function ClientPaymentsPage() {
  const { session } = useAuth();
  const { state } = useSre();
  const table = useTableState();
  const [status, setStatus] = useState<string>(ALL);
  const payments = useMemo(
    () =>
      state.payments
        .filter((payment) => payment.taxpayerId === session?.taxpayerId)
        .filter((payment) => status === ALL || payment.status === status)
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [state.payments, session?.taxpayerId, status],
  );
  const columns = createPaymentColumns();
  return (
    <div className="page-content-sre">
      <PageHeader
        title="Historique des paiements"
        description="Déclarations associées à votre compte."
        breadcrumb={["Accueil", "Historique des paiements"]}
      />
      <DataTable
        data={payments}
        columns={toTanstackColumns(columns)}
        label="Historique des paiements"
        getRowId={(payment) => payment.id}
        getSearchText={(payment) =>
          `${payment.internalReference} ${payment.transactionReference} ${payment.taxTypeName} ${payment.period}`
        }
        searchPlaceholder="Référence, impôt, période…"
        searchValue={table.search}
        onSearchChange={table.changeSearch}
        toolbarActions={
          <label className="compact-filter-sre">
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
          <Link className="button-sre button-sre--primary" to={ROUTES_CLIENT.newPayment}>
            <CircleDollarSign size={16} /> Déclarer un paiement
          </Link>
        }
        columnToggle
        emptyTitle="Aucune déclaration"
        emptyDescription="Les déclarations enregistrées apparaîtront ici."
        page={table.page}
        rowsPerPage={table.perPage}
        onPageChange={table.changePage}
        onRowsPerPageChange={table.changePerPage}
      />
    </div>
  );
}
