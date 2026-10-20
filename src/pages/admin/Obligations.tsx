import { Select } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { CirclePlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi, mapApiObligation, type ApiObligation } from "@/services/api-client";
import { Button, PageHeader, Modal, DataTable, convertirColonnesTanstack } from "@/components/ui";
import { OptionsSelect } from "@/components/forms/options-select";
import { SubmitButton } from "@/components/forms/form-field";
import { ObligationFormFields, OBLIGATION_VIDE } from "@/components/forms/admin/obligation-form";
import { creerColonnesObligations } from "@/components/tables/admin/obligations-columns";
import { useApiForm, useTableState } from "@/hooks";
import { OPTIONS_STATUT_OBLIGATION_FILTRE } from "@/constants/admin-obligations";
import { TOUS } from "@/constants";
import { obligationFormSchema, type ObligationFormValues } from "@/validation/admin.schema";

export function AdminObligationsPage() {
  const { etat, mettreAJourEtat, notifier } = useSre();
  const { session } = useAuth();
  const table = useTableState();
  const [statut, setStatut] = useState<string>(TOUS);
  const [modal, setModal] = useState(false);
  const formulaire = useApiForm<ObligationFormValues>({
    schema: obligationFormSchema,
    valeursInitiales: OBLIGATION_VIDE,
    messageRepli: "Le serveur n’a pas créé l’obligation.",
  });

  const obligations = useMemo(
    () =>
      etat.obligations
        .filter((obligation) => statut === TOUS || obligation.statut === statut)
        .sort((a, b) => b.creeLe.localeCompare(a.creeLe)),
    [etat.obligations, statut],
  );

  const colonnes = creerColonnesObligations({ contribuables: etat.contribuables });

  const ouvrir = () => {
    formulaire.reinitialiserFormulaire();
    setModal(true);
  };
  const fermer = () => {
    setModal(false);
    formulaire.reinitialiserFormulaire();
  };

  const creer = formulaire.handleSubmit(async (valeurs) => {
    formulaire.reinitialiserErreur();
    if (!session?.jetonApi) {
      formulaire.definirErreur("Session serveur introuvable. Reconnectez-vous.");
      return;
    }
    const contribuable = etat.contribuables.some((entree) => entree.id === valeurs.contribuableId);
    const type = etat.typesImpots.some(
      (entree) => entree.id === valeurs.typeImpotId && entree.actif,
    );
    if (!contribuable || !type) {
      formulaire.definirErreur("Sélectionnez un contribuable et un type d’impôt actif.");
      return;
    }
    try {
      const reponse = await callApi<ApiObligation>("obligations", {
        method: "POST",
        token: session.jetonApi,
        body: {
          contribuableId: valeurs.contribuableId,
          typeImpotId: valeurs.typeImpotId,
          periode: valeurs.periode.trim(),
          montant: valeurs.montant,
          echeance: valeurs.echeance,
        },
      });
      const obligation = mapApiObligation(reponse);
      mettreAJourEtat((courant) => ({
        ...courant,
        obligations: [obligation, ...courant.obligations],
      }));
      notifier("Obligation enregistrée sur le serveur.", "succes");
      fermer();
    } catch (cause) {
      formulaire.traiterEchec(cause);
    }
  });

  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Obligations fiscales"
        description="Obligations enregistrées dans le périmètre du service."
        filAriane={["Accueil", "Obligations fiscales"]}
      />
      
      <DataTable
        data={obligations}
        columns={convertirColonnesTanstack(colonnes)}
        label="Obligations fiscales"
        getRowId={(obligation) => obligation.id}
        getSearchText={(obligation) => {
          const contribuable = etat.contribuables.find(
            (entree) => entree.id === obligation.contribuableId,
          );
          return `${obligation.referenceFiscale} ${obligation.typeImpotNom} ${obligation.periode} ${contribuable?.raisonSociale ?? ""} ${contribuable?.prenom ?? ""} ${contribuable?.nom ?? ""} ${contribuable?.nif ?? ""} ${contribuable?.courriel ?? ""}`;
        }}
        searchPlaceholder="Référence, nom, NIF ou impôt…"
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
              <OptionsSelect options={OPTIONS_STATUT_OBLIGATION_FILTRE} />
            </Select>
          </label>
        }
        actionPrimary={
          <Button onClick={ouvrir}>
            <CirclePlus size={15} /> Créer une obligation
          </Button>
        }
        columnToggle
        emptyTitle="Aucune obligation"
        emptyDescription="Aucune obligation ne correspond à vos critères."
        page={table.page}
        rowsPerPage={table.parPage}
        onPageChange={table.changerPage}
        onRowsPerPageChange={table.changerParPage}
      />
      <Modal
        ouvert={modal}
        titre="Créer une obligation"
        description="Les valeurs seront persistées par le serveur et doivent correspondre aux règles validées."
        fermer={fermer}
        fermetureBloquee={formulaire.isSubmitting}
        largeur="large"
        pied={
          <>
            <Button variante="contour" onClick={fermer} disabled={formulaire.isSubmitting}>
              Annuler
            </Button>
            <SubmitButton
              form="formulaire-obligation-admin"
              enCours={formulaire.isSubmitting}
              libelleEnCours="Enregistrement…"
            >
              Créer l’obligation
            </SubmitButton>
          </>
        }
      >
        <form id="formulaire-obligation-admin" onSubmit={creer} noValidate>
          <ObligationFormFields formulaire={formulaire} erreur={formulaire.erreur} />
        </form>
      </Modal>
    </div>
  );
}
