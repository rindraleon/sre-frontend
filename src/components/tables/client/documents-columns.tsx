import { Link } from "react-router-dom";
import { ArrowRight, Eye } from "lucide-react";
import type { PaymentDocument } from "@/types";
import { ROUTES_CLIENT } from "@/constants";
import { ActionGroup, ActionIcon, StatusBadge, type TableColumn } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

/** Label of the payment document type. */
export function documentTitle(document: PaymentDocument) {
  return document.type === "ACCUSE_DECLARATION"
    ? "Accusé de soumission de déclaration"
    : "Reçu interne de décision";
}

/** Columns of the taxpayer's receipts and documents table (client workspace). */
export function createDocumentColumns(): TableColumn<PaymentDocument>[] {
  return [
    {
      id: "number",
      title: "Document",
      render: (document) => (
        <>
          <Link className="reference-sre" to={ROUTES_CLIENT.document(document.id)}>
            {document.number}
          </Link>
          <small className="sub-row-sre">{documentTitle(document)}</small>
        </>
      ),
      sortValue: (document) => document.number,
    },
    {
      id: "payment",
      title: "Déclaration associée",
      render: (document) => (
        <Link className="action-link-sre" to={ROUTES_CLIENT.payment(document.paymentId)}>
          {document.paymentReference} <ArrowRight size={13} />
        </Link>
      ),
      sortValue: (document) => document.paymentReference,
    },
    {
      id: "amount",
      title: "Montant déclaré",
      render: (document) => (
        <span className="amount-sre">{formatMoney(document.amount, document.currency)}</span>
      ),
      sortValue: (document) => document.amount,
    },
    {
      id: "issued",
      title: "Date d’émission",
      render: (document) => formatDate(document.issuedAt, true),
      sortValue: (document) => document.issuedAt,
    },
    {
      id: "type",
      title: "Nature",
      render: (document) => <StatusBadge status={document.type} />,
      sortValue: (document) => document.type,
    },
    {
      id: "action",
      title: "Actions",
      render: (document) => (
        <ActionGroup>
          <ActionIcon
            title="Consulter le document"
            href={ROUTES_CLIENT.document(document.id)}
          >
            <Eye size={15} />
          </ActionIcon>
        </ActionGroup>
      ),
    },
  ];
}
