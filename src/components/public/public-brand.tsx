import { Link } from "react-router-dom";
import logoSre from "@/assets/images/logo-sre-haute-matsiatra.webp";
import { cn } from "@/lib/utils";

type PublicBrandProps = {
  subtitle?: string;
  className?: string;
  variant?: "header" | "footer";
};

export function PublicBrand({
  subtitle = "Portail de suivi fiscal",
  className,
  variant = "header",
}: Readonly<PublicBrandProps>) {
  return (
    <Link
      to="/accueil"
      className={cn("brand-sre brand-sre--public", `brand-sre--${variant}`, className)}
      aria-label="SRE, retour à l’accueil"
    >
      <img className="brand-sre__public-logo" src={logoSre} alt="" aria-hidden="true" />
      <div className="brand-sre__public-text">
        <strong>
          SRE<span>·</span>Portail
        </strong>
        <small>{subtitle}</small>
      </div>
    </Link>
  );
}
