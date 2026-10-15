import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { StatusBadge, PageHeader, DataTable, type TableColumn } from "@/components/ui";
import type { PaymentDocument } from "@/types";
import { formatMoney, formatDate } from "@/utils/format";

function titreDocument(document: PaymentDocument) {
  return document.type === "ACCUSE_DECLARATION"
    ? "Accusé de soumission de déclaration"
    : "Reçu interne de décision";
}

export function ClientDocumentsPage() {
  const { session } = useAuth();
  const { etat } = useSre();
  const [page, definirPage] = useState(1);
  const [parPage, definirParPage] = useState(10);
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
  const colonnes: TableColumn<PaymentDocument>[] = [
    {
      id: "numero",
      titre: "Document",
      afficher: (document) => (
        <>
          <Link className="reference-sre" to={`/client/documents/${document.id}`}>
            {document.numero}
          </Link>
          <small className="sous-ligne-sre">{titreDocument(document)}</small>
        </>
      ),
      valeurTri: (document) => document.numero,
    },
    {
      id: "paiement",
      titre: "Déclaration associée",
      afficher: (document) => (
        <Link className="lien-action-sre" to={`/client/paiements/${document.paiementId}`}>
          {document.referencePaiement} <ArrowRight size={13} />
        </Link>
      ),
      valeurTri: (document) => document.referencePaiement,
    },
    {
      id: "montant",
      titre: "Montant déclaré",
      afficher: (document) => (
        <span className="montant-sre">{formatMoney(document.montant, document.devise)}</span>
      ),
      valeurTri: (document) => document.montant,
    },
    {
      id: "emis",
      titre: "Date d’émission",
      afficher: (document) => formatDate(document.emisLe, true),
      valeurTri: (document) => document.emisLe,
    },
    {
      id: "type",
      titre: "Nature",
      afficher: (document) => <StatusBadge statut={document.type} />,
      valeurTri: (document) => document.type,
    },
    {
      id: "action",
      titre: "",
      afficher: (document) => (
        <Link className="lien-action-sre" to={`/client/documents/${document.id}`}>
          Consulter <ArrowRight size={13} />
        </Link>
      ),
    },
  ];
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
        page={page}
        parPage={parPage}
        changerPage={definirPage}
        changerParPage={definirParPage}
      />
    </div>
  );
}
