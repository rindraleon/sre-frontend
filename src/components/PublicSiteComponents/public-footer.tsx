import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { SRE_REGION } from "@/data";
import { PublicBrand } from "./public-brand";
import {
  PUBLIC_FOOTER_ACTIONS_CLASS,
  PUBLIC_FOOTER_BADGE_CLASS,
  PUBLIC_FOOTER_BOTTOM_CLASS,
  PUBLIC_FOOTER_CLASS,
  PUBLIC_FOOTER_CONTENT_CLASS,
  PUBLIC_FOOTER_CTA_CLASS,
  PUBLIC_FOOTER_EXTERNAL_CLASS,
  PUBLIC_FOOTER_IDENTITY_TEXT_CLASS,
  PUBLIC_FOOTER_LEGAL_CLASS,
  PUBLIC_FOOTER_LINK_CLASS,
  PUBLIC_FOOTER_LIST_CLASS,
  PUBLIC_FOOTER_WATERMARK_CLASS,
} from "@/components";

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
    <footer className={PUBLIC_FOOTER_CLASS}>
      <span className={PUBLIC_FOOTER_WATERMARK_CLASS} aria-hidden="true">
        SRE HM
      </span>

      <div className={PUBLIC_FOOTER_CONTENT_CLASS}>
        <div>
          <PublicBrand variant="footer" subtitle={SRE_REGION.toUpperCase()} />
          <p className={PUBLIC_FOOTER_IDENTITY_TEXT_CLASS}>
            Un espace de suivi des démarches fiscales du SRE pour le périmètre de {SRE_REGION}. Les
            données de dossier sont chargées depuis le serveur après authentification.
          </p>
        </div>

        <nav aria-label="Explorer le portail">
          <ul className={PUBLIC_FOOTER_LIST_CLASS}>
            {EXPLORATION.map((link) => (
              <li key={link.to}>
                {link.to.includes("#") ? (
                  <a className={PUBLIC_FOOTER_LINK_CLASS} href={link.to}>
                    {link.label}
                  </a>
                ) : (
                  <Link className={PUBLIC_FOOTER_LINK_CLASS} to={link.to}>
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <a className={PUBLIC_FOOTER_LINK_CLASS} href="/accueil#contact">
                Contacter l’administration
              </a>
            </li>
          </ul>
        </nav>

        <div className={PUBLIC_FOOTER_ACTIONS_CLASS}>
          <a
            className={PUBLIC_FOOTER_EXTERNAL_CLASS}
            href="https://portal.impots.mg/textes/"
            target="_blank"
            rel="noreferrer"
          >
            Textes fiscaux de la DGI <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <Link className={PUBLIC_FOOTER_CTA_CLASS} to="/connexion">
            Ouvrir mon espace <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <span className={PUBLIC_FOOTER_BADGE_CLASS}>
            <ShieldCheck size={14} aria-hidden="true" /> Accès sécurisé
          </span>
        </div>
      </div>

      <div className={PUBLIC_FOOTER_BOTTOM_CLASS}>
        <span>
          © {new Date().getFullYear()} · SRE · {SRE_REGION}
        </span>
        <div className={PUBLIC_FOOTER_LEGAL_CLASS}>
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
