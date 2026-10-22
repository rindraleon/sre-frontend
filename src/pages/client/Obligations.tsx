import { Select } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CircleDollarSign, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader, DataTable, toTanstackColumns } from "@/components/ui";
import { OptionsSelect } from "@/components/forms/options-select";
import { createObligationColumns } from "@/components/tables/client/obligations-columns";
import { useTableState } from "@/hooks";
import { OBLIGATION_STATUS_OPTIONS, ROUTES_CLIENT, ALL } from "@/constants";
import { formatMoney } from "@/utils/format";

export function ClientObligationsPage() {
  const { session } = useAuth();
  const { state } = useSre();
  const table = useTableState();
  const [status, setStatus] = useState<string>(ALL);
  const myObligations = useMemo(
    () =>
      state.obligations.filter(
        (obligation) => obligation.taxpayerId === session?.taxpayerId,
      ),
    [state.obligations, session?.taxpayerId],
  );

  const columns = createObligationColumns();

  const outstandingAmount = myObligations
    .filter((obligation) => obligation.status !== "PAYE")
    .reduce((sum, obligation) => sum + obligation.amount, 0);

  return (
    <div className="page-content-sre">
      <PageHeader
        title="Mes obligations fiscales"
        description="Obligations enregistrées pour votre compte."
        breadcrumb={["Accueil", "Mes impôts"]}
      />
      <div className="info-banner-sre">
        <span>
          <FileText size={17} />
        </span>
        <div>
          <strong>
            {myObligations.length} obligation
            {myObligations.length === 1 ? "" : "s"} · {formatMoney(outstandingAmount)} à
            suivre
          </strong>
        </div>
      </div>
      <DataTable
        data={myObligations.filter(
          (obligation) => status === ALL || obligation.status === status,
        )}
        columns={toTanstackColumns(columns)}
        label="Mes obligations fiscales"
        getRowId={(obligation) => obligation.id}
        searchPlaceholder="Référence, impôt ou période…"
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
              <OptionsSelect options={OBLIGATION_STATUS_OPTIONS} />
            </Select>
          </label>
        }
        actionPrimary={
          <Link className="button-sre button-sre--primary" to={ROUTES_CLIENT.newPayment}>
            <CircleDollarSign size={16} /> Déclarer un paiement
          </Link>
        }
        columnToggle
        emptyTitle="Aucune obligation"
        emptyDescription="Aucune obligation ne correspond à votre recherche."
        page={table.page}
        rowsPerPage={table.perPage}
        onPageChange={table.changePage}
        onRowsPerPageChange={table.changePerPage}
      />
      <section className="tax-note-sre">
        <span>i</span>
        <p>
          <strong>À noter :</strong> une déclaration de paiement créée dans le portail reste « En
          vérification » jusqu’à une décision explicite. L’application ne traite aucun mouvement de
          fonds.
        </p>
      </section>
    </div>
  );
}
