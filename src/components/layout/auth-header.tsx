import { Link } from "react-router-dom";
import { Landmark } from "lucide-react";

/**
 * En-tête partagé des pages publiques d'authentification
 * (connexion, inscription, mot de passe) — auparavant dupliqué dans 3 pages.
 * La page d'accueil conserve son en-tête propre (navigation par ancres).
 */
export function AuthHeader({
  surTitre = "SERVICE RÉGIONAL DES IMPÔTS",
  libelleLien = "Connexion",
  cheminLien = "/connexion",
}: Readonly<{ surTitre?: string; libelleLien?: string; cheminLien?: string }>) {
  return (
    <header className="auth-entete-sre">
      <Link to="/accueil" className="marque-sre">
        <span>
          <Landmark size={20} />
        </span>
        <div>
          <strong>
            SRE<span>·</span>Portail
          </strong>
          <small>{surTitre}</small>
        </div>
      </Link>
      <Link className="lien-retour-sre" to={cheminLien}>
        {libelleLien}
      </Link>
    </header>
  );
}
