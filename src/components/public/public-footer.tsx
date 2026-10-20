import { ArrowRight, ArrowUpRight, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { SRE_REGION } from "@/utils/constants";
import { PublicBrand } from "@/components/public/public-brand";

const EXPLORATION = [
  { label: "Accueil", to: "/accueil" },
  { label: "Services", to: "/accueil#services" },
  { label: "Fiscalité à Madagascar", to: "/accueil#fiscalite" },
  { label: "Parcours", to: "/accueil#etapes" },
  { label: "Aide et documentation", to: "/aide" },
];

const CADRE_LEGAL = [
  { label: "Mentions légales", to: "/mentions-legales" },
  { label: "Politique de confidentialité", to: "/politique-confidentialite" },
];

export function PublicFooter() {
  return (
    <footer className="pied-public-sre pied-public-sre--institutionnel">
      <div className="pied-public-sre__contenu">
        <div className="pied-public-sre__identite">
          <PublicBrand variant="footer" subtitle={SRE_REGION.toUpperCase()} />
          <p>
            Un espace de suivi des démarches fiscales du SRE pour le périmètre de {SRE_REGION}. Les
            données de dossier sont chargées depuis le serveur après authentification.
          </p>
          <span className="pied-public-sre__region">
            <MapPin size={15} aria-hidden="true" /> Madagascar · {SRE_REGION}
          </span>
        </div>

        <nav className="pied-public-sre__colonne" aria-label="Explorer le portail">
          <h2>Explorer</h2>
          <ul>
            {EXPLORATION.map((lien) => (
              <li key={lien.to}>
                {lien.to.includes("#") ? (
                  <a href={lien.to}>{lien.label}</a>
                ) : (
                  <Link to={lien.to}>{lien.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <nav className="pied-public-sre__colonne" aria-label="Informations légales">
          <h2>Informations</h2>
          <ul>
            {CADRE_LEGAL.map((lien) => (
              <li key={lien.to}>
                {lien.to.includes("#") ? (
                  <a href={lien.to}>{lien.label}</a>
                ) : (
                  <Link to={lien.to}>{lien.label}</Link>
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

        <div className="pied-public-sre__appel">
          <span className="pied-public-sre__badge">
            <ShieldCheck size={15} aria-hidden="true" /> Accès sécurisé
          </span>
          <h2>Votre dossier, au même endroit.</h2>
          <p>Connectez-vous pour consulter les informations rattachées à votre compte.</p>
          <Link className="pied-public-sre__cta" to="/connexion">
            Ouvrir mon espace <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="pied-public-sre__bas pied-public-sre__bas--institutionnel">
        <span>
          © {new Date().getFullYear()} · SRE · {SRE_REGION}
        </span>
        <span>Portail de suivi fiscal</span>
      </div>
    </footer>
  );
}
