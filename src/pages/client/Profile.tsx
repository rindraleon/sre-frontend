import { useEffect } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi, mapApiTaxpayer, type ApiTaxpayer } from "@/services/api-client";
import { StatusBadge, PageHeader, EmptyState } from "@/components/ui";
import { formatDate } from "@/utils/format";
import { MSG_ENREGISTREMENT_ECHEC, MSG_SESSION_MANQUANTE, ROUTES_CLIENT } from "@/constants";
import { useApiForm } from "@/hooks";
import { SubmitButton } from "@/components/forms/form-field";
import { ClientProfileFormFields, COORDONNEES_VIDES } from "@/components/forms/client/profile-form";
import { clientProfileSchema, type ClientProfileFormValues } from "@/validation/profile.schema";

export function ClientProfilePage() {
  const { session } = useAuth();
  const { etat, mettreAJourEtat, notifier } = useSre();
  const contribuable = etat.contribuables.find((entree) => entree.id === session?.contribuableId);
  const formulaire = useApiForm<ClientProfileFormValues>({
    schema: clientProfileSchema,
    valeursInitiales: COORDONNEES_VIDES,
    messageRepli: MSG_ENREGISTREMENT_ECHEC,
  });

  useEffect(() => {
    if (!contribuable) return;
    formulaire.reinitialiserFormulaire({
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
        <PageHeader titre="Profil fiscal" filAriane={["Accueil", "Profil fiscal"]} />
        <EmptyState
          titre="Profil non disponible"
          description="Aucun profil contribuable n’est associé à votre session."
        />
      </div>
    );

  const enregistrer = formulaire.handleSubmit(async (valeurs) => {
    formulaire.reinitialiserErreur();
    if (!session?.jetonApi) {
      formulaire.definirErreur(MSG_SESSION_MANQUANTE);
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
      formulaire.traiterEchec(cause);
    }
  });

  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Profil fiscal"
        description="Consultez les données rattachées à votre compte."
        filAriane={["Accueil", "Profil fiscal"]}
        actions={
          <Link className="bouton-sre bouton-sre--contour" to={ROUTES_CLIENT.changementMotDePasse}>
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
            <ClientProfileFormFields
              formulaire={formulaire}
              erreur={formulaire.erreur}
              estEntreprise={contribuable.type === "ENTREPRISE"}
              courriel={session?.courriel ?? contribuable.courriel}
            />
            <SubmitButton enCours={formulaire.isSubmitting} libelleEnCours="Enregistrement…">
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
