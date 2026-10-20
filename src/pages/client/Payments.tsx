import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CircleDollarSign } from "lucide-react";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader, DataTable, convertirColonnesTanstack } from "@/components/ui";
import { OptionsSelect } from "@/components/forms/options-select";
import { creerColonnesPaiements } from "@/components/tables/client/payments-columns";
import { useTableState } from "@/hooks";
import { TOUS, ROUTES_CLIENT } from "@/constants";
import { OPTIONS_STATUT_PAIEMENT } from "@/constants/client-paiements";

export function ClientPaymentsPage() {
  const { session } = useAuth();
  const { etat } = useSre();
  const table = useTableState();
  const [statut, setStatut] = useState<string>(TOUS);
  const paiements = useMemo(
    () =>
      etat.paiements
        .filter((paiement) => paiement.contribuableId === session?.contribuableId)
        .filter((paiement) => statut === TOUS || paiement.statut === statut)
        .sort((a, b) => b.soumisLe.localeCompare(a.soumisLe)),
    [etat.paiements, session?.contribuableId, statut],
  );
  const colonnes = creerColonnesPaiements();
  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Historique des paiements"
        description="Déclarations associées à votre compte."
        filAriane={["Accueil", "Historique des paiements"]}
      />
      <DataTable
        data={paiements}
        columns={convertirColonnesTanstack(colonnes)}
        label="Historique des paiements"
        getRowId={(paiement) => paiement.id}
        getSearchText={(paiement) =>
          `${paiement.referenceInterne} ${paiement.referenceTransaction} ${paiement.typeImpotNom} ${paiement.periode}`
        }
        searchPlaceholder="Référence, impôt, période…"
        searchValue={table.recherche}
        onSearchChange={table.rechercher}
        toolbarActions={
          <label className="filtre-compact-sre">
            Statut
            <Select
              value={statut}
              onChange={(event) => {
                setStatut(event.target.value);
                table.reinitialiserPage();
              }}
            >
              <OptionsSelect options={OPTIONS_STATUT_PAIEMENT} />
            </Select>
          </label>
        }
        actionPrimary={
          <Link className="bouton-sre bouton-sre--primaire" to={ROUTES_CLIENT.nouveauPaiement}>
            <CircleDollarSign size={16} /> Déclarer un paiement
          </Link>
        }
        columnToggle
        emptyTitle="Aucune déclaration"
        emptyDescription="Les déclarations enregistrées apparaîtront ici."
        page={table.page}
        rowsPerPage={table.parPage}
        onPageChange={table.changerPage}
        onRowsPerPageChange={table.changerParPage}
      />
    </div>
  );
}
