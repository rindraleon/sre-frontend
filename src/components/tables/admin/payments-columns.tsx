import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import type { Payment, Taxpayer } from "@/types";
import { ROUTES_ADMIN } from "@/constants";
import { ActionGroup, ActionIcon, StatusBadge, type TableColumn } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

export function createPaymentColumns({
  taxpayers,
}: Readonly<{ taxpayers: Taxpayer[] }>): TableColumn<Payment>[] {
  return [
    {
      id: "ref",
      title: "Référence",
      render: (payment) => (
        <Link className="reference-sre" to={ROUTES_ADMIN.payment(payment.id)}>
          {payment.internalReference}
        </Link>
      ),
      sortValue: (payment) => payment.internalReference,
    },
    {
      id: "taxpayer",
      title: "Contribuable",
      render: (payment) => {
        const c = taxpayers.find((entry) => entry.id === payment.taxpayerId);
        return (
          <div>
            <strong>
              {c?.legalName ||
                `${c?.firstName ?? ""} ${c?.lastName ?? ""}`.trim() ||
                "Profil indisponible"}
            </strong>
            <small className="sub-row-sre">{c?.nif || c?.email || "—"}</small>
          </div>
        );
      },
      sortValue: (payment) =>
        taxpayers.find((e) => e.id === payment.taxpayerId)?.legalName ?? "",
    },
    {
      id: "tax",
      title: "Impôt / période",
      render: (payment) => (
        <>
          {payment.taxTypeName}
          <small className="sub-row-sre">{payment.period}</small>
        </>
      ),
      sortValue: (payment) => payment.taxTypeName,
    },
    {
      id: "amount",
      title: "Montant déclaré",
      render: (payment) => <strong>{formatMoney(payment.amount)}</strong>,
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
      title: "Soumis le",
      render: (payment) => formatDate(payment.submittedAt, true),
      sortValue: (payment) => payment.submittedAt,
    },
    {
      id: "status",
      title: "Statut",
      render: (payment) => <StatusBadge status={payment.status} />,
      sortValue: (payment) => payment.status,
    },
    {
      id: "action",
      title: "Actions",
      render: (payment) => (
        <ActionGroup>
          <ActionIcon
            title={
              payment.status === "EN_VERIFICATION"
                ? "Examiner la déclaration"
                : "Consulter la déclaration"
            }
            href={ROUTES_ADMIN.payment(payment.id)}
          >
            <Eye size={15} />
          </ActionIcon>
        </ActionGroup>
      ),
    },
  ];
}
