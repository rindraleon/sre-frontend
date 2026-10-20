import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import type { Payment } from "@/types";
import { ROUTES_CLIENT } from "@/constants";
import { ActionGroup, ActionIcon, StatusBadge, type TableColumn } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

/** Colonnes du tableau de l'historique des paiements du contribuable (espace client). */
export function creerColonnesPaiements(): TableColumn<Payment>[] {
  return [
    {
      id: "ref",
      titre: "Référence",
      afficher: (paiement) => (
        <Link className="reference-sre" to={ROUTES_CLIENT.paiement(paiement.id)}>
          {paiement.referenceInterne}
        </Link>
      ),
      valeurTri: (paiement) => paiement.referenceInterne,
    },
    {
      id: "impot",
      titre: "Impôt / période",
      afficher: (paiement) => (
        <>
          <strong>{paiement.typeImpotNom}</strong>
          <small className="sous-ligne-sre">{paiement.periode}</small>
        </>
      ),
      valeurTri: (paiement) => paiement.typeImpotNom,
    },
    {
      id: "montant",
      titre: "Montant déclaré",
      afficher: (paiement) => <span className="montant-sre">{formatMoney(paiement.montant)}</span>,
      valeurTri: (paiement) => paiement.montant,
    },
    {
      id: "mode",
      titre: "Mode déclaré",
      afficher: (paiement) => <StatusBadge statut={paiement.mode} />,
      valeurTri: (paiement) => paiement.mode,
    },
    {
      id: "soumis",
      titre: "Date de déclaration",
      afficher: (paiement) => formatDate(paiement.soumisLe),
      valeurTri: (paiement) => paiement.soumisLe,
    },
    {
      id: "statut",
      titre: "Statut",
      afficher: (paiement) => <StatusBadge statut={paiement.statut} />,
      valeurTri: (paiement) => paiement.statut,
    },
    {
      id: "actions",
      titre: "Actions",
      afficher: (paiement) => (
        <ActionGroup>
          <ActionIcon
            titre="Suivre la déclaration"
            href={ROUTES_CLIENT.paiement(paiement.id)}
          >
            <Eye size={15} />
          </ActionIcon>
        </ActionGroup>
      ),
    },
  ];
}
