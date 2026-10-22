import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader, DataTable, toTanstackColumns } from "@/components/ui";
import { createDocumentColumns } from "@/components/tables/client/documents-columns";
import { useTableState } from "@/hooks";

export function ClientDocumentsPage() {
  const { session } = useAuth();
  const { state } = useSre();
  const table = useTableState();
  const documents = useMemo(
    () =>
      state.paymentDocuments
        .filter(
          (document) =>
            document.taxpayerId === session?.taxpayerId && document.status === "VALIDE",
        )
        .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
    [state.paymentDocuments, session?.taxpayerId],
  );
  const columns = createDocumentColumns();
  return (
    <div className="page-content-sre">
      <PageHeader
        title="Mes reçus et documents"
        description="Retrouvez les accusés de réception et les reçus internes liés à vos déclarations."
        breadcrumb={["Accueil", "Mes reçus"]}
      />
      <DataTable
        data={documents}
        columns={toTanstackColumns(columns)}
        label="Mes reçus et documents"
        getRowId={(document) => document.id}
        columnToggle
        emptyTitle="Aucun document"
        emptyDescription="Les accusés et reçus associés à vos déclarations apparaîtront ici."
        page={table.page}
        rowsPerPage={table.perPage}
        onPageChange={table.changePage}
        onRowsPerPageChange={table.changePerPage}
      />
    </div>
  );
}
