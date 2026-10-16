import type { TaxObligation, Taxpayer } from "@/types";
import { StatusBadge, type TableColumn } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

export function creerColonnesObligations({
  contribuables,
}: Readonly<{ contribuables: Taxpayer[] }>): TableColumn<TaxObligation>[] {
  return [
    {
      id: "ref",
      titre: "Référence",
      afficher: (obligation) => <strong>{obligation.referenceFiscale}</strong>,
      valeurTri: (obligation) => obligation.referenceFiscale,
    },
    {
      id: "contribuable",
      titre: "Contribuable",
      afficher: (obligation) => {
        const c = contribuables.find((entree) => entree.id === obligation.contribuableId);
        return (
          <div>
            <strong>
              {c?.raisonSociale ||
                `${c?.prenom ?? ""} ${c?.nom ?? ""}`.trim() ||
                "Profil indisponible"}
            </strong>
            <small className="sous-ligne-sre">{c?.nif || c?.courriel || "—"}</small>
          </div>
        );
      },
      valeurTri: (obligation) =>
        contribuables.find((e) => e.id === obligation.contribuableId)?.raisonSociale ?? "",
    },
    {
      id: "impot",
      titre: "Impôt / catégorie",
      afficher: (obligation) => obligation.typeImpotNom,
      valeurTri: (obligation) => obligation.typeImpotNom,
    },
    {
      id: "periode",
      titre: "Période",
      afficher: (obligation) => obligation.periode,
      valeurTri: (obligation) => obligation.periode,
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
      id: "echeance",
      titre: "Échéance",
      afficher: (obligation) => formatDate(obligation.echeance),
      valeurTri: (obligation) => obligation.echeance,
    },
    {
      id: "statut",
      titre: "Statut",
      afficher: (obligation) => <StatusBadge statut={obligation.statut} />,
      valeurTri: (obligation) => obligation.statut,
    },
  ];
}
