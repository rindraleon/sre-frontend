import { Link } from "react-router-dom";
import { CircleHelp } from "lucide-react";
import { LogoSre } from "@/assets/icons/logo-sre";

export function AuthHeader({
  surTitre = "SERVICE RÉGIONAL DES ENTREPRISES",
  libelleLien = "Connexion",
  cheminLien = "/connexion",
}: Readonly<{ surTitre?: string; libelleLien?: string; cheminLien?: string }>) {
  return (
    <header className="auth-entete-sre">
      <Link to="/accueil" className="marque-sre">
        <LogoSre taille={30} sousTitre={surTitre} />
      </Link>
      <nav className="flex items-center gap-3">
        <Link className="lien-retour-sre inline-flex items-center gap-1.5" to="/aide">
          <CircleHelp size={15} aria-hidden="true" /> Aide
        </Link>
        <Link className="lien-retour-sre" to={cheminLien}>
          {libelleLien}
        </Link>
      </nav>
    </header>
  );
}
