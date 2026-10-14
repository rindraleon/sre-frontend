import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, CheckCircle2, Landmark, UserRound } from "lucide-react";
import type { ProfilInscriptionSre, TypeContribuable } from "@/types/sre";
import { utiliserAuthentificationSre } from "@/contexte/contexte-authentification-sre";
import { utiliserSre } from "@/contexte/contexte-sre";
import { BoutonSre } from "@/composants/ui/composants-sre";
import { apiSreConfiguree, obtenirEtatInscriptionApiSre } from "@/services/api-sre";
import { REGION_SRE } from "@/utilitaires/constantes-sre";

const profilInitial: ProfilInscriptionSre = {
  nom: "",
  prenom: "",
  type: "PARTICULIER",
  raisonSociale: "",
  nomCommercial: "",
  nif: "",
  stat: "",
  adresse: "",
  region: REGION_SRE,
  ville: "",
  courriel: "",
  telephone: "",
  representantLegal: "",
  nomContact: "",
  prenomContact: "",
  fonctionContact: "",
};

export function InscriptionPageSre() {
  const { etat, chargementInitial, notifier, mettreAJourEtat } = utiliserSre();
  const { inscrire } = utiliserAuthentificationSre();
  const navigation = useNavigate();
  const regions = [REGION_SRE];
  const [verificationApiTerminee, definirVerificationApiTerminee] = useState(!apiSreConfiguree);
  const [erreurVerificationApi, definirErreurVerificationApi] = useState<string | null>(null);
  const [tentativeVerificationApi, definirTentativeVerificationApi] = useState(0);
  useEffect(() => {
    if (!apiSreConfiguree) return;
    let actif = true;
    definirVerificationApiTerminee(false);
    definirErreurVerificationApi(null);
    obtenirEtatInscriptionApiSre()
      .then((resultat) => {
        if (actif)
          mettreAJourEtat((courant) => ({
            ...courant,
            administrateurInitialise: resultat.administrateurInitialise,
          }));
      })
      .catch((cause) => {
        if (actif)
          definirErreurVerificationApi(
            cause instanceof Error ? cause.message : "Impossible de vérifier l’état de l’API SRE.",
          );
      })
      .finally(() => {
        if (actif) definirVerificationApiTerminee(true);
      });
    return () => {
      actif = false;
    };
  }, [mettreAJourEtat, tentativeVerificationApi]);
  const premierAdministrateur =
    apiSreConfiguree &&
    !chargementInitial &&
    verificationApiTerminee &&
    !erreurVerificationApi &&
    !etat.administrateurInitialise &&
    !etat.utilisateurs.some((utilisateur) => utilisateur.role === "ADMIN");
  const [profil, definirProfil] = useState(profilInitial);
  const [motDePasse, definirMotDePasse] = useState("");
  const [confirmation, definirConfirmation] = useState("");
  const [erreur, definirErreur] = useState("");
  const [chargement, definirChargement] = useState(false);

  const modifierChamp = (champ: keyof ProfilInscriptionSre, valeur: string) =>
    definirProfil((courant) => ({ ...courant, [champ]: valeur }));
  const choisirType = (type: TypeContribuable) =>
    definirProfil((courant) => ({ ...courant, type }));

  const soumettre = async (event: FormEvent) => {
    event.preventDefault();
    definirErreur("");
    if ((premierAdministrateur || profil.type === "PARTICULIER") && !profil.nom.trim()) {
      definirErreur("Renseignez votre nom.");
      return;
    }
    if (!premierAdministrateur && profil.type === "ENTREPRISE" && !profil.raisonSociale?.trim()) {
      definirErreur("La raison sociale est requise pour une entreprise.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profil.courriel.trim())) {
      definirErreur("Saisissez une adresse e-mail valide.");
      return;
    }
    if (
      !premierAdministrateur &&
      (!profil.adresse.trim() || !profil.ville.trim() || !profil.region.trim())
    ) {
      definirErreur("Complétez l’adresse, la région et la ville/commune.");
      return;
    }
    if (
      motDePasse.length < 10 ||
      !/[A-Z]/.test(motDePasse) ||
      !/[a-z]/.test(motDePasse) ||
      !/[0-9]/.test(motDePasse)
    ) {
      definirErreur(
        "Le mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule et un chiffre.",
      );
      return;
    }
    if (motDePasse !== confirmation) {
      definirErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }
    definirChargement(true);
    try {
      const donneesProfil: ProfilInscriptionSre = premierAdministrateur
        ? {
            ...profil,
            type: "PARTICULIER",
            raisonSociale: undefined,
            nif: "",
            adresse: "",
            ville: "",
            region: "",
          }
        : profil;
      const resultat = await inscrire(donneesProfil, motDePasse);
      notifier(
        resultat.role === "ADMIN"
          ? "Premier compte administrateur créé."
          : "Compte contribuable créé sur le serveur.",
        "succes",
      );
      navigation(resultat.role === "ADMIN" ? "/admin" : "/client", { replace: true });
    } catch (cause) {
      definirErreur(
        cause instanceof Error ? cause.message : "Impossible de créer le compte. Réessayez.",
      );
    } finally {
      definirChargement(false);
    }
  };

  return (
    <div className="page-auth-sre">
      <header className="auth-entete-sre">
        <Link to="/accueil" className="marque-sre">
          <span>
            <Landmark size={20} />
          </span>
          <div>
            <strong>
              SRE<span>·</span>Portail
            </strong>
            <small>CRÉATION DE COMPTE</small>
          </div>
        </Link>
        <Link to="/connexion" className="lien-retour-sre">
          Déjà un compte ? Se connecter
        </Link>
      </header>
      <main className="auth-cadre-sre auth-cadre-sre--large">
        <section className="auth-carte-sre">
          {/* <div className="auth-icone-sre">
            {premierAdministrateur ? <Landmark size={21} /> : <UserRound size={21} />}
          </div> */}
          <span className="sur-titre-sre text-center">
            {premierAdministrateur ? "INITIALISATION DE L’ADMINISTRATION" : "ESPACE CONTRIBUABLE"}
          </span>
          <h1 className="text-center">{premierAdministrateur ? "Créer le premier compte" : "Créer mon compte"}</h1>
          <p className="text-center">
            {premierAdministrateur
              ? "Conformément à la règle de première initialisation, ce compte deviendra l’administrateur. Les inscriptions suivantes seront des comptes contribuables."
              : "Créez votre accès pour consulter votre espace contribuable."}
          </p>
          {!apiSreConfiguree ? (
            <div className="note-fiscale-sre" role="alert">
              <span>!</span>
              <p>
                Le service backend n’est pas configuré. Définissez VITE_API_URL puis redémarrez
                l’interface. Aucun compte local ou jeu de données de démonstration ne sera créé.
              </p>
            </div>
          ) : chargementInitial || !verificationApiTerminee ? (
            <div className="chargement-sre">Vérification de l’initialisation du backend…</div>
          ) : erreurVerificationApi ? (
            <div className="note-fiscale-sre" role="alert">
              <span>!</span>
              <div>
                <p>{erreurVerificationApi}</p>
                <BoutonSre
                  type="button"
                  variante="contour"
                  onClick={() => {
                    definirErreurVerificationApi(null);
                    definirVerificationApiTerminee(false);
                    definirTentativeVerificationApi((tentative) => tentative + 1);
                  }}
                >
                  Réessayer la vérification
                </BoutonSre>
              </div>
            </div>
          ) : (
            <form
              className="formulaire-sre grille-formulaire-sre formulaire-compact-sre"
              onSubmit={soumettre}
            >
              {!premierAdministrateur && (
                <fieldset className="choix-type-contribuable-sre">
                  <legend>Type de contribuable</legend>
                  <button
                    type="button"
                    className={
                      profil.type === "PARTICULIER"
                        ? "type-contribuable-sre type-contribuable-sre--actif"
                        : "type-contribuable-sre"
                    }
                    onClick={() => choisirType("PARTICULIER")}
                  >
                    <UserRound size={17} />
                    <span>
                      <strong>Particulier</strong>
                      <small>Profil personnel</small>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={
                      profil.type === "ENTREPRISE"
                        ? "type-contribuable-sre type-contribuable-sre--actif"
                        : "type-contribuable-sre"
                    }
                    onClick={() => choisirType("ENTREPRISE")}
                  >
                    <Building2 size={17} />
                    <span>
                      <strong>Entreprise</strong>
                      <small>Profil professionnel</small>
                    </span>
                  </button>
                </fieldset>
              )}
              {!premierAdministrateur && profil.type === "ENTREPRISE" ? (
                <>
                  <label>
                    Raison sociale
                    <input
                      className="champ-simple-sre"
                      value={profil.raisonSociale}
                      onChange={(event) => modifierChamp("raisonSociale", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Nom commercial <small>Facultatif</small>
                    <input
                      className="champ-simple-sre"
                      value={profil.nomCommercial}
                      onChange={(event) => modifierChamp("nomCommercial", event.target.value)}
                    />
                  </label>
                  <label>
                    NIF <small>Facultatif selon votre situation</small>
                    <input
                      className="champ-simple-sre"
                      value={profil.nif}
                      onChange={(event) => modifierChamp("nif", event.target.value)}
                    />
                  </label>
                  <label>
                    STAT <small>Facultatif</small>
                    <input
                      className="champ-simple-sre"
                      value={profil.stat}
                      onChange={(event) => modifierChamp("stat", event.target.value)}
                    />
                  </label>
                  <label>
                    Représentant légal
                    <input
                      className="champ-simple-sre"
                      value={profil.representantLegal}
                      onChange={(event) => modifierChamp("representantLegal", event.target.value)}
                    />
                  </label>
                  <label>
                    Nom du contact
                    <input
                      className="champ-simple-sre"
                      value={profil.nomContact}
                      onChange={(event) => modifierChamp("nomContact", event.target.value)}
                    />
                  </label>
                  <label>
                    Prénom du contact
                    <input
                      className="champ-simple-sre"
                      value={profil.prenomContact}
                      onChange={(event) => modifierChamp("prenomContact", event.target.value)}
                    />
                  </label>
                  <label>
                    Fonction du contact
                    <input
                      className="champ-simple-sre"
                      value={profil.fonctionContact}
                      onChange={(event) => modifierChamp("fonctionContact", event.target.value)}
                    />
                  </label>
                </>
              ) : !premierAdministrateur ? (
                <>
                  <label>
                    Nom
                    <input
                      className="champ-simple-sre"
                      value={profil.nom}
                      onChange={(event) => modifierChamp("nom", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Prénom
                    <input
                      className="champ-simple-sre"
                      value={profil.prenom}
                      onChange={(event) => modifierChamp("prenom", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    NIF <small>Facultatif selon votre situation</small>
                    <input
                      className="champ-simple-sre"
                      value={profil.nif}
                      onChange={(event) => modifierChamp("nif", event.target.value)}
                    />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Nom
                    <input
                      className="champ-simple-sre"
                      value={profil.nom}
                      onChange={(event) => modifierChamp("nom", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Prénom
                    <input
                      className="champ-simple-sre"
                      value={profil.prenom}
                      onChange={(event) => modifierChamp("prenom", event.target.value)}
                      required
                    />
                  </label>
                </>
              )}
              {!premierAdministrateur && (
                <>
                  <label className="champ-sre-large">
                    Adresse
                    <input
                      className="champ-simple-sre"
                      value={profil.adresse}
                      onChange={(event) => modifierChamp("adresse", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Région
                    <select
                      className="champ-simple-sre"
                      value={profil.region}
                      onChange={(event) => modifierChamp("region", event.target.value)}
                      required
                    >
                      {regions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Ville / Commune
                    <input
                      className="champ-simple-sre"
                      value={profil.ville}
                      onChange={(event) => modifierChamp("ville", event.target.value)}
                      required
                    />
                  </label>
                </>
              )}
              <label className="champ-sre-large">
                Adresse e-mail
                <input
                  className="champ-simple-sre"
                  type="email"
                  autoComplete="email"
                  value={profil.courriel}
                  onChange={(event) => modifierChamp("courriel", event.target.value)}
                  required
                />
              </label>
              {!premierAdministrateur && (
                <label>
                  Téléphone
                  <input
                    className="champ-simple-sre"
                    type="tel"
                    value={profil.telephone}
                    onChange={(event) => modifierChamp("telephone", event.target.value)}
                    required
                    placeholder="+261 …"
                  />
                </label>
              )}
              <label>
                Mot de passe
                <input
                  className="champ-simple-sre"
                  type="password"
                  autoComplete="new-password"
                  value={motDePasse}
                  onChange={(event) => definirMotDePasse(event.target.value)}
                  required
                />
                <small>10 caractères minimum, majuscule, minuscule et chiffre.</small>
              </label>
              <label>
                Confirmer le mot de passe
                <input
                  className="champ-simple-sre"
                  type="password"
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(event) => definirConfirmation(event.target.value)}
                  required
                />
              </label>
              {erreur && (
                <p className="message-erreur-sre champ-sre-large" role="alert">
                  {erreur}
                </p>
              )}
              <div className="champ-sre-large">
                <div className="note-securite-sre">
                  <CheckCircle2 size={16} />
                  <p>
                    <strong>Compte sécurisé par le serveur</strong>
                    <span>
                      Le mot de passe est haché côté serveur; votre profil est enregistré dans la
                      base du portail SRE.
                    </span>
                  </p>
                </div>
              </div>
              <div className="actions-formulaire-sre champ-sre-large">
                <BoutonSre type="submit" disabled={chargement}>
                  {chargement ? (
                    "Création du compte…"
                  ) : (
                    <>
                      {premierAdministrateur
                        ? "Initialiser l’administration"
                        : "Créer mon compte contribuable"}{" "}
                      <ArrowRight size={16} />
                    </>
                  )}
                </BoutonSre>
              </div>
            </form>
          )}
          <p className="auth-lien-secondaire-sre">
            Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
          </p>
        </section>
      </main>
      {/* <footer className="auth-pied-sre">
        {premierAdministrateur
          ? "Aucun administrateur n’est encore initialisé dans la base."
          : "Région desservie : Haute Matsiatra."}
      </footer> */}
    </div>
  );
}
