import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Payment, Taxpayer } from "@/types";
import { ROUTES_ADMIN } from "@/constants";
import { StatusBadge, type TableColumn } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

export function creerColonnesPaiements({
  contribuables,
}: Readonly<{ contribuables: Taxpayer[] }>): TableColumn<Payment>[] {
  return [
    {
      id: "ref",
      titre: "Référence",
      afficher: (paiement) => (
        <Link className="reference-sre" to={ROUTES_ADMIN.paiement(paiement.id)}>
          {paiement.referenceInterne}
        </Link>
      ),
      valeurTri: (paiement) => paiement.referenceInterne,
    },
    {
      id: "contribuable",
      titre: "Contribuable",
      afficher: (paiement) => {
        const c = contribuables.find((entree) => entree.id === paiement.contribuableId);
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
      valeurTri: (paiement) =>
        contribuables.find((e) => e.id === paiement.contribuableId)?.raisonSociale ?? "",
    },
    {
      id: "impot",
      titre: "Impôt / période",
      afficher: (paiement) => (
        <>
          {paiement.typeImpotNom}
          <small className="sous-ligne-sre">{paiement.periode}</small>
        </>
      ),
      valeurTri: (paiement) => paiement.typeImpotNom,
    },
    {
      id: "montant",
      titre: "Montant déclaré",
      afficher: (paiement) => <strong>{formatMoney(paiement.montant)}</strong>,
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
      titre: "Soumis le",
      afficher: (paiement) => formatDate(paiement.soumisLe, true),
      valeurTri: (paiement) => paiement.soumisLe,
    },
    {
      id: "statut",
      titre: "Statut",
      afficher: (paiement) => <StatusBadge statut={paiement.statut} />,
      valeurTri: (paiement) => paiement.statut,
    },
    {
      id: "action",
      titre: "",
      afficher: (paiement) => (
        <Link className="lien-action-sre" to={ROUTES_ADMIN.paiement(paiement.id)}>
          {paiement.statut === "EN_VERIFICATION" ? "Examiner" : "Détails"} <ArrowRight size={13} />
        </Link>
      ),
    },
  ];
}
