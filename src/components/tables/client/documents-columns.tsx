import { Link } from "react-router-dom";
import { ArrowRight, Eye } from "lucide-react";
import type { PaymentDocument } from "@/types";
import { ROUTES_CLIENT } from "@/constants";
import { ActionGroup, ActionIcon, StatusBadge, type TableColumn } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

/** Libellé du type de document de paiement. */
export function titreDocument(document: PaymentDocument) {
  return document.type === "ACCUSE_DECLARATION"
    ? "Accusé de soumission de déclaration"
    : "Reçu interne de décision";
}

/** Colonnes du tableau des reçus et documents du contribuable (espace client). */
export function creerColonnesDocuments(): TableColumn<PaymentDocument>[] {
  return [
    {
      id: "numero",
      titre: "Document",
      afficher: (document) => (
        <>
          <Link className="reference-sre" to={ROUTES_CLIENT.document(document.id)}>
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
        <Link className="lien-action-sre" to={ROUTES_CLIENT.paiement(document.paiementId)}>
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
      titre: "Actions",
      afficher: (document) => (
        <ActionGroup>
          <ActionIcon
            titre="Consulter le document"
            href={ROUTES_CLIENT.document(document.id)}
          >
            <Eye size={15} />
          </ActionIcon>
        </ActionGroup>
      ),
    },
  ];
}
