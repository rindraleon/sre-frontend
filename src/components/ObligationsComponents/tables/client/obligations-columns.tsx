import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import type { TaxObligation } from "@/types";
import { ROUTES_CLIENT } from "@/data";
import {
  ActionGroup,
  ActionIcon,
  StatusBadge,
  type TableColumn,
  REFERENCE_CLASS,
  AMOUNT_CLASS,
} from "@/components";
import { formatMoney, formatDate } from "@/utils";

export function createObligationColumns(): TableColumn<TaxObligation>[] {
  return [
    {
      id: "reference",
      title: "Référence",
      render: (obligation) => (
        <Link className={REFERENCE_CLASS} to={ROUTES_CLIENT.obligation(obligation.id)}>
          {obligation.taxReference}
        </Link>
      ),
      sortValue: (obligation) => obligation.taxReference,
    },
    {
      id: "tax",
      title: "Impôt / catégorie",
      render: (obligation) => <strong>{obligation.taxTypeName}</strong>,
      sortValue: (obligation) => obligation.taxTypeName,
    },
    {
      id: "period",
      title: "Période",
      render: (obligation) => obligation.period,
      sortValue: (obligation) => obligation.period,
    },
    {
      id: "dueDate",
      title: "Échéance enregistrée",
      render: (obligation) => formatDate(obligation.dueDate),
      sortValue: (obligation) => obligation.dueDate,
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
      id: "status",
      title: "Statut",
      render: (obligation) => <StatusBadge status={obligation.status} />,
      sortValue: (obligation) => obligation.status,
    },
    {
      id: "action",
      title: "Actions",
      render: (obligation) => (
        <ActionGroup>
          <ActionIcon title="Consulter l’obligation" href={ROUTES_CLIENT.obligation(obligation.id)}>
            <Eye size={15} />
          </ActionIcon>
        </ActionGroup>
      ),
    },
  ];
}
