import { Link } from "react-router-dom";
import { Building2, Eye, Trash2, UserRound } from "lucide-react";
import type { Taxpayer } from "@/types";
import { ROUTES_ADMIN } from "@/constants";
import { ActionGroup, ActionIcon, StatusBadge, type TableColumn } from "@/components/ui";
import { formatDate } from "@/utils/format";

/** Colonnes du tableau des profils contribuables (back-office). */
export function creerColonnesContribuables({
  onSupprimer,
}: Readonly<{ onSupprimer: (contribuable: Taxpayer) => void }>): TableColumn<Taxpayer>[] {
  return [
    {
      id: "nom",
      titre: "Contribuable",
      afficher: (entree) => (
        <Link className="lien-identite-tableau-sre" to={ROUTES_ADMIN.contribuable(entree.id)}>
          <span className="avatar-ligne-sre">
            {entree.type === "ENTREPRISE" ? <Building2 size={15} /> : <UserRound size={15} />}
          </span>
          <span>
            <strong>{entree.raisonSociale || `${entree.prenom ?? ""} ${entree.nom}`.trim()}</strong>
            <small>{entree.courriel}</small>
          </span>
        </Link>
      ),
      valeurTri: (entree) => entree.raisonSociale || `${entree.prenom ?? ""} ${entree.nom}`,
    },
    {
      id: "type",
      titre: "Type",
      afficher: (entree) => <StatusBadge statut={entree.type} />,
      valeurTri: (entree) => entree.type,
    },
    {
      id: "nif",
      titre: "NIF",
      afficher: (entree) => entree.nif || "—",
      valeurTri: (entree) => entree.nif,
    },
    {
      id: "stat",
      titre: "STAT",
      afficher: (entree) => entree.stat || "—",
      valeurTri: (entree) => entree.stat ?? "",
    },
    {
      id: "region",
      titre: "Localisation",
      afficher: (entree) => (
        <>
          {entree.ville}
          <small className="sous-ligne-sre">{entree.region}</small>
        </>
      ),
      valeurTri: (entree) => entree.region,
    },
    {
      id: "statut",
      titre: "Compte",
      afficher: (entree) => <StatusBadge statut={entree.statut ?? "SANS_COMPTE"} />,
      valeurTri: (entree) => entree.statut ?? "SANS_COMPTE",
    },
    {
      id: "cree",
      titre: "Créé le",
      afficher: (entree) => formatDate(entree.dateCreationCompte),
      valeurTri: (entree) => entree.dateCreationCompte,
    },
    {
      id: "action",
      titre: "Actions",
      afficher: (entree) => (
        <ActionGroup>
          <ActionIcon
            titre="Consulter le profil"
            href={ROUTES_ADMIN.contribuable(entree.id)}
          >
            <Eye size={15} />
          </ActionIcon>
          <ActionIcon
            titre="Supprimer le profil"
            danger
            onClick={() => onSupprimer(entree)}
          >
            <Trash2 size={15} />
          </ActionIcon>
        </ActionGroup>
      ),
    },
  ];
}
