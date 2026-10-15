import { Select } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, CirclePlus, Trash2, UserRound } from "lucide-react";
import type { Taxpayer } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi, mapApiTaxpayer, type ApiTaxpayer } from "@/services/api-client";
import { SRE_REGION } from "@/utils/constants";
import {
  StatusBadge,
  Button,
  ConfirmDialog,
  PageHeader,
  Modal,
  DataTable,
  type TableColumn,
} from "@/components/ui";
import { formatDate } from "@/utils/format";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taxpayerFormSchema, type TaxpayerFormValues } from "@/validation/profile.schema";
import { applyApiErrors, apiErrorMessage } from "@/validation/apiErrors";
import { FormField, SubmitButton, FormError } from "@/components/forms/form-field";

const profilVide: TaxpayerFormValues = {
  nom: "",
  prenom: "",
  type: "PARTICULIER",
  raisonSociale: "",
  nomCommercial: "",
  nif: "",
  stat: "",
  adresse: "",
  region: SRE_REGION,
  ville: "",
  courriel: "",
  telephone: "",
  representantLegal: "",
  nomContact: "",
  prenomContact: "",
  fonctionContact: "",
};

export function AdminTaxpayersPage({
  typeInitial = "TOUS",
}: { typeInitial?: "TOUS" | "ENTREPRISE" } = {}) {
  const { etat, mettreAJourEtat, notifier } = useSre();
  const { session } = useAuth();
  const [recherche, definirRecherche] = useState("");
  const [typeFiltre, definirTypeFiltre] = useState<string>(typeInitial);
  const [page, definirPage] = useState(1);
  const [parPage, definirParPage] = useState(10);
  const [modal, definirModal] = useState(false);
  const formulaire = useForm<TaxpayerFormValues>({
    resolver: zodResolver(taxpayerFormSchema),
    mode: "onTouched",
    defaultValues: profilVide,
  });
  const {
    register,
    handleSubmit,
    reset: reinitialiserFormulaire,
    watch,
    formState: { errors, isSubmitting },
  } = formulaire;
  const typeProfil = watch("type");
  const [erreur, definirErreur] = useState("");
  const [cibleSuppression, definirCibleSuppression] = useState<Taxpayer | null>(null);
  const [suppressionEnCours, definirSuppressionEnCours] = useState(false);

  const contribuables = useMemo(
    () =>
      etat.contribuables.filter(
        (contribuable) =>
          (typeFiltre === "TOUS" || contribuable.type === typeFiltre) &&
          `${contribuable.nom} ${contribuable.prenom ?? ""} ${contribuable.raisonSociale ?? ""} ${contribuable.nif} ${contribuable.stat ?? ""} ${contribuable.courriel}`
            .toLowerCase()
            .includes(recherche.toLowerCase()),
      ),
    [etat.contribuables, recherche, typeFiltre],
  );

  const colonnes: TableColumn<Taxpayer>[] = [
    {
      id: "nom",
      titre: "Contribuable",
      afficher: (entree) => (
        <Link className="lien-identite-tableau-sre" to={`/admin/contribuables/${entree.id}`}>
          <span className="avatar-ligne-sre">
            {entree.type === "ENTREPRISE" ? <Building2 size={15} /> : <UserRound size={15} />}
          </span>
          <span>
            <strong>{entree.raisonSociale || `${entree.prenom ?? ""} ${entree.nom}`.trim()}</strong>
            <small>{entree.courriel}</small>
          </span>
        </Link>
      ),
      valeurTri: (entree) => entree.raisonSociale || `${entree.prenom ?? ""} ${entree.nom}`,
    },
    {
      id: "type",
      titre: "Type",
      afficher: (entree) => <StatusBadge statut={entree.type} />,
      valeurTri: (entree) => entree.type,
    },
    {
      id: "nif",
      titre: "NIF",
      afficher: (entree) => entree.nif || "—",
      valeurTri: (entree) => entree.nif,
    },
    {
      id: "stat",
      titre: "STAT",
      afficher: (entree) => entree.stat || "—",
      valeurTri: (entree) => entree.stat ?? "",
    },
    {
      id: "region",
      titre: "Localisation",
      afficher: (entree) => (
        <>
          {entree.ville}
          <small className="sous-ligne-sre">{entree.region}</small>
        </>
      ),
      valeurTri: (entree) => entree.region,
    },
    {
      id: "statut",
      titre: "Compte",
      afficher: (entree) => <StatusBadge statut={entree.statut ?? "SANS_COMPTE"} />,
      valeurTri: (entree) => entree.statut ?? "SANS_COMPTE",
    },
    {
      id: "cree",
      titre: "Créé le",
      afficher: (entree) => formatDate(entree.dateCreationCompte),
      valeurTri: (entree) => entree.dateCreationCompte,
    },
    {
      id: "action",
      titre: "Actions",
      afficher: (entree) => (
        <div className="actions-tableau-sre">
          <Link className="lien-action-sre" to={`/admin/contribuables/${entree.id}`}>
            Voir <ArrowRight size={13} />
          </Link>
          <Button
            taille="petit"
            variante="fantome"
            aria-label={`Supprimer le profil ${entree.raisonSociale || entree.nom}`}
            onClick={() => definirCibleSuppression(entree)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  const fermer = () => {
    definirModal(false);
    reinitialiserFormulaire(profilVide);
    definirErreur("");
  };

  const creer = handleSubmit(async (valeurs) => {
    definirErreur("");
    if (!session?.jetonApi) {
      definirErreur("Session serveur introuvable. Reconnectez-vous puis réessayez.");
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
      const globales = applyApiErrors(formulaire, cause);
      definirErreur(
        globales.length
          ? globales.join(" ")
          : apiErrorMessage(cause, "Le serveur n’a pas enregistré le profil."),
      );
    }
  });

  const supprimer = async () => {
    if (!cibleSuppression || !session?.jetonApi) return;
    definirSuppressionEnCours(true);
    try {
      await callApi<{ message: string }>(
        `contribuables/${encodeURIComponent(cibleSuppression.id)}`,
        { method: "DELETE", token: session.jetonApi },
      );
      const id = cibleSuppression.id;
      mettreAJourEtat((courant) => ({
        ...courant,
        contribuables: courant.contribuables.filter((entree) => entree.id !== id),
      }));
      notifier("Profil contribuable supprimé.", "succes");
      definirCibleSuppression(null);
    } catch (cause) {
      notifier(
        cause instanceof Error ? cause.message : "Suppression refusée par le serveur.",
        "erreur",
      );
    } finally {
      definirSuppressionEnCours(false);
    }
  };

  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre={typeInitial === "ENTREPRISE" ? "Entreprises" : "Contribuables"}
        description={`Profils du périmètre ${SRE_REGION}. Un profil n’est pas un compte utilisateur.`}
        filAriane={["Back-office", typeInitial === "ENTREPRISE" ? "Entreprises" : "Contribuables"]}
        actions={
          <Button
            onClick={() => {
              definirModal(true);
              definirErreur("");
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
        recherche={recherche}
        rechercher={definirRecherche}
        placeholder="Nom, NIF, STAT ou e-mail…"
        actionsEntete={
          <label className="filtre-compact-sre">
            Type
            <Select
              value={typeFiltre}
              onChange={(event) => {
                definirTypeFiltre(event.target.value);
                definirPage(1);
              }}
            >
              <option value="TOUS">Tous</option>
              <option value="PARTICULIER">Particuliers</option>
              <option value="ENTREPRISE">Entreprises</option>
            </Select>
          </label>
        }
        espaceVide="Aucun contribuable"
        messageVide="Aucun profil ne correspond à votre recherche."
        page={page}
        parPage={parPage}
        changerPage={definirPage}
        changerParPage={definirParPage}
      />

      <Modal
        ouvert={modal}
        titre="Ajouter un profil contribuable"
        description={`Dossier rattaché à ${SRE_REGION}. Aucun compte ou mot de passe ne sera créé.`}
        fermer={fermer}
        fermetureBloquee={isSubmitting}
        largeur="large"
        pied={
          <>
            <Button variante="contour" onClick={fermer} disabled={isSubmitting}>
              Annuler
            </Button>
            <SubmitButton
              form="formulaire-contribuable-admin"
              enCours={isSubmitting}
              libelleEnCours="Enregistrement…"
            >
              Enregistrer le profil
            </SubmitButton>
          </>
        }
      >
        <form
          id="formulaire-contribuable-admin"
          onSubmit={creer}
          className="formulaire-sre grille-formulaire-sre formulaire-compact-sre"
          noValidate
        >
          <FormField libelle="Type" erreur={errors.type} requis>
            {(p) => (
              <Select {...p} className="champ-simple-sre" {...register("type")}>
                <option value="PARTICULIER">Particulier</option>
                <option value="ENTREPRISE">Entreprise</option>
              </Select>
            )}
          </FormField>
          {typeProfil === "ENTREPRISE" ? (
            <>
              <FormField libelle="Raison sociale" erreur={errors.raisonSociale} requis>
                {(p) => (
                  <input {...p} className="champ-simple-sre" {...register("raisonSociale")} />
                )}
              </FormField>
              <FormField libelle="Nom commercial" erreur={errors.nomCommercial} aide="Facultatif">
                {(p) => (
                  <input {...p} className="champ-simple-sre" {...register("nomCommercial")} />
                )}
              </FormField>
              <FormField libelle="NIF" erreur={errors.nif} aide="Facultatif">
                {(p) => <input {...p} className="champ-simple-sre" {...register("nif")} />}
              </FormField>
              <FormField libelle="STAT" erreur={errors.stat} aide="Facultatif">
                {(p) => <input {...p} className="champ-simple-sre" {...register("stat")} />}
              </FormField>
              <FormField
                libelle="Représentant légal"
                erreur={errors.representantLegal}
                aide="Facultatif"
                classeSupplementaire="champ-sre-large"
              >
                {(p) => (
                  <input {...p} className="champ-simple-sre" {...register("representantLegal")} />
                )}
              </FormField>
            </>
          ) : (
            <>
              <FormField libelle="Nom" erreur={errors.nom} requis>
                {(p) => (
                  <input
                    {...p}
                    className="champ-simple-sre"
                    autoComplete="family-name"
                    {...register("nom")}
                  />
                )}
              </FormField>
              <FormField libelle="Prénom" erreur={errors.prenom}>
                {(p) => (
                  <input
                    {...p}
                    className="champ-simple-sre"
                    autoComplete="given-name"
                    {...register("prenom")}
                  />
                )}
              </FormField>
              <FormField libelle="NIF" erreur={errors.nif} aide="Facultatif">
                {(p) => <input {...p} className="champ-simple-sre" {...register("nif")} />}
              </FormField>
            </>
          )}
          <FormField libelle="Adresse e-mail" erreur={errors.courriel} requis>
            {(p) => (
              <input
                {...p}
                className="champ-simple-sre"
                type="email"
                inputMode="email"
                autoComplete="email"
                {...register("courriel")}
              />
            )}
          </FormField>
          <FormField libelle="Téléphone" erreur={errors.telephone} requis>
            {(p) => (
              <input
                {...p}
                className="champ-simple-sre"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                {...register("telephone")}
              />
            )}
          </FormField>
          <FormField
            libelle="Adresse"
            erreur={errors.adresse}
            requis
            classeSupplementaire="champ-sre-large"
          >
            {(p) => (
              <input
                {...p}
                className="champ-simple-sre"
                autoComplete="street-address"
                {...register("adresse")}
              />
            )}
          </FormField>
          <FormField libelle="Région">
            {(p) => <input {...p} className="champ-simple-sre" value={SRE_REGION} readOnly />}
          </FormField>
          <FormField libelle="Ville / Commune" erreur={errors.ville} requis>
            {(p) => (
              <input
                {...p}
                className="champ-simple-sre"
                autoComplete="address-level2"
                {...register("ville")}
              />
            )}
          </FormField>
          <div className="champ-sre-large">
            <FormError message={erreur} />
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        ouvert={!!cibleSuppression}
        titre="Supprimer ce profil ?"
        description={`Le profil « ${cibleSuppression?.raisonSociale || `${cibleSuppression?.prenom ?? ""} ${cibleSuppression?.nom ?? ""}`.trim()} » sera supprimé définitivement si aucun compte, paiement ou historique fiscal ne lui est lié. Cette action est irréversible.`}
        fermer={() => definirCibleSuppression(null)}
        confirmer={supprimer}
        libelleConfirmer="Supprimer le profil"
        danger
        chargement={suppressionEnCours}
      />
    </div>
  );
}

export function AdminBusinessesPage() {
  return <AdminTaxpayersPage typeInitial="ENTREPRISE" />;
}
