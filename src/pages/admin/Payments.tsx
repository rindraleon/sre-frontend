import { Select } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { Clock3 } from "lucide-react";
import { useSre } from "@/context/SreContext";
import { PageHeader, DataTable, toTanstackColumns } from "@/components/ui";
import { OptionsSelect } from "@/components/forms/options-select";
import { createPaymentColumns } from "@/components/tables/admin/payments-columns";
import { useTableState } from "@/hooks";
import { PAYMENT_STATUS_FILTER_OPTIONS } from "@/constants/admin-payments";
import { ALL } from "@/constants";

export function AdminPaymentsPage({ verificationOnly = false }: Readonly<{ verificationOnly?: boolean }>) {
  const { state } = useSre();
  const table = useTableState();
  const [status, setStatus] = useState<string>(verificationOnly ? "EN_VERIFICATION" : ALL);
  const payments = useMemo(
    () =>
      state.payments
        .filter(
          (payment) =>
            (status === ALL || payment.status === status) &&
            (!verificationOnly || payment.status === "EN_VERIFICATION"),
        )
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [state.payments, status, verificationOnly],
  );
  const columns = createPaymentColumns({ taxpayers: state.taxpayers });
  return (
    <div className="page-content-sre">
      <PageHeader
        title={verificationOnly ? "Vérification des paiements" : "Historique des paiements"}
        description={
          verificationOnly
            ? "Examinez chaque déclaration avant d’enregistrer une décision."
            : "Historique partagé des déclarations et décisions."
        }
        breadcrumb={[
          "Accueil",
          verificationOnly ? "Vérification des paiements" : "Historique des paiements",
        ]}
        actions={
          verificationOnly && (
            <span className="big-pending-badge-sre">
              <Clock3 size={14} />{" "}
              {state.payments.filter((payment) => payment.status === "EN_VERIFICATION").length} à
              vérifier
            </span>
          )
        }
      />

      <DataTable
        data={payments}
        columns={toTanstackColumns(columns)}
        label={verificationOnly ? "Paiements à vérifier" : "Historique des paiements"}
        getRowId={(payment) => payment.id}
        getSearchText={(payment) => {
          const taxpayer = state.taxpayers.find(
            (entry) => entry.id === payment.taxpayerId,
          );
          return `${payment.internalReference} ${payment.transactionReference} ${payment.taxTypeName} ${payment.period} ${taxpayer?.legalName ?? ""} ${taxpayer?.firstName ?? ""} ${taxpayer?.lastName ?? ""} ${taxpayer?.nif ?? ""} ${taxpayer?.email ?? ""}`;
        }}
        searchPlaceholder="Référence, contribuable ou NIF…"
        searchValue={table.search}
        onSearchChange={table.changeSearch}
        toolbarActions={
          !verificationOnly ? (
            <label className="compact-filter-sre">
              Statut
              <Select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  table.resetPage();
                }}
              >
                <OptionsSelect options={PAYMENT_STATUS_FILTER_OPTIONS} />
              </Select>
            </label>
          ) : undefined
        }
        columnToggle
        emptyTitle={verificationOnly ? "Aucune déclaration en attente" : "Aucune déclaration"}
        emptyDescription={
          verificationOnly
            ? "La file de vérification est vide."
            : "Les déclarations enregistrées apparaîtront ici."
        }
        page={table.page}
        rowsPerPage={table.perPage}
        onPageChange={table.changePage}
        onRowsPerPageChange={table.changePerPage}
      />
    </div>
  );
}
