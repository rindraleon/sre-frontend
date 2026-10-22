import { Link } from "react-router-dom";
import { CircleHelp } from "lucide-react";
import { LogoSre } from "@/assets/icons/logo-sre";
import { PublicThemeToggle } from "@/components/public/public-theme-toggle";

export function AuthHeader({
  overline = "SERVICE RÉGIONAL DES ENTREPRISES",
  linkLabel = "Connexion",
  linkPath = "/connexion",
}: Readonly<{ overline?: string; linkLabel?: string; linkPath?: string }>) {
  return (
    <header className="auth-header-sre">
      <Link to="/accueil" className="brand-sre">
        <LogoSre size={30} subtitle={overline} />
      </Link>
      <nav className="flex items-center gap-3">
        <Link className="back-link-sre inline-flex items-center gap-1.5" to="/aide">
          <CircleHelp size={15} aria-hidden="true" /> Aide
        </Link>
        <Link className="back-link-sre" to={linkPath}>
          {linkLabel}
        </Link>
        <PublicThemeToggle />
      </nav>
    </header>
  );
}
