import { Link } from "react-router-dom";
import { cn } from "@/utils";
import {
  PUBLIC_BRAND_CLASS,
  PUBLIC_BRAND_TEXT_CLASS,
  publicBrandLogoClass,
  publicBrandSubtitleClass,
  publicBrandTitleClass,
} from "@/components";

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
      className={cn(PUBLIC_BRAND_CLASS, className)}
      aria-label="SRE, retour à l’accueil"
    >
      <img
        className={publicBrandLogoClass(variant)}
        src="/logo-sre.svg"
        alt=""
        aria-hidden="true"
      />
      <div className={PUBLIC_BRAND_TEXT_CLASS}>
        <strong className={publicBrandTitleClass(variant)}>
          SRE<span> </span>Haute Matsiatra
        </strong>
        <small className={publicBrandSubtitleClass(variant)}>{subtitle}</small>
      </div>
    </Link>
  );
}
