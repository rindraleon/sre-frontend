import type { OverdueRow } from "@/types";
import { StatusBadge, type TableColumn } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

const SITUATION_LABELS: Record<OverdueRow["situation"], string> = {
  REGULARISE: "Régularisé",
  EN_VERIFICATION: "En vérification",
  REJETE: "Rejeté",
  CORRECTION_DEMANDEE: "Correction demandée",
  EN_RETARD: "En retard",
  EN_ATTENTE: "En attente",
};

/** Columns of the overdue tracking table (back office). */
export function createOverdueColumns(): TableColumn<OverdueRow>[] {
  return [
    {
      id: "entity",
      title: "Entité",
      render: (row) => (
        <div>
          <strong>{row.entite.nom}</strong>
          <small className="sub-row-sre">{row.entite.courriel ?? "—"}</small>
        </div>
      ),
      sortValue: (row) => row.entite.nom,
    },
    {
      id: "stat",
      title: "STAT",
      render: (row) => row.entite.stat || "—",
      sortValue: (row) => row.entite.stat ?? "",
    },
    {
      id: "reference",
      title: "Dossier",
      render: (row) => (
        <div>
          <strong>{row.referenceFiscale}</strong>
          <small className="sub-row-sre">
            {row.typeImpot} · {row.periode}
          </small>
        </div>
      ),
      sortValue: (row) => row.referenceFiscale,
    },
    {
      id: "dueDate",
      title: "Échéance",
      render: (row) => formatDate(row.echeance),
      sortValue: (row) => row.echeance,
    },
    {
      id: "overdue",
      title: "Jours de retard",
      render: (row) =>
        row.joursRetard > 0 ? (
          <strong className="text-destructive">{row.joursRetard} j</strong>
        ) : (
          "—"
        ),
      sortValue: (row) => row.joursRetard,
    },
    {
      id: "amount",
      title: "Montant",
      render: (row) => formatMoney(Number(row.montant)),
      sortValue: (row) => Number(row.montant),
    },
    {
      id: "situation",
      title: "Situation",
      render: (row) => <StatusBadge status={row.situation} />,
      sortValue: (row) => row.situation,
    },
    {
      id: "status",
      title: "Statut du dossier",
      render: (row) => <StatusBadge status={row.statut} />,
      sortValue: (row) => row.statut,
    },
  ];
}

export { SITUATION_LABELS };
