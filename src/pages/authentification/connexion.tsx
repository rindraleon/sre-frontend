import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail, Landmark } from "lucide-react";
import {
  utiliserAuthentificationSre,
  destinationRoleSre,
} from "@/contexte/contexte-authentification-sre";
import { utiliserSre } from "@/contexte/contexte-sre";
import { BoutonSre } from "@/composants/ui/composants-sre";
import { apiSreConfiguree } from "@/services/api-sre";

export function ConnexionPageSre() {
  const [courriel, definirCourriel] = useState("");
  const [motDePasse, definirMotDePasse] = useState("");
  const [erreur, definirErreur] = useState("");
  const [chargement, definirChargement] = useState(false);
  const [rechercheParams] = useSearchParams();
  const navigation = useNavigate();
  const { connecter } = utiliserAuthentificationSre();
  const { notifier, chargementInitial } = utiliserSre();
  const retour = rechercheParams.get("retour");
  const validerEmail = (valeur: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeur.trim());

  const soumettre = async (event: FormEvent) => {
    event.preventDefault();
    definirErreur("");
    if (!validerEmail(courriel)) {
      definirErreur("Saisissez une adresse e-mail valide.");
      return;
    }
    if (!motDePasse) {
      definirErreur("Saisissez votre mot de passe.");
      return;
    }
    definirChargement(true);
    try {
      const session = await connecter(courriel, motDePasse);
      if (!session) {
        definirErreur("Adresse e-mail ou mot de passe incorrect, ou compte inactif.");
        return;
      }
      notifier(
        `Connexion réussie à votre espace ${session.role === "ADMIN" ? "administratif" : "contribuable"}.`,
        "succes",
      );
      const cheminRacine = destinationRoleSre(session.role);
      const cheminRetour = retour?.split("?")[0] ?? "";
      const retourAutorise =
        retour && (cheminRetour === cheminRacine || cheminRetour.startsWith(`${cheminRacine}/`))
          ? retour
          : null;
      const destination = session.changementMotDePasseRequis
        ? `${cheminRacine}/changement-mot-de-passe`
        : (retourAutorise ?? cheminRacine);
      navigation(destination, { replace: true });
    } catch (cause) {
      definirErreur(
        cause instanceof Error ? cause.message : "Impossible de vérifier la connexion. Réessayez.",
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
            <small>ACCÈS AUX SERVICES FISCAUX</small>
          </div>
        </Link>
        <Link to="/accueil" className="lien-retour-sre">
          Retour au portail
        </Link>
      </header>
      <main className="auth-cadre-sre">
        <section className="auth-carte-sre">
          {/* <div className="auth-icone-sre">
            <LockKeyhole size={20} />
          </div>
          <span className="sur-titre-sre text-center">ESPACE SÉCURISÉ</span> */}
          <h1 className="text-center">Se connecter</h1>
          <p className="text-center">Accédez à votre espace contribuable ou au back-office avec votre compte serveur.</p>
          <form onSubmit={soumettre} className="formulaire-sre">
            <label htmlFor="connexion-courriel">Adresse e-mail</label>
            <div className="champ-sre champ-sre--icone">
              <Mail size={16} />
              <input
                id="connexion-courriel"
                type="email"
                autoComplete="username"
                required
                value={courriel}
                onChange={(event) => definirCourriel(event.target.value)}
                placeholder="nom@exemple.mg"
              />
            </div>
            <div className="champ-label-lien-sre">
              <label htmlFor="connexion-mot-de-passe">Mot de passe</label>
              {apiSreConfiguree ? (
                <span className="lien-reset-indisponible-sre">
                  Réinitialisation email à configurer
                </span>
              ) : (
                <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
              )}
            </div>
            <div className="champ-sre champ-sre--icone">
              <LockKeyhole size={16} />
              <input
                id="connexion-mot-de-passe"
                type="password"
                autoComplete="current-password"
                required
                value={motDePasse}
                onChange={(event) => definirMotDePasse(event.target.value)}
                placeholder="Votre mot de passe"
              />
            </div>
            {erreur && (
              <p className="message-erreur-sre" role="alert">
                {erreur}
              </p>
            )}
            <BoutonSre
              type="submit"
              disabled={chargement || chargementInitial || !apiSreConfiguree}
            >
              {chargement ? (
                "Vérification…"
              ) : chargementInitial ? (
                "Chargement des comptes…"
              ) : (
                <>
                  Se connecter <ArrowRight size={16} />
                </>
              )}
            </BoutonSre>
          </form>
          <p className="auth-lien-secondaire-sre">
            Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
          </p>
          {/* <div className="note-securite-sre">
            <ShieldCheck size={16} />
            <p>
              <strong>
                {apiSreConfiguree ? "Authentification serveur" : "Service indisponible"}
              </strong>
              <span>
                {apiSreConfiguree
                  ? "Le serveur vérifie le compte et les autorisations. Aucune donnée de démonstration locale n’est utilisée."
                  : "Configurez VITE_API_URL. La connexion locale est désactivée."}
              </span>
            </p>
          </div> */}
          <div className="auth-premier-admin-sre">
            <span>Première visite ?</span>
            <Link to="/inscription">
              Créer le premier compte administrateur ou un compte contribuable{" "}
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>
      </main>
      {/* <footer className="auth-pied-sre">Portail SRE · Service SRE · Haute Matsiatra</footer> */}
    </div>
  );
}
