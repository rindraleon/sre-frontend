import { Select } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CircleDollarSign, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader, DataTable, convertirColonnesTanstack } from "@/components/ui";
import { OptionsSelect } from "@/components/forms/options-select";
import { creerColonnesObligations } from "@/components/tables/client/obligations-columns";
import { useTableState } from "@/hooks";
import { OPTIONS_STATUT_OBLIGATION, ROUTES_CLIENT, TOUS } from "@/constants";
import { formatMoney } from "@/utils/format";

export function ClientObligationsPage() {
  const { session } = useAuth();
  const { etat } = useSre();
  const table = useTableState();
  const [statut, setStatut] = useState<string>(TOUS);
  const obligationsPersonnelles = useMemo(
    () =>
      etat.obligations.filter(
        (obligation) => obligation.contribuableId === session?.contribuableId,
      ),
    [etat.obligations, session?.contribuableId],
  );

  const colonnes = creerColonnesObligations();

  const montantOuvert = obligationsPersonnelles
    .filter((obligation) => obligation.statut !== "PAYE")
    .reduce((somme, obligation) => somme + obligation.montant, 0);

  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Mes obligations fiscales"
        description="Obligations enregistrées pour votre compte."
        filAriane={["Accueil", "Mes impôts"]}
      />
      <div className="bandeau-info-sre">
        <span>
          <FileText size={17} />
        </span>
        <div>
          <strong>
            {obligationsPersonnelles.length} obligation
            {obligationsPersonnelles.length === 1 ? "" : "s"} · {formatMoney(montantOuvert)} à
            suivre
          </strong>
        </div>
      </div>
      <DataTable
        data={obligationsPersonnelles.filter(
          (obligation) => statut === TOUS || obligation.statut === statut,
        )}
        columns={convertirColonnesTanstack(colonnes)}
        label="Mes obligations fiscales"
        getRowId={(obligation) => obligation.id}
        searchPlaceholder="Référence, impôt ou période…"
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
              <OptionsSelect options={OPTIONS_STATUT_OBLIGATION} />
            </Select>
          </label>
        }
        actionPrimary={
          <Link className="bouton-sre bouton-sre--primaire" to={ROUTES_CLIENT.nouveauPaiement}>
            <CircleDollarSign size={16} /> Déclarer un paiement
          </Link>
        }
        columnToggle
        emptyTitle="Aucune obligation"
        emptyDescription="Aucune obligation ne correspond à votre recherche."
        page={table.page}
        rowsPerPage={table.parPage}
        onPageChange={table.changerPage}
        onRowsPerPageChange={table.changerParPage}
      />
      <section className="note-fiscale-sre">
        <span>i</span>
        <p>
          <strong>À noter :</strong> une déclaration de paiement créée dans le portail reste « En
          vérification » jusqu’à une décision explicite. L’application ne traite aucun mouvement de
          fonds.
        </p>
      </section>
    </div>
  );
}
