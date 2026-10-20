import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader, DataTable, convertirColonnesTanstack } from "@/components/ui";
import { creerColonnesDocuments } from "@/components/tables/client/documents-columns";
import { useTableState } from "@/hooks";

export function ClientDocumentsPage() {
  const { session } = useAuth();
  const { etat } = useSre();
  const table = useTableState();
  const documents = useMemo(
    () =>
      etat.documentsPaiement
        .filter(
          (document) =>
            document.contribuableId === session?.contribuableId && document.statut === "VALIDE",
        )
        .sort((a, b) => b.emisLe.localeCompare(a.emisLe)),
    [etat.documentsPaiement, session?.contribuableId],
  );
  const colonnes = creerColonnesDocuments();
  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Mes reçus et documents"
        description="Retrouvez les accusés de réception et les reçus internes liés à vos déclarations."
        filAriane={["Accueil", "Mes reçus"]}
      />
      <DataTable
        data={documents}
        columns={convertirColonnesTanstack(colonnes)}
        label="Mes reçus et documents"
        getRowId={(document) => document.id}
        columnToggle
        emptyTitle="Aucun document"
        emptyDescription="Les accusés et reçus associés à vos déclarations apparaîtront ici."
        page={table.page}
        rowsPerPage={table.parPage}
        onPageChange={table.changerPage}
        onRowsPerPageChange={table.changerParPage}
      />
    </div>
  );
}
