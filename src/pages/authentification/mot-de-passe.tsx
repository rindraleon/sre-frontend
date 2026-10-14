import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import { utiliserAuthentificationSre } from "@/contexte/contexte-authentification-sre";
import { utiliserSre } from "@/contexte/contexte-sre";
import { BoutonSre } from "@/composants/ui/composants-sre";

function EnTeteAuthSre() {
  return (
    <header className="auth-entete-sre">
      <Link to="/accueil" className="marque-sre">
        <span>
          <KeyRound size={19} />
        </span>
        <div>
          <strong>
            SRE<span>·</span>Portail
          </strong>
          <small>SERVICE RÉGIONAL DES IMPÔTS</small>
        </div>
      </Link>
      <Link className="lien-retour-sre" to="/connexion">
        Connexion
      </Link>
    </header>
  );
}

export function MotDePasseOubliePageSre() {
  return (
    <div className="page-auth-sre">
      <EnTeteAuthSre />
      <main className="auth-cadre-sre">
        <section className="auth-carte-sre">
          <div className="auth-icone-sre">
            <KeyRound size={20} />
          </div>
          <span className="sur-titre-sre">RÉCUPÉRATION DU COMPTE</span>
          <h1>Réinitialisation indisponible</h1>
          <p>La récupération de mot de passe par e-mail n’est pas raccordée au backend.</p>
          <div className="note-securite-sre">
            <KeyRound size={16} />
            <p>
              <strong>Aucun lien ne sera généré ou envoyé</strong>
              <span>
                Les demandes et messages de récupération simulés ont été retirés. Utilisez une
                procédure d’assistance vérifiée par le service.
              </span>
            </p>
          </div>
          <Link className="lien-retour-auth-sre" to="/connexion">
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </section>
      </main>
      <footer className="auth-pied-sre">
        La récupération sera disponible lorsqu’un service serveur sécurisé sera configuré.
      </footer>
    </div>
  );
}

export function ReinitialisationMotDePassePageSre() {
  return (
    <div className="page-auth-sre">
      <EnTeteAuthSre />
      <main className="auth-cadre-sre">
        <section className="auth-carte-sre">
          <div className="auth-icone-sre">
            <KeyRound size={20} />
          </div>
          <span className="sur-titre-sre">SÉCURITÉ DU COMPTE</span>
          <h1>Lien de réinitialisation non pris en charge</h1>
          <p>
            Cette page n’accepte pas de jeton local. Aucun mot de passe ne peut être modifié sans
            validation du backend.
          </p>
          <Link className="lien-retour-auth-sre" to="/connexion">
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </section>
      </main>
    </div>
  );
}

export function ChangementMotDePassePageSre() {
  const [ancienMotDePasse, definirAncienMotDePasse] = useState("");
  const [nouveauMotDePasse, definirNouveauMotDePasse] = useState("");
  const [confirmation, definirConfirmation] = useState("");
  const [erreur, definirErreur] = useState("");
  const [termine, definirTermine] = useState(false);
  const [chargement, definirChargement] = useState(false);
  const { changerMotDePasse, session } = utiliserAuthentificationSre();
  const { notifier } = utiliserSre();
  const navigation = useNavigate();

  const soumettre = async (event: FormEvent) => {
    event.preventDefault();
    definirErreur("");
    if (
      nouveauMotDePasse.length < 10 ||
      !/[A-Z]/.test(nouveauMotDePasse) ||
      !/[a-z]/.test(nouveauMotDePasse) ||
      !/[0-9]/.test(nouveauMotDePasse)
    ) {
      definirErreur("Utilisez au moins 10 caractères, une majuscule, une minuscule et un chiffre.");
      return;
    }
    if (nouveauMotDePasse !== confirmation) {
      definirErreur("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }
    definirChargement(true);
    try {
      const reussi = await changerMotDePasse(ancienMotDePasse, nouveauMotDePasse);
      if (!reussi) {
        definirErreur("Le mot de passe actuel est incorrect.");
        return;
      }
      definirTermine(true);
      notifier("Votre mot de passe a été modifié.", "succes");
    } catch (cause) {
      definirErreur(
        cause instanceof Error ? cause.message : "Impossible de mettre à jour le mot de passe.",
      );
    } finally {
      definirChargement(false);
    }
  };

  return (
    <div className="page-contenu-sre">
      <section className="carte-sre changement-mdp-sre">
        <span className="auth-icone-sre">
          <KeyRound size={20} />
        </span>
        <span className="sur-titre-sre">SÉCURITÉ DU COMPTE</span>
        <h1>
          {session?.changementMotDePasseRequis
            ? "Première connexion : changez le mot de passe"
            : "Changer mon mot de passe"}
        </h1>
        <p>
          {session?.changementMotDePasseRequis
            ? "Votre compte exige un changement de mot de passe. Choisissez un nouveau mot de passe avant de continuer."
            : "Le nouveau mot de passe sera vérifié et enregistré par le serveur."}
        </p>
        {!termine ? (
          <form className="formulaire-sre" onSubmit={soumettre}>
            <label>
              Mot de passe temporaire ou actuel
              <input
                className="champ-simple-sre"
                type="password"
                value={ancienMotDePasse}
                onChange={(event) => definirAncienMotDePasse(event.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            <label>
              Nouveau mot de passe
              <input
                className="champ-simple-sre"
                type="password"
                value={nouveauMotDePasse}
                onChange={(event) => definirNouveauMotDePasse(event.target.value)}
                required
                autoComplete="new-password"
              />
              <small>10 caractères minimum, majuscule, minuscule et chiffre.</small>
            </label>
            <label>
              Confirmer le nouveau mot de passe
              <input
                className="champ-simple-sre"
                type="password"
                value={confirmation}
                onChange={(event) => definirConfirmation(event.target.value)}
                required
                autoComplete="new-password"
              />
            </label>
            {erreur && (
              <p className="message-erreur-sre" role="alert">
                {erreur}
              </p>
            )}
            <BoutonSre type="submit" disabled={chargement}>
              {chargement ? (
                "Mise à jour…"
              ) : (
                <>
                  Mettre à jour <ArrowRight size={15} />
                </>
              )}
            </BoutonSre>
          </form>
        ) : (
          <BoutonSre onClick={() => navigation(session?.role === "ADMIN" ? "/admin" : "/client")}>
            Continuer vers mon espace <ArrowRight size={15} />
          </BoutonSre>
        )}
      </section>
    </div>
  );
}
