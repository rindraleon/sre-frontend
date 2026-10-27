import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
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
      <span className="public-footer-sre__watermark" aria-hidden="true">
        SRE HM
      </span>

      <div className="public-footer-sre__content">
        <div className="public-footer-sre__identity">
          <PublicBrand variant="footer" subtitle={SRE_REGION.toUpperCase()} />
          <p>
            Un espace de suivi des démarches fiscales du SRE pour le périmètre de {SRE_REGION}. Les
            données de dossier sont chargées depuis le serveur après authentification.
          </p>
        </div>

        <nav className="public-footer-sre__column" aria-label="Explorer le portail">
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
            <li>
              <a href="/accueil#contact">Contacter l’administration</a>
            </li>
          </ul>
        </nav>

        <div className="public-footer-sre__actions">
          <a
            className="public-footer-sre__external"
            href="https://portal.impots.mg/textes/"
            target="_blank"
            rel="noreferrer"
          >
            Textes fiscaux de la DGI <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <Link className="public-footer-sre__cta" to="/connexion">
            Ouvrir mon espace <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <span className="public-footer-sre__badge">
            <ShieldCheck size={14} aria-hidden="true" /> Accès sécurisé
          </span>
        </div>
      </div>

      {/* <div className="public-footer-sre__region">
        <MapPin size={15} aria-hidden="true" />
        Madagascar · {SRE_REGION}
      </div> */}

      <div className="public-footer-sre__bottom public-footer-sre__bottom--institutional">
        <span>
          © {new Date().getFullYear()} · SRE · {SRE_REGION}
        </span>
        <div className="public-footer-sre__legal">
          {LEGAL_FRAMEWORK.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
          <span>Portail de suivi fiscal</span>
        </div>
      </div>
    </footer>
  );
}
