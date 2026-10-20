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
      className={cn("marque-sre marque-sre--public", `marque-sre--${variant}`, className)}
      aria-label="SRE, retour à l’accueil"
    >
      <img className="marque-sre__logo-public" src={logoSre} alt="" aria-hidden="true" />
      <div className="marque-sre__texte-public">
        <strong>
          SRE<span>·</span>Portail
        </strong>
        <small>{subtitle}</small>
      </div>
    </Link>
  );
}
