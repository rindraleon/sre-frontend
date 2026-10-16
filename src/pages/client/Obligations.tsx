import { Select } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader, DataTable } from "@/components/ui";
import { OptionsSelect } from "@/components/forms/options-select";
import { creerColonnesObligations } from "@/components/tables/client/obligations-columns";
import { useTableState } from "@/hooks";
import { OPTIONS_STATUT_OBLIGATION, TOUS } from "@/constants";
import { formatMoney } from "@/utils/format";

export function ClientObligationsPage() {
  const { session } = useAuth();
  const { etat } = useSre();
  const table = useTableState();
  const [statut, definirStatut] = useState<string>(TOUS);
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
        description="Consultez les données enregistrées pour votre compte."
        filAriane={["Mon espace", "Mes impôts"]}
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
          <p>
            Les montants et échéances présentés sont ceux enregistrés dans le portail. Aucun barème
            fiscal n’est calculé automatiquement.
          </p>
        </div>
      </div>
      <DataTable
        lignes={obligationsPersonnelles.filter(
          (obligation) => statut === TOUS || obligation.statut === statut,
        )}
        colonnes={colonnes}
        obtenirId={(obligation) => obligation.id}
        recherche={table.recherche}
        rechercher={table.rechercher}
        placeholder="Référence, impôt ou période…"
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
              <OptionsSelect options={OPTIONS_STATUT_OBLIGATION} />
            </Select>
          </label>
        }
        espaceVide="Aucune obligation"
        messageVide="Aucune obligation ne correspond à votre recherche."
        page={table.page}
        parPage={table.parPage}
        changerPage={table.changerPage}
        changerParPage={table.changerParPage}
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
