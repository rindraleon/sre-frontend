import { Select } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { Clock3, ShieldCheck } from "lucide-react";
import { useSre } from "@/context/SreContext";
import { PageHeader, DataTable } from "@/components/ui";
import { OptionsSelect } from "@/components/forms/options-select";
import { creerColonnesPaiements } from "@/components/tables/admin/payments-columns";
import { useTableState } from "@/hooks";
import { OPTIONS_STATUT_PAIEMENT_FILTRE } from "@/constants/admin-payments";
import { TOUS } from "@/constants";

export function AdminPaymentsPage({ verificationSeule = false }: { verificationSeule?: boolean }) {
  const { etat } = useSre();
  const table = useTableState();
  const [statut, definirStatut] = useState<string>(verificationSeule ? "EN_VERIFICATION" : TOUS);
  const paiements = useMemo(
    () =>
      etat.paiements
        .filter(
          (paiement) =>
            (statut === TOUS || paiement.statut === statut) &&
            (!verificationSeule || paiement.statut === "EN_VERIFICATION") &&
            `${paiement.referenceInterne} ${paiement.referenceTransaction} ${paiement.typeImpotNom} ${etat.contribuables.find((c) => c.id === paiement.contribuableId)?.raisonSociale ?? ""} ${etat.contribuables.find((c) => c.id === paiement.contribuableId)?.nif ?? ""}`
              .toLowerCase()
              .includes(table.recherche.toLowerCase()),
        )
        .sort((a, b) => b.soumisLe.localeCompare(a.soumisLe)),
    [etat.paiements, etat.contribuables, statut, table.recherche, verificationSeule],
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
          "Back-office",
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
      <div className="bandeau-alerte-securite-sre">
        <ShieldCheck size={18} />
        <div>
          <strong>Une référence déclarée ne confirme pas un paiement.</strong>
          <p>
            Le portail ne communique avec aucun établissement financier. Les décisions doivent
            reposer sur les contrôles administratifs applicables.
          </p>
        </div>
      </div>
      <DataTable
        lignes={paiements}
        colonnes={colonnes}
        obtenirId={(paiement) => paiement.id}
        recherche={table.recherche}
        rechercher={table.rechercher}
        placeholder="Référence, contribuable ou NIF…"
        actionsEntete={
          !verificationSeule ? (
            <label className="filtre-compact-sre">
              Statut
              <Select
                value={statut}
                onChange={(event) => {
                  definirStatut(event.target.value);
                  table.reinitialiserPage();
                }}
              >
                <OptionsSelect options={OPTIONS_STATUT_PAIEMENT_FILTRE} />
              </Select>
            </label>
          ) : undefined
        }
        espaceVide={verificationSeule ? "Aucune déclaration en attente" : "Aucune déclaration"}
        messageVide={
          verificationSeule
            ? "La file de vérification est vide."
            : "Les déclarations enregistrées apparaîtront ici."
        }
        page={table.page}
        parPage={table.parPage}
        changerPage={table.changerPage}
        changerParPage={table.changerParPage}
      />
    </div>
  );
}
