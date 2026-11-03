import type { TaxObligation, Taxpayer } from "@/types";
import { StatusBadge, type TableColumn, SUB_ROW_CLASS, AMOUNT_CLASS } from "@/components";
import { formatMoney, formatDate } from "@/utils";

export function createObligationColumns({
  taxpayers,
}: Readonly<{ taxpayers: Taxpayer[] }>): TableColumn<TaxObligation>[] {
  return [
    {
      id: "ref",
      title: "Référence",
      render: (obligation) => <strong>{obligation.taxReference}</strong>,
      sortValue: (obligation) => obligation.taxReference,
    },
    {
      id: "taxpayer",
      title: "Contribuable",
      render: (obligation) => {
        const c = taxpayers.find((entry) => entry.id === obligation.taxpayerId);
        return (
          <div>
            <strong>
              {c?.legalName ||
                `${c?.firstName ?? ""} ${c?.lastName ?? ""}`.trim() ||
                "Profil indisponible"}
            </strong>
            <small className={SUB_ROW_CLASS}>{c?.nif || c?.email || "—"}</small>
          </div>
        );
      },
      sortValue: (obligation) =>
        taxpayers.find((e) => e.id === obligation.taxpayerId)?.legalName ?? "",
    },
    {
      id: "tax",
      title: "Impôt / catégorie",
      render: (obligation) => obligation.taxTypeName,
      sortValue: (obligation) => obligation.taxTypeName,
    },
    {
      id: "period",
      title: "Période",
      render: (obligation) => obligation.period,
      sortValue: (obligation) => obligation.period,
    },
    {
      id: "amount",
      title: "Montant enregistré",
      render: (obligation) => (
        <span className={AMOUNT_CLASS}>{formatMoney(obligation.amount)}</span>
      ),
      sortValue: (obligation) => obligation.amount,
    },
    {
      id: "dueDate",
      title: "Échéance",
      render: (obligation) => formatDate(obligation.dueDate),
      sortValue: (obligation) => obligation.dueDate,
    },
    {
      id: "status",
      title: "Statut",
      render: (obligation) => <StatusBadge status={obligation.status} />,
      sortValue: (obligation) => obligation.status,
    },
  ];
}
