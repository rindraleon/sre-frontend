import type { LigneRetard } from "@/types";
import { StatusBadge, type TableColumn } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

const LIBELLES_SITUATION: Record<LigneRetard["situation"], string> = {
  REGULARISE: "Régularisé",
  EN_VERIFICATION: "En vérification",
  REJETE: "Rejeté",
  CORRECTION_DEMANDEE: "Correction demandée",
  EN_RETARD: "En retard",
  EN_ATTENTE: "En attente",
};

/** Colonnes du tableau de suivi des retards (back-office). */
export function creerColonnesRetards(): TableColumn<LigneRetard>[] {
  return [
    {
      id: "entite",
      titre: "Entité",
      afficher: (ligne) => (
        <div>
          <strong>{ligne.entite.nom}</strong>
          <small className="sous-ligne-sre">{ligne.entite.courriel ?? "—"}</small>
        </div>
      ),
      valeurTri: (ligne) => ligne.entite.nom,
    },
    {
      id: "stat",
      titre: "STAT",
      afficher: (ligne) => ligne.entite.stat || "—",
      valeurTri: (ligne) => ligne.entite.stat ?? "",
    },
    {
      id: "reference",
      titre: "Dossier",
      afficher: (ligne) => (
        <div>
          <strong>{ligne.referenceFiscale}</strong>
          <small className="sous-ligne-sre">
            {ligne.typeImpot} · {ligne.periode}
          </small>
        </div>
      ),
      valeurTri: (ligne) => ligne.referenceFiscale,
    },
    {
      id: "echeance",
      titre: "Échéance",
      afficher: (ligne) => formatDate(ligne.echeance),
      valeurTri: (ligne) => ligne.echeance,
    },
    {
      id: "retard",
      titre: "Jours de retard",
      afficher: (ligne) =>
        ligne.joursRetard > 0 ? (
          <strong className="text-destructive">{ligne.joursRetard} j</strong>
        ) : (
          "—"
        ),
      valeurTri: (ligne) => ligne.joursRetard,
    },
    {
      id: "montant",
      titre: "Montant",
      afficher: (ligne) => formatMoney(Number(ligne.montant)),
      valeurTri: (ligne) => Number(ligne.montant),
    },
    {
      id: "situation",
      titre: "Situation",
      afficher: (ligne) => <StatusBadge statut={ligne.situation} />,
      valeurTri: (ligne) => ligne.situation,
    },
    {
      id: "statut",
      titre: "Statut du dossier",
      afficher: (ligne) => <StatusBadge statut={ligne.statut} />,
      valeurTri: (ligne) => ligne.statut,
    },
  ];
}

export { LIBELLES_SITUATION };
