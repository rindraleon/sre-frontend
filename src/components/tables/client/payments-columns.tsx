import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Payment } from "@/types";
import { ROUTES_CLIENT } from "@/constants";
import { StatusBadge, type TableColumn } from "@/components/ui";
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
      titre: "",
      afficher: (paiement) => (
        <Link className="lien-action-sre" to={ROUTES_CLIENT.paiement(paiement.id)}>
          Suivre <ArrowRight size={13} />
        </Link>
      ),
    },
  ];
}
