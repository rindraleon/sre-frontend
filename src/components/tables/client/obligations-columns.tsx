import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { TaxObligation } from "@/types";
import { ROUTES_CLIENT } from "@/constants";
import { StatusBadge, type TableColumn } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

/** Colonnes du tableau des obligations fiscales du contribuable (espace client). */
export function creerColonnesObligations(): TableColumn<TaxObligation>[] {
  return [
    {
      id: "reference",
      titre: "Référence",
      afficher: (obligation) => (
        <Link className="reference-sre" to={ROUTES_CLIENT.obligation(obligation.id)}>
          {obligation.referenceFiscale}
        </Link>
      ),
      valeurTri: (obligation) => obligation.referenceFiscale,
    },
    {
      id: "impot",
      titre: "Impôt / catégorie",
      afficher: (obligation) => <strong>{obligation.typeImpotNom}</strong>,
      valeurTri: (obligation) => obligation.typeImpotNom,
    },
    {
      id: "periode",
      titre: "Période",
      afficher: (obligation) => obligation.periode,
      valeurTri: (obligation) => obligation.periode,
    },
    {
      id: "echeance",
      titre: "Échéance enregistrée",
      afficher: (obligation) => formatDate(obligation.echeance),
      valeurTri: (obligation) => obligation.echeance,
    },
    {
      id: "montant",
      titre: "Montant enregistré",
      afficher: (obligation) => (
        <span className="montant-sre">{formatMoney(obligation.montant)}</span>
      ),
      valeurTri: (obligation) => obligation.montant,
    },
    {
      id: "statut",
      titre: "Statut",
      afficher: (obligation) => <StatusBadge statut={obligation.statut} />,
      valeurTri: (obligation) => obligation.statut,
    },
    {
      id: "action",
      titre: "Action",
      afficher: (obligation) => (
        <Link className="lien-action-sre" to={ROUTES_CLIENT.obligation(obligation.id)}>
          Détails <ArrowRight size={13} />
        </Link>
      ),
    },
  ];
}
