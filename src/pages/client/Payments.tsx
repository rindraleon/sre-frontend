import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CircleDollarSign } from "lucide-react";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader, DataTable } from "@/components/ui";
import { OptionsSelect } from "@/components/forms/options-select";
import { creerColonnesPaiements } from "@/components/tables/client/payments-columns";
import { useTableState } from "@/hooks";
import { TOUS, ROUTES_CLIENT } from "@/constants";
import { OPTIONS_STATUT_PAIEMENT } from "@/constants/client-paiements";

export function ClientPaymentsPage() {
  const { session } = useAuth();
  const { etat } = useSre();
  const table = useTableState();
  const [statut, definirStatut] = useState<string>(TOUS);
  const paiements = useMemo(
    () =>
      etat.paiements
        .filter((paiement) => paiement.contribuableId === session?.contribuableId)
        .filter(
          (paiement) =>
            (statut === TOUS || paiement.statut === statut) &&
            `${paiement.referenceInterne} ${paiement.referenceTransaction} ${paiement.typeImpotNom} ${paiement.periode}`
              .toLowerCase()
              .includes(table.recherche.toLowerCase()),
        )
        .sort((a, b) => b.soumisLe.localeCompare(a.soumisLe)),
    [etat.paiements, session?.contribuableId, statut, table.recherche],
  );
  const colonnes = creerColonnesPaiements();
  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Historique des paiements"
        description="Suivez les déclarations associées à votre compte."
        filAriane={["Mon espace", "Historique des paiements"]}
        actions={
          <Link className="bouton-sre bouton-sre--primaire" to={ROUTES_CLIENT.nouveauPaiement}>
            <CircleDollarSign size={16} /> Déclarer un paiement
          </Link>
        }
      />
      <DataTable
        lignes={paiements}
        colonnes={colonnes}
        obtenirId={(paiement) => paiement.id}
        recherche={table.recherche}
        rechercher={table.rechercher}
        placeholder="Référence, impôt, période…"
        actionsEntete={
          <label className="filtre-compact-sre">
            Statut
            <Select
              value={statut}
              onChange={(event) => {
                definirStatut(event.target.value);
                table.reinitialiserPage();
              }}
            >
              <OptionsSelect options={OPTIONS_STATUT_PAIEMENT} />
            </Select>
          </label>
        }
        espaceVide="Aucune déclaration"
        messageVide="Les déclarations enregistrées apparaîtront ici."
        page={table.page}
        parPage={table.parPage}
        changerPage={table.changerPage}
        changerParPage={table.changerParPage}
      />
    </div>
  );
}
