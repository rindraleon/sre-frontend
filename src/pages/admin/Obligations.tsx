import { Select } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { CirclePlus, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi, mapApiObligation, type ApiObligation } from "@/services/api-client";
import { Button, PageHeader, Modal, DataTable } from "@/components/ui";
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
  const [statut, definirStatut] = useState<string>(TOUS);
  const [modal, definirModal] = useState(false);
  const formulaire = useApiForm<ObligationFormValues>({
    schema: obligationFormSchema,
    valeursInitiales: OBLIGATION_VIDE,
    messageRepli: "Le serveur n’a pas créé l’obligation.",
  });

  const obligations = useMemo(
    () =>
      etat.obligations
        .filter(
          (obligation) =>
            (statut === TOUS || obligation.statut === statut) &&
            `${obligation.referenceFiscale} ${obligation.typeImpotNom} ${obligation.periode} ${etat.contribuables.find((c) => c.id === obligation.contribuableId)?.raisonSociale ?? ""} ${etat.contribuables.find((c) => c.id === obligation.contribuableId)?.nif ?? ""}`
              .toLowerCase()
              .includes(table.recherche.toLowerCase()),
        )
        .sort((a, b) => b.creeLe.localeCompare(a.creeLe)),
    [etat.obligations, etat.contribuables, table.recherche, statut],
  );

  const colonnes = creerColonnesObligations({ contribuables: etat.contribuables });

  const ouvrir = () => {
    formulaire.reinitialiserFormulaire();
    definirModal(true);
  };
  const fermer = () => {
    definirModal(false);
    formulaire.reinitialiserFormulaire();
  };

  const creer = formulaire.handleSubmit(async (valeurs) => {
    formulaire.reinitialiserErreur();
    if (!session?.jetonApi) {
      formulaire.definirErreur("Session serveur introuvable. Reconnectez-vous.");
      return;
    }
    const contribuable = etat.contribuables.find((entree) => entree.id === valeurs.contribuableId);
    const type = etat.typesImpots.find(
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
        description="Consultez les obligations renvoyées par le serveur et créez un enregistrement validé."
        filAriane={["Back-office", "Obligations fiscales"]}
        actions={
          <Button onClick={ouvrir}>
            <CirclePlus size={15} /> Créer une obligation
          </Button>
        }
      />
      <div className="bandeau-info-sre">
        <span>
          <FileText size={17} />
        </span>
        <div>
          <strong>{etat.obligations.length} obligation(s) · MGA</strong>
          <p>
            Les montants et échéances sont saisis par l’administration; aucun barème ou calendrier
            n’est prérempli.
          </p>
        </div>
      </div>
      <DataTable
        lignes={obligations}
        colonnes={colonnes}
        obtenirId={(obligation) => obligation.id}
        recherche={table.recherche}
        rechercher={table.rechercher}
        placeholder="Référence, nom, NIF ou impôt…"
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
              <OptionsSelect options={OPTIONS_STATUT_OBLIGATION_FILTRE} />
            </Select>
          </label>
        }
        espaceVide="Aucune obligation"
        messageVide="Aucune obligation ne correspond à vos critères."
        page={table.page}
        parPage={table.parPage}
        changerPage={table.changerPage}
        changerParPage={table.changerParPage}
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
