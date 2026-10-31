import { Link } from "react-router-dom";
import { Download, Eye } from "lucide-react";
import type { Payment } from "@/types";
import { ROUTES_CLIENT } from "@/constants";
import { ActionGroup, ActionIcon, StatusBadge, type TableColumn } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

/** Columns of the taxpayer's payment history table (client workspace). */
export function createPaymentColumns(options?: {
  onDownloadReceipt?: (payment: Payment) => void;
}): TableColumn<Payment>[] {
  return [
    {
      id: "ref",
      title: "Référence",
      render: (payment) => (
        <Link className="reference-sre" to={ROUTES_CLIENT.payment(payment.id)}>
          {payment.internalReference}
        </Link>
      ),
      sortValue: (payment) => payment.internalReference,
    },
    {
      id: "tax",
      title: "Impôt / période",
      render: (payment) => (
        <>
          <strong>{payment.taxTypeName}</strong>
          <small className="sub-row-sre">{payment.period}</small>
        </>
      ),
      sortValue: (payment) => payment.taxTypeName,
    },
    {
      id: "amount",
      title: "Montant déclaré",
      render: (payment) => <span className="amount-sre">{formatMoney(payment.amount)}</span>,
      sortValue: (payment) => payment.amount,
    },
    {
      id: "mode",
      title: "Mode déclaré",
      render: (payment) => <StatusBadge status={payment.mode} />,
      sortValue: (payment) => payment.mode,
    },
    {
      id: "submitted",
      title: "Date de déclaration",
      render: (payment) => formatDate(payment.submittedAt),
      sortValue: (payment) => payment.submittedAt,
    },
    {
      id: "status",
      title: "Statut",
      render: (payment) => (
        <>
          <StatusBadge status={payment.status} />
          <small className="sub-row-sre">
            {payment.receipt ? `Reçu ${payment.receipt.number}` : "Sans reçu définitif"}
          </small>
        </>
      ),
      sortValue: (payment) => payment.status,
    },
    {
      id: "actions",
      title: "Actions",
      render: (payment) => (
        <ActionGroup>
          <ActionIcon title="Suivre le paiement" href={ROUTES_CLIENT.payment(payment.id)}>
            <Eye size={15} />
          </ActionIcon>
          {payment.receipt && options?.onDownloadReceipt && (
            <ActionIcon
              title={`Télécharger le reçu ${payment.receipt.number}`}
              onClick={() => options.onDownloadReceipt?.(payment)}
            >
              <Download size={15} />
            </ActionIcon>
          )}
        </ActionGroup>
      ),
    },
  ];
}
