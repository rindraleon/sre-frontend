import { Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import type { TaxType } from "@/types";
import { ActionGroup, ActionIcon, StatusBadge, type TableColumn } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

const periodicityLabels: Record<TaxType["periodicity"], string> = {
  MENSUELLE: "Mensuelle",
  TRIMESTRIELLE: "Trimestrielle",
  ANNUELLE: "Annuelle",
  PONCTUELLE: "Ponctuelle",
};

function TaxTypeNameCell({ type }: Readonly<{ type: TaxType }>) {
  return (
    <div>
      <strong>{type.name}</strong>
      <small className="sub-row-sre">
        {type.code} · {type.description}
      </small>
    </div>
  );
}

export function createTaxTypeColumns({
  onUpdate,
  onToggle,
}: Readonly<{
  onUpdate: (type: TaxType) => void;
  onToggle: (type: TaxType) => void;
}>): TableColumn<TaxType>[] {
  return [
    {
      id: "name",
      title: "Type d’impôt",
      render: (type) => <TaxTypeNameCell type={type} />,
      sortValue: (type) => type.name,
    },
    {
      id: "category",
      title: "Catégorie",
      render: (type) => type.category,
      sortValue: (type) => type.category,
    },
    {
      id: "applicable",
      title: "Contribuables concernés",
      render: (type) => {
        if (type.applicableTaxpayers === "TOUS") return "Tous";
        if (type.applicableTaxpayers === "ENTREPRISE") return "Entreprises";
        return "Particuliers";
      },
      sortValue: (type) => type.applicableTaxpayers,
    },
    {
      id: "periodicity",
      title: "Périodicité",
      render: (type) => periodicityLabels[type.periodicity],
      sortValue: (type) => type.periodicity,
    },
    {
      id: "amount",
      title: "Montant de référence",
      render: (type) =>
        type.referenceAmount == null ? "Non défini" : formatMoney(type.referenceAmount),
      sortValue: (type) => type.referenceAmount ?? 0,
    },
    {
      id: "status",
      title: "Statut",
      render: (type) => <StatusBadge status={type.isActive ? "ACTIF" : "INACTIF"} />,
      sortValue: (type) => String(type.isActive),
    },
    {
      id: "date",
      title: "Modifié le",
      render: (type) => formatDate(type.updatedAt),
      sortValue: (type) => type.updatedAt,
    },
    {
      id: "action",
      title: "Actions",
      render: (type) => (
        <ActionGroup>
          <ActionIcon title="Modifier le type d’impôt" onClick={() => onUpdate(type)}>
            <Pencil size={15} />
          </ActionIcon>
          <ActionIcon
            title={type.isActive ? "Désactiver le type d’impôt" : "Réactiver le type d’impôt"}
            onClick={() => onToggle(type)}
          >
            {type.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
          </ActionIcon>
        </ActionGroup>
      ),
    },
  ];
}
