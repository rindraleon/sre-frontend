import { useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader, DataTable } from "@/components/ui";
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
        filAriane={["Mon espace", "Mes reçus"]}
      />
      <div className="note-fiscale-sre">
        <span>
          <ShieldCheck size={15} />
        </span>
        <p>
          Un accusé atteste la soumission d’une déclaration. Un reçu interne n’est émis qu’après une
          décision administrative et ne constitue pas un justificatif bancaire.
        </p>
      </div>
      <DataTable
        lignes={documents}
        colonnes={colonnes}
        obtenirId={(document) => document.id}
        espaceVide="Aucun document"
        messageVide="Les accusés et reçus associés à vos déclarations apparaîtront ici."
        page={table.page}
        parPage={table.parPage}
        changerPage={table.changerPage}
        changerParPage={table.changerParPage}
      />
    </div>
  );
}
