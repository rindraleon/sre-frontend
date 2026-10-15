import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi, mapApiTaxpayer, type ApiTaxpayer } from "@/services/api-client";
import { SRE_REGION } from "@/utils/constants";
import { StatusBadge, PageHeader, EmptyState } from "@/components/ui";
import { formatDate } from "@/utils/format";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientProfileSchema, type ClientProfileFormValues } from "@/validation/profile.schema";
import { applyApiErrors, apiErrorMessage } from "@/validation/apiErrors";
import { FormField, SubmitButton, FormError } from "@/components/forms/form-field";

export function ClientProfilePage() {
  const { session } = useAuth();
  const { etat, mettreAJourEtat, notifier } = useSre();
  const contribuable = etat.contribuables.find((entree) => entree.id === session?.contribuableId);
  const [erreur, definirErreur] = useState("");
  const formulaire = useForm<ClientProfileFormValues>({
    resolver: zodResolver(clientProfileSchema),
    mode: "onTouched",
    defaultValues: { nomCommercial: "", adresse: "", ville: "", telephone: "" },
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = formulaire;

  useEffect(() => {
    if (!contribuable) return;
    reset({
      adresse: contribuable.adresse,
      ville: contribuable.ville,
      telephone: contribuable.telephone,
      nomCommercial: contribuable.nomCommercial ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contribuable?.id]);

  if (!contribuable)
    return (
      <div className="page-contenu-sre">
        <PageHeader titre="Profil fiscal" filAriane={["Mon espace", "Profil fiscal"]} />
        <EmptyState
          titre="Profil non disponible"
          description="Aucun profil contribuable n’est associé à votre session."
        />
      </div>
    );

  const enregistrer = handleSubmit(async (valeurs) => {
    definirErreur("");
    if (!session?.jetonApi) {
      definirErreur("Session serveur introuvable. Reconnectez-vous.");
      return;
    }
    try {
      const reponse = await callApi<ApiTaxpayer>("contribuables/moi", {
        method: "PATCH",
        token: session.jetonApi,
        body: {
          adresse: valeurs.adresse.trim(),
          ville: valeurs.ville.trim(),
          telephone: valeurs.telephone.trim(),
          ...(contribuable.type === "ENTREPRISE"
            ? { nomCommercial: valeurs.nomCommercial.trim() }
            : {}),
        },
      });
      const profilMisAJour = mapApiTaxpayer(reponse, session.utilisateurId);
      mettreAJourEtat((courant) => ({
        ...courant,
        contribuables: courant.contribuables.map((entree) =>
          entree.id === profilMisAJour.id ? profilMisAJour : entree,
        ),
      }));
      notifier("Coordonnées enregistrées sur le serveur.", "succes");
    } catch (cause) {
      const globales = applyApiErrors(formulaire, cause);
      definirErreur(
        globales.length
          ? globales.join(" ")
          : apiErrorMessage(cause, "Le serveur n’a pas enregistré les modifications."),
      );
    }
  });

  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Profil fiscal"
        description="Consultez les données rattachées à votre compte."
        filAriane={["Mon espace", "Profil fiscal"]}
        actions={
          <Link className="bouton-sre bouton-sre--contour" to="/client/changement-mot-de-passe">
            <KeyRound size={15} /> Modifier le mot de passe
          </Link>
        }
      />
      <div className="grille-profil-sre">
        <section className="carte-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Identité fiscale</h2>
              <p>Données enregistrées par le service.</p>
            </div>
            <UserRound size={18} />
          </div>
          <dl className="liste-details-sre">
            <div>
              <dt>Type de contribuable</dt>
              <dd>
                <StatusBadge statut={contribuable.type} />
              </dd>
            </div>
            <div>
              <dt>{contribuable.type === "ENTREPRISE" ? "Raison sociale" : "Nom complet"}</dt>
              <dd>
                {contribuable.type === "ENTREPRISE"
                  ? contribuable.raisonSociale
                  : `${contribuable.prenom ?? ""} ${contribuable.nom}`}
              </dd>
            </div>
            {contribuable.nomCommercial && (
              <div>
                <dt>Nom commercial</dt>
                <dd>{contribuable.nomCommercial}</dd>
              </div>
            )}
            <div>
              <dt>NIF</dt>
              <dd>{contribuable.nif || "Non renseigné"}</dd>
            </div>
            {contribuable.stat && (
              <div>
                <dt>STAT</dt>
                <dd>{contribuable.stat}</dd>
              </div>
            )}
            {contribuable.representantLegal && (
              <div>
                <dt>Représentant légal</dt>
                <dd>{contribuable.representantLegal}</dd>
              </div>
            )}
            <div>
              <dt>Compte créé le</dt>
              <dd>{formatDate(contribuable.dateCreationCompte)}</dd>
            </div>
            {contribuable.statut && (
              <div>
                <dt>Statut du compte</dt>
                <dd>
                  <StatusBadge statut={contribuable.statut} />
                </dd>
              </div>
            )}
          </dl>
          <div className="note-fiscale-sre">
            <span>i</span>
            <p>
              Le NIF, le STAT et les informations de connexion ne sont pas modifiables depuis cette
              page.
            </p>
          </div>
        </section>
        <section className="carte-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Coordonnées</h2>
              <p>Modifications transmises au serveur.</p>
            </div>
          </div>
          <form className="formulaire-sre formulaire-compact-sre" onSubmit={enregistrer} noValidate>
            {contribuable.type === "ENTREPRISE" && (
              <FormField libelle="Nom commercial" erreur={errors.nomCommercial} aide="Facultatif">
                {(p) => (
                  <input {...p} className="champ-simple-sre" {...register("nomCommercial")} />
                )}
              </FormField>
            )}
            <FormField libelle="Adresse" erreur={errors.adresse} requis>
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
            <FormField libelle="Adresse e-mail de connexion">
              {(p) => (
                <input
                  {...p}
                  className="champ-simple-sre"
                  value={session?.courriel ?? contribuable.courriel}
                  readOnly
                />
              )}
            </FormField>
            <FormError message={erreur} />
            <SubmitButton enCours={isSubmitting} libelleEnCours="Enregistrement…">
              <Save size={15} /> Enregistrer les coordonnées
            </SubmitButton>
          </form>
        </section>
      </div>
      <section className="note-securite-sre profil-note-sre">
        <ShieldCheck size={16} />
        <p>
          <strong>Protection des données</strong>
          <span>
            Le serveur limite l’accès à votre propre profil. Les contrôles de l’interface ne
            remplacent pas ceux du backend.
          </span>
        </p>
      </section>
    </div>
  );
}
