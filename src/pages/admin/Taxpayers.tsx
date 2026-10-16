import { useMemo, useState } from "react";
import { Building2, CirclePlus } from "lucide-react";
import type { Taxpayer } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi, mapApiTaxpayer, type ApiTaxpayer } from "@/services/api-client";
import {
  SRE_REGION,
  OPTIONS_TYPE_CONTRIBUABLE,
  MSG_SESSION_MANQUANTE_ADMIN,
  TOUS,
} from "@/constants";
import { Button, ConfirmDialog, PageHeader, Modal, DataTable } from "@/components/ui";
import { OptionsSelect } from "@/components/forms/options-select";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/forms/form-field";
import { TaxpayerFormFields, PROFIL_VIDE } from "@/components/forms/admin/taxpayer-form";
import { creerColonnesContribuables } from "@/components/tables/admin/taxpayers-columns";
import { useApiForm, useTableState, useConfirmation } from "@/hooks";
import { taxpayerFormSchema, type TaxpayerFormValues } from "@/validation/profile.schema";

export function AdminTaxpayersPage({
  typeInitial = TOUS,
}: { typeInitial?: "TOUS" | "ENTREPRISE" } = {}) {
  const { etat, mettreAJourEtat, notifier } = useSre();
  const { session } = useAuth();
  const table = useTableState();
  const [typeFiltre, definirTypeFiltre] = useState<string>(typeInitial);
  const [modal, definirModal] = useState(false);
  const suppression = useConfirmation<Taxpayer>();
  const formulaire = useApiForm<TaxpayerFormValues>({
    schema: taxpayerFormSchema,
    valeursInitiales: PROFIL_VIDE,
    messageRepli: "Le serveur n’a pas enregistré le profil.",
  });

  const contribuables = useMemo(
    () =>
      etat.contribuables.filter(
        (contribuable) =>
          (typeFiltre === TOUS || contribuable.type === typeFiltre) &&
          `${contribuable.nom} ${contribuable.prenom ?? ""} ${contribuable.raisonSociale ?? ""} ${contribuable.nif} ${contribuable.stat ?? ""} ${contribuable.courriel}`
            .toLowerCase()
            .includes(table.recherche.toLowerCase()),
      ),
    [etat.contribuables, table.recherche, typeFiltre],
  );

  const colonnes = creerColonnesContribuables({ onSupprimer: suppression.ouvrir });

  const fermer = () => {
    definirModal(false);
    formulaire.reinitialiserFormulaire();
  };

  const creer = formulaire.handleSubmit(async (valeurs) => {
    formulaire.reinitialiserErreur();
    if (!session?.jetonApi) {
      formulaire.definirErreur(MSG_SESSION_MANQUANTE_ADMIN);
      return;
    }
    try {
      const corps = {
        type: valeurs.type,
        nom: valeurs.nom.trim() || valeurs.raisonSociale?.trim() || "",
        ...(valeurs.prenom?.trim() ? { prenom: valeurs.prenom.trim() } : {}),
        ...(valeurs.raisonSociale?.trim() ? { raisonSociale: valeurs.raisonSociale.trim() } : {}),
        ...(valeurs.nomCommercial?.trim() ? { nomCommercial: valeurs.nomCommercial.trim() } : {}),
        ...(valeurs.nif.trim() ? { nif: valeurs.nif.trim() } : {}),
        ...(valeurs.stat?.trim() ? { stat: valeurs.stat.trim() } : {}),
        adresse: valeurs.adresse.trim(),
        region: SRE_REGION,
        ville: valeurs.ville.trim(),
        courriel: valeurs.courriel.trim().toLowerCase(),
        telephone: valeurs.telephone.trim(),
        ...(valeurs.representantLegal?.trim()
          ? { representantLegal: valeurs.representantLegal.trim() }
          : {}),
        ...(valeurs.nomContact?.trim() ? { nomContact: valeurs.nomContact.trim() } : {}),
        ...(valeurs.prenomContact?.trim() ? { prenomContact: valeurs.prenomContact.trim() } : {}),
        ...(valeurs.fonctionContact?.trim()
          ? { fonctionContact: valeurs.fonctionContact.trim() }
          : {}),
      };
      const reponse = await callApi<ApiTaxpayer>("contribuables", {
        method: "POST",
        token: session.jetonApi,
        body: corps,
      });
      const nouveau = mapApiTaxpayer(reponse);
      mettreAJourEtat((courant) => ({
        ...courant,
        contribuables: [nouveau, ...courant.contribuables],
      }));
      notifier("Profil contribuable enregistré.", "succes");
      fermer();
    } catch (cause) {
      formulaire.traiterEchec(cause);
    }
  });

  const supprimer = async (cible: Taxpayer) => {
    if (!session?.jetonApi) throw new Error(MSG_SESSION_MANQUANTE_ADMIN);
    await callApi<{ message: string }>(`contribuables/${encodeURIComponent(cible.id)}`, {
      method: "DELETE",
      token: session.jetonApi,
    });
    mettreAJourEtat((courant) => ({
      ...courant,
      contribuables: courant.contribuables.filter((entree) => entree.id !== cible.id),
    }));
    notifier("Profil contribuable supprimé.", "succes");
  };

  const entreprise = typeInitial === "ENTREPRISE";

  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre={entreprise ? "Entreprises" : "Contribuables"}
        description={`Profils du périmètre ${SRE_REGION}. Un profil n’est pas un compte utilisateur.`}
        filAriane={["Back-office", entreprise ? "Entreprises" : "Contribuables"]}
        actions={
          <Button
            onClick={() => {
              definirModal(true);
              formulaire.reinitialiserErreur();
            }}
          >
            <CirclePlus size={15} /> Ajouter un profil
          </Button>
        }
      />
      <div className="bandeau-info-sre">
        <span>
          <Building2 size={17} />
        </span>
        <div>
          <strong>
            {contribuables.length} profil{contribuables.length === 1 ? "" : "s"} ·{" "}
            {contribuables.filter((e) => e.type === "ENTREPRISE").length} entreprise(s)
          </strong>
          <p>
            Les profils sont enregistrés par le serveur. Ils ne créent ni compte, ni accès, ni mot
            de passe.
          </p>
        </div>
      </div>
      <DataTable
        lignes={contribuables}
        colonnes={colonnes}
        obtenirId={(entree) => entree.id}
        recherche={table.recherche}
        rechercher={table.rechercher}
        placeholder="Nom, NIF, STAT ou e-mail…"
        actionsEntete={
          <label className="filtre-compact-sre">
            Type
            <Select
              value={typeFiltre}
              onChange={(event) => {
                definirTypeFiltre(event.target.value);
                table.reinitialiserPage();
              }}
            >
              <OptionsSelect options={OPTIONS_TYPE_CONTRIBUABLE} />
            </Select>
          </label>
        }
        espaceVide="Aucun contribuable"
        messageVide="Aucun profil ne correspond à votre recherche."
        page={table.page}
        parPage={table.parPage}
        changerPage={table.changerPage}
        changerParPage={table.changerParPage}
      />
      <Modal
        ouvert={modal}
        titre="Ajouter un profil contribuable"
        description={`Dossier rattaché à ${SRE_REGION}. Aucun compte ou mot de passe ne sera créé.`}
        fermer={fermer}
        fermetureBloquee={formulaire.isSubmitting}
        largeur="large"
        pied={
          <>
            <Button variante="contour" onClick={fermer} disabled={formulaire.isSubmitting}>
              Annuler
            </Button>
            <SubmitButton
              form="formulaire-contribuable-admin"
              enCours={formulaire.isSubmitting}
              libelleEnCours="Enregistrement…"
            >
              Enregistrer le profil
            </SubmitButton>
          </>
        }
      >
        <form id="formulaire-contribuable-admin" onSubmit={creer} noValidate>
          <TaxpayerFormFields formulaire={formulaire} erreur={formulaire.erreur} />
        </form>
      </Modal>
      <ConfirmDialog
        ouvert={!!suppression.cible}
        titre="Supprimer ce profil ?"
        description={`Le profil « ${suppression.cible?.raisonSociale || `${suppression.cible?.prenom ?? ""} ${suppression.cible?.nom ?? ""}`.trim()} » sera supprimé définitivement si aucun compte, paiement ou historique fiscal ne lui est lié. Cette action est irréversible.`}
        fermer={suppression.fermer}
        confirmer={() => void suppression.executer(supprimer)}
        libelleConfirmer="Supprimer le profil"
        danger
        chargement={suppression.enCours}
        erreur={suppression.erreur}
      />
    </div>
  );
}

export function AdminBusinessesPage() {
  return <AdminTaxpayersPage typeInitial="ENTREPRISE" />;
}
