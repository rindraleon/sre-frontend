import { Link } from "react-router-dom";
import { Building2, Eye, Trash2, UserRound } from "lucide-react";
import type { Taxpayer } from "@/types";
import { ROUTES_ADMIN } from "@/constants";
import { ActionGroup, ActionIcon, StatusBadge, type TableColumn } from "@/components/ui";
import { formatDate } from "@/utils/format";

/** Columns of the taxpayer profiles table (back office). */
export function createTaxpayerColumns({
  onDelete,
}: Readonly<{ onDelete: (taxpayer: Taxpayer) => void }>): TableColumn<Taxpayer>[] {
  return [
    {
      id: "name",
      title: "Contribuable",
      render: (entry) => (
        <Link className="table-identity-link-sre" to={ROUTES_ADMIN.taxpayer(entry.id)}>
          <span className="row-avatar-sre">
            {entry.type === "ENTREPRISE" ? <Building2 size={15} /> : <UserRound size={15} />}
          </span>
          <span>
            <strong>{entry.legalName || `${entry.firstName ?? ""} ${entry.lastName}`.trim()}</strong>
            <small>{entry.email}</small>
          </span>
        </Link>
      ),
      sortValue: (entry) => entry.legalName || `${entry.firstName ?? ""} ${entry.lastName}`,
    },
    {
      id: "type",
      title: "Type",
      render: (entry) => <StatusBadge status={entry.type} />,
      sortValue: (entry) => entry.type,
    },
    {
      id: "nif",
      title: "NIF",
      render: (entry) => entry.nif || "—",
      sortValue: (entry) => entry.nif,
    },
    {
      id: "stat",
      title: "STAT",
      render: (entry) => entry.stat || "—",
      sortValue: (entry) => entry.stat ?? "",
    },
    {
      id: "region",
      title: "Localisation",
      render: (entry) => (
        <>
          {entry.city}
          <small className="sub-row-sre">{entry.region}</small>
        </>
      ),
      sortValue: (entry) => entry.region,
    },
    {
      id: "status",
      title: "Compte",
      render: (entry) => <StatusBadge status={entry.status ?? "SANS_COMPTE"} />,
      sortValue: (entry) => entry.status ?? "SANS_COMPTE",
    },
    {
      id: "created",
      title: "Créé le",
      render: (entry) => formatDate(entry.accountCreatedAt),
      sortValue: (entry) => entry.accountCreatedAt,
    },
    {
      id: "action",
      title: "Actions",
      render: (entry) => (
        <ActionGroup>
          <ActionIcon
            title="Consulter le profil"
            href={ROUTES_ADMIN.taxpayer(entry.id)}
          >
            <Eye size={15} />
          </ActionIcon>
          <ActionIcon
            title="Supprimer le profil"
            danger
            onClick={() => onDelete(entry)}
          >
            <Trash2 size={15} />
          </ActionIcon>
        </ActionGroup>
      ),
    },
  ];
}
