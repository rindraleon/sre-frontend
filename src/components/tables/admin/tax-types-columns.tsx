import { Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import type { TaxType } from "@/types";
import { StatusBadge, Button, type TableColumn } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

const libellesPeriodicite: Record<TaxType["periodicite"], string> = {
  MENSUELLE: "Mensuelle",
  TRIMESTRIELLE: "Trimestrielle",
  ANNUELLE: "Annuelle",
  PONCTUELLE: "Ponctuelle",
};

function TaxTypeNameCell({ type }: Readonly<{ type: TaxType }>) {
  return (
    <div>
      <strong>{type.nom}</strong>
      <small className="sous-ligne-sre">
        {type.code} · {type.description}
      </small>
    </div>
  );
}

export function creerColonnesTypesImpot({
  onModifier,
  onBasculer,
}: Readonly<{
  onModifier: (type: TaxType) => void;
  onBasculer: (type: TaxType) => void;
}>): TableColumn<TaxType>[] {
  return [
    {
      id: "nom",
      titre: "Type d’impôt",
      afficher: (type) => <TaxTypeNameCell type={type} />,
      valeurTri: (type) => type.nom,
    },
    {
      id: "categorie",
      titre: "Catégorie",
      afficher: (type) => type.categorie,
      valeurTri: (type) => type.categorie,
    },
    {
      id: "concernes",
      titre: "Contribuables concernés",
      afficher: (type) => {
        if (type.contribuablesConcernes === "TOUS") return "Tous";
        if (type.contribuablesConcernes === "ENTREPRISE") return "Entreprises";
        return "Particuliers";
      },
      valeurTri: (type) => type.contribuablesConcernes,
    },
    {
      id: "periodicite",
      titre: "Périodicité",
      afficher: (type) => libellesPeriodicite[type.periodicite],
      valeurTri: (type) => type.periodicite,
    },
    {
      id: "montant",
      titre: "Montant de référence",
      afficher: (type) =>
        type.montantReference == null ? "Non défini" : formatMoney(type.montantReference),
      valeurTri: (type) => type.montantReference ?? 0,
    },
    {
      id: "statut",
      titre: "Statut",
      afficher: (type) => <StatusBadge statut={type.actif ? "ACTIF" : "INACTIF"} />,
      valeurTri: (type) => String(type.actif),
    },
    {
      id: "date",
      titre: "Modifié le",
      afficher: (type) => formatDate(type.modifieLe),
      valeurTri: (type) => type.modifieLe,
    },
    {
      id: "action",
      titre: "Actions",
      afficher: (type) => (
        <div className="actions-tableau-sre">
          <Button variante="fantome" taille="petit" onClick={() => onModifier(type)}>
            <Pencil size={13} /> Modifier
          </Button>
          <Button variante="fantome" taille="petit" onClick={() => onBasculer(type)}>
            {type.actif ? (
              <>
                <ToggleRight size={14} /> Désactiver
              </>
            ) : (
              <>
                <ToggleLeft size={14} /> Réactiver
              </>
            )}
          </Button>
        </div>
      ),
    },
  ];
}
