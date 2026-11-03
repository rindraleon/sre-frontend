import { Link } from "react-router-dom";
import { CircleHelp } from "lucide-react";
import { LogoSre } from "@/assets/icons/logo-sre";
import { PublicThemeToggle } from "@/components/PublicSiteComponents";
import { BRAND_LINK_CLASS } from "@/components";

export function AuthHeader({
  overline = "SERVICE RÉGIONAL DES ENTREPRISES",
  linkLabel = "Connexion",
  linkPath = "/connexion",
}: Readonly<{ overline?: string; linkLabel?: string; linkPath?: string }>) {
  return (
    <header className="flex min-h-[68px] items-center justify-between border-b border-pub-border bg-pub-glass-soft px-[clamp(20px,5.5vw,76px)]">
      <Link to="/accueil" className={BRAND_LINK_CLASS}>
        <LogoSre size={30} subtitle={overline} />
      </Link>
      <nav className="flex items-center gap-3">
        <Link
          className="text-[11px] font-[650] text-pub-muted transition-colors hover:text-sre-teal inline-flex items-center gap-1.5"
          to="/aide"
        >
          <CircleHelp size={15} aria-hidden="true" /> Aide
        </Link>
        <Link
          className="text-[11px] font-[650] text-pub-muted transition-colors hover:text-sre-teal"
          to={linkPath}
        >
          {linkLabel}
        </Link>
        <PublicThemeToggle />
      </nav>
    </header>
  );
}
