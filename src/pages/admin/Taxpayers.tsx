import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CirclePlus } from "lucide-react";
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
import {
  Button,
  ConfirmDialog,
  PageHeader,
  Modal,
  DataTable,
  convertirColonnesTanstack,
} from "@/components/ui";
import { OptionsSelect } from "@/components/forms/options-select";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/forms/form-field";
import { TaxpayerFormFields, PROFIL_VIDE } from "@/components/forms/admin/taxpayer-form";
import { creerColonnesContribuables } from "@/components/tables/admin/taxpayers-columns";
import { useApiForm, useTableState, useConfirmation } from "@/hooks";
import { taxpayerFormSchema, type TaxpayerFormValues } from "@/validation/profile.schema";

const CHAMPS_ETAPES_PROFIL = [
  ["type", "nom", "prenom", "raisonSociale", "nomCommercial"],
  ["nif", "stat", "representantLegal"],
  ["courriel", "telephone", "adresse", "region", "ville"],
] as const;
type EtapeFormulaire = 0 | 1 | 2;

export function AdminTaxpayersPage({
  typeInitial = TOUS,
}: { typeInitial?: "TOUS" | "ENTREPRISE" } = {}) {
  const { etat, mettreAJourEtat, notifier } = useSre();
  const { session } = useAuth();
  const table = useTableState();
  const [typeFiltre, setTypeFiltre] = useState<string>(typeInitial);
  const [modal, setModal] = useState(false);
  const [etapeFormulaire, setEtapeFormulaire] = useState<EtapeFormulaire>(0);
  const suppression = useConfirmation<Taxpayer>();
  const formulaire = useApiForm<TaxpayerFormValues>({
    schema: taxpayerFormSchema,
    valeursInitiales: PROFIL_VIDE,
    messageRepli: "Le serveur n’a pas enregistré le profil.",
  });

  const contribuables = useMemo(
    () =>
      etat.contribuables.filter(
        (contribuable) => typeFiltre === TOUS || contribuable.type === typeFiltre,
      ),
    [etat.contribuables, typeFiltre],
  );

  const colonnes = creerColonnesContribuables({ onSupprimer: suppression.ouvrir });

  const fermer = () => {
    setModal(false);
    setEtapeFormulaire(0);
    formulaire.reinitialiserFormulaire();
  };

  const avancerEtape = async () => {
    const valide = await formulaire.trigger([...CHAMPS_ETAPES_PROFIL[etapeFormulaire]], {
      shouldFocus: true,
    });
    if (valide) {
      setEtapeFormulaire((courante) => {
        if (courante === 0 && formulaire.getValues("type") === "PARTICULIER") return 2;
        return Math.min(2, courante + 1) as 0 | 1 | 2;
      });
    }
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
  const nomProfilSuppression =
    suppression.cible?.raisonSociale ||
    [suppression.cible?.prenom, suppression.cible?.nom].filter(Boolean).join(" ");

  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre={entreprise ? "Entreprises" : "Contribuables"}
        description={`Profils du périmètre ${SRE_REGION}.`}
        filAriane={["Accueil", entreprise ? "Entreprises" : "Contribuables"]}
      />
      
      <DataTable
        data={contribuables}
        columns={convertirColonnesTanstack(colonnes)}
        label="Profils contribuables"
        getRowId={(entree) => entree.id}
        getSearchText={(contribuable) =>
          `${contribuable.nom} ${contribuable.prenom ?? ""} ${contribuable.raisonSociale ?? ""} ${contribuable.nif} ${contribuable.stat ?? ""} ${contribuable.courriel}`
        }
        searchPlaceholder="Nom, NIF, STAT ou e-mail…"
        searchValue={table.recherche}
        onSearchChange={table.rechercher}
        toolbarActions={
          <label className="filtre-compact-sre">
            Type
            <Select
              value={typeFiltre}
              onChange={(event) => {
                setTypeFiltre(event.target.value);
                table.reinitialiserPage();
              }}
            >
              <OptionsSelect options={OPTIONS_TYPE_CONTRIBUABLE} />
            </Select>
          </label>
        }
        actionPrimary={
          <Button
            onClick={() => {
              setEtapeFormulaire(0);
              setModal(true);
              formulaire.reinitialiserErreur();
            }}
          >
            <CirclePlus size={15} /> Ajouter un profil
          </Button>
        }
        columnToggle
        emptyTitle="Aucun contribuable"
        emptyDescription="Aucun profil ne correspond à votre recherche."
        page={table.page}
        rowsPerPage={table.parPage}
        onPageChange={table.changerPage}
        onRowsPerPageChange={table.changerParPage}
      />
      <Modal
        ouvert={modal}
        titre="Ajouter un profil contribuable"
        description={`Dossier rattaché à ${SRE_REGION}. Formulaire en trois étapes ; aucun compte ni mot de passe ne sera créé.`}
        fermer={fermer}
        fermetureBloquee={formulaire.isSubmitting}
        largeur="large"
        pied={
          <>
            <Button variante="contour" onClick={fermer} disabled={formulaire.isSubmitting}>
              Annuler
            </Button>
            {etapeFormulaire > 0 && (
              <Button
                variante="contour"
                onClick={() => {
                  if (etapeFormulaire === 2 && formulaire.getValues("type") === "PARTICULIER")
                    setEtapeFormulaire(0);
                  else setEtapeFormulaire((courante) => Math.max(0, courante - 1) as 0 | 1 | 2);
                }}
                disabled={formulaire.isSubmitting}
              >
                <ArrowLeft size={15} /> Précédent
              </Button>
            )}
            {etapeFormulaire < 2 ? (
              <Button onClick={() => void avancerEtape()} disabled={formulaire.isSubmitting}>
                Suivant <ArrowRight size={15} />
              </Button>
            ) : (
              <SubmitButton
                form="formulaire-contribuable-admin"
                enCours={formulaire.isSubmitting}
                libelleEnCours="Enregistrement…"
              >
                Enregistrer le profil
              </SubmitButton>
            )}
          </>
        }
      >
        <form
          id="formulaire-contribuable-admin"
          onSubmit={
            etapeFormulaire === 2
              ? creer
              : (event) => {
                  event.preventDefault();
                  void avancerEtape();
                }
          }
          noValidate
        >
          <TaxpayerFormFields
            formulaire={formulaire}
            erreur={formulaire.erreur}
            etape={etapeFormulaire}
          />
        </form>
      </Modal>
      <ConfirmDialog
        ouvert={!!suppression.cible}
        titre="Supprimer ce profil ?"
        description={`Le profil « ${nomProfilSuppression} » sera supprimé définitivement si aucun compte, paiement ou historique fiscal ne lui est lié. Cette action est irréversible.`}
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
