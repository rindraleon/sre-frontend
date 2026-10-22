import { ArrowRight, ArrowUpRight, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { SRE_REGION } from "@/utils/constants";
import { PublicBrand } from "@/components/public/public-brand";

const EXPLORATION = [
  { label: "Accueil", to: "/accueil" },
  { label: "Services", to: "/accueil#services" },
  { label: "Fiscalité à Madagascar", to: "/accueil#fiscalite" },
  { label: "Parcours", to: "/accueil#etapes" },
];

const LEGAL_FRAMEWORK = [
  { label: "Mentions légales", to: "/mentions-legales" },
  { label: "Politique de confidentialité", to: "/politique-confidentialite" },
];

export function PublicFooter() {
  return (
    <footer className="public-footer-sre public-footer-sre--institutional">
      <div className="public-footer-sre__content">
        <div className="public-footer-sre__identity">
          <PublicBrand variant="footer" subtitle={SRE_REGION.toUpperCase()} />
          <p>
            Un espace de suivi des démarches fiscales du SRE pour le périmètre de {SRE_REGION}. Les
            données de dossier sont chargées depuis le serveur après authentification.
          </p>
          <span className="public-footer-sre__region">
            <MapPin size={15} aria-hidden="true" /> Madagascar · {SRE_REGION}
          </span>
        </div>

        <nav className="public-footer-sre__column" aria-label="Explorer le portail">
          <h2>Explorer</h2>
          <ul>
            {EXPLORATION.map((link) => (
              <li key={link.to}>
                {link.to.includes("#") ? (
                  <a href={link.to}>{link.label}</a>
                ) : (
                  <Link to={link.to}>{link.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <nav className="public-footer-sre__column" aria-label="Informations légales">
          <h2>Informations</h2>
          <ul>
            {LEGAL_FRAMEWORK.map((link) => (
              <li key={link.to}>
                {link.to.includes("#") ? (
                  <a href={link.to}>{link.label}</a>
                ) : (
                  <Link to={link.to}>{link.label}</Link>
                )}
              </li>
            ))}
            <li>
              <a href="/accueil#contact">Contacter l’administration</a>
            </li>
            <li>
              <a href="https://portal.impots.mg/textes/" target="_blank" rel="noreferrer">
                Textes fiscaux de la DGI <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            </li>
          </ul>
        </nav>

        <div className="public-footer-sre__call">
          <span className="public-footer-sre__badge">
            <ShieldCheck size={15} aria-hidden="true" /> Accès sécurisé
          </span>
          <h2>Votre dossier, au même endroit.</h2>
          <p>Connectez-vous pour consulter les informations rattachées à votre compte.</p>
          <Link className="public-footer-sre__cta" to="/connexion">
            Ouvrir mon espace <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="public-footer-sre__bottom public-footer-sre__bottom--institutional">
        <span>
          © {new Date().getFullYear()} · SRE · {SRE_REGION}
        </span>
        <span>Portail de suivi fiscal</span>
      </div>
    </footer>
  );
}
