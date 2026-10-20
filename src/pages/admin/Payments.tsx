import { Select } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { Clock3 } from "lucide-react";
import { useSre } from "@/context/SreContext";
import { PageHeader, DataTable, convertirColonnesTanstack } from "@/components/ui";
import { OptionsSelect } from "@/components/forms/options-select";
import { creerColonnesPaiements } from "@/components/tables/admin/payments-columns";
import { useTableState } from "@/hooks";
import { OPTIONS_STATUT_PAIEMENT_FILTRE } from "@/constants/admin-payments";
import { TOUS } from "@/constants";

export function AdminPaymentsPage({ verificationSeule = false }: Readonly<{ verificationSeule?: boolean }>) {
  const { etat } = useSre();
  const table = useTableState();
  const [statut, setStatut] = useState<string>(verificationSeule ? "EN_VERIFICATION" : TOUS);
  const paiements = useMemo(
    () =>
      etat.paiements
        .filter(
          (paiement) =>
            (statut === TOUS || paiement.statut === statut) &&
            (!verificationSeule || paiement.statut === "EN_VERIFICATION"),
        )
        .sort((a, b) => b.soumisLe.localeCompare(a.soumisLe)),
    [etat.paiements, statut, verificationSeule],
  );
  const colonnes = creerColonnesPaiements({ contribuables: etat.contribuables });
  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre={verificationSeule ? "Vérification des paiements" : "Historique des paiements"}
        description={
          verificationSeule
            ? "Examinez chaque déclaration avant d’enregistrer une décision."
            : "Historique partagé des déclarations et décisions."
        }
        filAriane={[
          "Accueil",
          verificationSeule ? "Vérification des paiements" : "Historique des paiements",
        ]}
        actions={
          verificationSeule && (
            <span className="badge-attente-gros-sre">
              <Clock3 size={14} />{" "}
              {etat.paiements.filter((paiement) => paiement.statut === "EN_VERIFICATION").length} à
              vérifier
            </span>
          )
        }
      />

      <DataTable
        data={paiements}
        columns={convertirColonnesTanstack(colonnes)}
        label={verificationSeule ? "Paiements à vérifier" : "Historique des paiements"}
        getRowId={(paiement) => paiement.id}
        getSearchText={(paiement) => {
          const contribuable = etat.contribuables.find(
            (entree) => entree.id === paiement.contribuableId,
          );
          return `${paiement.referenceInterne} ${paiement.referenceTransaction} ${paiement.typeImpotNom} ${paiement.periode} ${contribuable?.raisonSociale ?? ""} ${contribuable?.prenom ?? ""} ${contribuable?.nom ?? ""} ${contribuable?.nif ?? ""} ${contribuable?.courriel ?? ""}`;
        }}
        searchPlaceholder="Référence, contribuable ou NIF…"
        searchValue={table.recherche}
        onSearchChange={table.rechercher}
        toolbarActions={
          !verificationSeule ? (
            <label className="filtre-compact-sre">
              Statut
              <Select
                value={statut}
                onChange={(event) => {
                  setStatut(event.target.value);
                  table.reinitialiserPage();
                }}
              >
                <OptionsSelect options={OPTIONS_STATUT_PAIEMENT_FILTRE} />
              </Select>
            </label>
          ) : undefined
        }
        columnToggle
        emptyTitle={verificationSeule ? "Aucune déclaration en attente" : "Aucune déclaration"}
        emptyDescription={
          verificationSeule
            ? "La file de vérification est vide."
            : "Les déclarations enregistrées apparaîtront ici."
        }
        page={table.page}
        rowsPerPage={table.parPage}
        onPageChange={table.changerPage}
        onRowsPerPageChange={table.changerParPage}
      />
    </div>
  );
}
