import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { utiliserAuthentificationSre } from "@/contexte/contexte-authentification-sre";
import { utiliserSre } from "@/contexte/contexte-sre";
import { appelerApiSre, mapperContribuable, type ContribuableApiSre } from "@/services/api-sre";
import { REGION_SRE } from "@/utilitaires/constantes-sre";
import { BadgeSre, BoutonSre, EntetePageSre, EtatVideSre } from "@/composants/ui/composants-sre";
import { formaterDate } from "@/utilitaires/formatage";

export function ProfilContribuableSre() {
  const { session } = utiliserAuthentificationSre();
  const { etat, mettreAJourEtat, notifier } = utiliserSre();
  const contribuable = etat.contribuables.find((entree) => entree.id === session?.contribuableId);
  const [adresse, definirAdresse] = useState(contribuable?.adresse ?? "");
  const [ville, definirVille] = useState(contribuable?.ville ?? "");
  const [telephone, definirTelephone] = useState(contribuable?.telephone ?? "");
  const [nomCommercial, definirNomCommercial] = useState(contribuable?.nomCommercial ?? "");
  const [erreur, definirErreur] = useState("");
  const [chargement, definirChargement] = useState(false);

  useEffect(() => {
    if (!contribuable) return;
    definirAdresse(contribuable.adresse);
    definirVille(contribuable.ville);
    definirTelephone(contribuable.telephone);
    definirNomCommercial(contribuable.nomCommercial ?? "");
  }, [contribuable?.id]);

  if (!contribuable)
    return (
      <div className="page-contenu-sre">
        <EntetePageSre titre="Profil fiscal" filAriane={["Mon espace", "Profil fiscal"]} />
        <EtatVideSre
          titre="Profil non disponible"
          description="Aucun profil contribuable n’est associé à votre session."
        />
      </div>
    );

  const enregistrer = async (event: FormEvent) => {
    event.preventDefault();
    definirErreur("");
    if (!session?.jetonApi) {
      definirErreur("Session serveur introuvable. Reconnectez-vous.");
      return;
    }
    if (!adresse.trim() || !ville.trim()) {
      definirErreur("Renseignez l’adresse et la ville/commune.");
      return;
    }
    if (!/^\+?[0-9\s()-]{7,40}$/.test(telephone.trim())) {
      definirErreur("Le numéro de téléphone n’est pas valide.");
      return;
    }
    definirChargement(true);
    try {
      const reponse = await appelerApiSre<ContribuableApiSre>("contribuables/moi", {
        method: "PATCH",
        token: session.jetonApi,
        body: {
          adresse: adresse.trim(),
          ville: ville.trim(),
          telephone: telephone.trim(),
          ...(contribuable.type === "ENTREPRISE" ? { nomCommercial: nomCommercial.trim() } : {}),
        },
      });
      const profilMisAJour = mapperContribuable(reponse, session.utilisateurId);
      mettreAJourEtat((courant) => ({
        ...courant,
        contribuables: courant.contribuables.map((entree) =>
          entree.id === profilMisAJour.id ? profilMisAJour : entree,
        ),
      }));
      notifier("Coordonnées enregistrées sur le serveur.", "succes");
    } catch (cause) {
      definirErreur(
        cause instanceof Error ? cause.message : "Le serveur n’a pas enregistré les modifications.",
      );
    } finally {
      definirChargement(false);
    }
  };

  return (
    <div className="page-contenu-sre">
      <EntetePageSre
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
                <BadgeSre statut={contribuable.type} />
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
              <dd>{formaterDate(contribuable.dateCreationCompte)}</dd>
            </div>
            {contribuable.statut && (
              <div>
                <dt>Statut du compte</dt>
                <dd>
                  <BadgeSre statut={contribuable.statut} />
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
          <form className="formulaire-sre formulaire-compact-sre" onSubmit={enregistrer}>
            {contribuable.type === "ENTREPRISE" && (
              <label>
                Nom commercial <small>Facultatif</small>
                <input
                  className="champ-simple-sre"
                  value={nomCommercial}
                  onChange={(event) => definirNomCommercial(event.target.value)}
                />
              </label>
            )}
            <label>
              Adresse
              <input
                className="champ-simple-sre"
                value={adresse}
                onChange={(event) => definirAdresse(event.target.value)}
                required
              />
            </label>
            <label>
              Région
              <input className="champ-simple-sre" value={REGION_SRE} readOnly />
            </label>
            <label>
              Ville / Commune
              <input
                className="champ-simple-sre"
                value={ville}
                onChange={(event) => definirVille(event.target.value)}
                required
              />
            </label>
            <label>
              Téléphone
              <input
                className="champ-simple-sre"
                type="tel"
                value={telephone}
                onChange={(event) => definirTelephone(event.target.value)}
                required
              />
            </label>
            <label>
              Adresse e-mail de connexion
              <input
                className="champ-simple-sre"
                value={session?.courriel ?? contribuable.courriel}
                readOnly
              />
            </label>
            {erreur && (
              <p className="message-erreur-sre" role="alert">
                {erreur}
              </p>
            )}
            <BoutonSre type="submit" disabled={chargement}>
              <Save size={15} /> {chargement ? "Enregistrement…" : "Enregistrer les coordonnées"}
            </BoutonSre>
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

export function NotificationsContribuableSre() {
  return (
    <div className="page-contenu-sre">
      <EntetePageSre
        titre="Notifications"
        description="Les alertes apparaîtront ici lorsqu’un service de notification sera relié."
        filAriane={["Mon espace", "Notifications"]}
      />
      <EtatVideSre
        titre="Aucune notification disponible"
        description="Le backend ne fournit pas encore de route de notifications. Aucun message n’est fabriqué ou enregistré localement."
      />
    </div>
  );
}

export function ParametresContribuableSre() {
  const { session } = utiliserAuthentificationSre();
  return (
    <div className="page-contenu-sre">
      <EntetePageSre
        titre="Paramètres du compte"
        description="Options de sécurité et informations de session."
        filAriane={["Mon espace", "Paramètres"]}
      />
      <div className="grille-parametres-sre">
        <section className="carte-sre parametre-ligne-sre">
          <span>
            <KeyRound size={18} />
          </span>
          <div>
            <h2>Mot de passe</h2>
            <p>
              Modifier le mot de passe
              {session?.changementMotDePasseRequis ? " · action requise" : ""}.
            </p>
          </div>
          <Link
            className="bouton-sre bouton-sre--contour bouton-sre--petit"
            to="/client/changement-mot-de-passe"
          >
            Modifier <ArrowRight size={14} />
          </Link>
        </section>
        <section className="carte-sre parametre-ligne-sre">
          <span>
            <ShieldCheck size={18} />
          </span>
          <div>
            <h2>Confidentialité</h2>
            <p>Votre espace est limité aux données renvoyées pour votre compte par l’API.</p>
          </div>
        </section>
      </div>
      <div className="note-fiscale-sre">
        <span>i</span>
        <p>
          Les notifications et l’envoi d’e-mails ne sont pas activés tant qu’un service backend ne
          les prend pas en charge.
        </p>
      </div>
    </div>
  );
}
