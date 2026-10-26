import { lazy, Suspense, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Building2,
  Mail,
  MessageCircle,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { SRE_REGION } from "@/utils/constants";
import { STEPS, FEATURES, PROMISES, TAX_TYPES_MADAGASCAR } from "@/constants/public-content";
import { useHeaderHeight, useReveal } from "@/hooks";
import { useTheme } from "@/context/ThemeContext";
import { PublicBrand } from "@/components/public/public-brand";
import { PublicFooter } from "@/components/public/public-footer";
import { FeatureCard } from "@/components/public/feature-card";
import { StepItem } from "@/components/public/step-item";
import { PromiseItem } from "@/components/public/promise-item";
import { PublicContactForm } from "@/components/public/contact-form";
import { PublicThemeToggle } from "@/components/public/public-theme-toggle";

const PathDrawingPortfolioHero = lazy(() => import("@/components/ui/path-drawing-portfolio-hero"));

export function PublicHomePage() {
  useReveal();
  const header = useRef<HTMLElement | null>(null);
  useHeaderHeight(header);
  const { theme } = useTheme();
  const isDark = theme === "sombre";
  return (
    <div className="public-site-sre">
      <header className="public-header-sre" ref={header}>
        <PublicBrand subtitle={SRE_REGION} />
        <nav className="public-navigation-sre" aria-label="Navigation publique">
          <a href="#services">Services</a>
          <a href="#fiscalite">Fiscalité</a>
          <a href="#etapes">Parcours</a>
          <a href="#securite">Sécurité</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="public-header-actions-sre">
          <PublicThemeToggle />
          <Link className="button-sre button-sre--outline button-sre--small" to="/connexion">
            Connexion
          </Link>
        </div>
      </header>
      <main>
        <section className="public-hero-sre">
          <div className="public-hero-sre__text">
            <div className="overline-sre">
              <i /> SERVICE · {SRE_REGION.toUpperCase()}
            </div>
            <h1>
              Vos démarches fiscales,
              <br />
              <em>claires et suivies.</em>
            </h1>
            <p>
              Consultez les informations rattachées à votre compte et suivez les déclarations
              enregistrées pour le périmètre de {SRE_REGION}.
            </p>
            <div className="public-hero-sre__actions">
              <Link className="button-sre button-sre--primary button-sre--large" to="/inscription">
                Accéder au portail <ArrowRight size={16} />
              </Link>
              <Link className="button-sre button-sre--light button-sre--large" to="/connexion">
                J’ai déjà un compte
              </Link>
            </div>
            <div className="public-hero-points-sre">
              <span>
                <ShieldCheck size={15} /> Accès protégé
              </span>
              <span>
                <BadgeCheck size={15} /> Données serveur
              </span>
              <span>
                <Building2 size={15} /> {SRE_REGION}
              </span>
            </div>
          </div>
          <div className="public-hero-sre__illustration hero-sre-path-zone">
            <div className="hero-sre-path-zone__halo" aria-hidden="true" />
            <Suspense
              fallback={
                <div className="hero-sre-path-fallback" aria-label="SRE, portail fiscal régional">
                  <strong>SRE</strong>
                  <span>Service Régional des Entreprises · {SRE_REGION}</span>
                </div>
              }
            >
              <PathDrawingPortfolioHero
                brand="SRE"
                fromColor={isDark ? "#3aa0ad" : "#176f86"}
                toColor={isDark ? "#43bb96" : "#15947c"}
                layout="embedded"
                showScrollCue={false}
                className="hero-sre-path-brand"
              />
            </Suspense>
          </div>
          <div className="scroll-hint-sre">
            <a href="#services">
              DÉCOUVRIR LE PORTAIL <ArrowDown size={13} />
            </a>
          </div>
        </section>
        <section className="public-promise-banner-sre">
          {PROMISES.map((p, idx) => (
            <PromiseItem
              key={idx}
              icon={p.icon}
              title={p.title}
              description={p.description}
              delay={idx + 1}
            />
          ))}
        </section>
        <section className="public-services-section-sre" id="services">
          <div className="public-section-header-sre" data-reveal>
            <span className="overline-sre">SERVICES DU PORTAIL</span>
            <h2>
              Les démarches utiles,
              <br />
              au même endroit.
            </h2>
            <p>
              Les listes et documents affichés proviennent des données réellement enregistrées pour
              votre compte.
            </p>
          </div>
          <div className="public-cards-services-sre">
            {FEATURES.map((f, idx) => (
              <FeatureCard
                key={f.title}
                index={f.index}
                Icon={f.icon}
                title={f.title}
                description={f.description}
                linkText={f.linkText}
                delay={idx + 1}
              />
            ))}
          </div>
        </section>
        <section
          className="public-taxation-section-sre"
          id="fiscalite"
          aria-labelledby="public-taxation-title-sre"
        >
          <div
            className="public-section-header-sre public-taxation-section-sre__header"
            data-reveal
          >
            <span className="overline-sre">REPÈRES FISCAUX · MADAGASCAR</span>
            <h2 id="public-taxation-title-sre">Les principales catégories d’impôts.</h2>
            <p>
              Quelques repères pour mieux comprendre les impositions prévues par le Code des impôts,
              sans figer de taux ou d’échéances susceptibles d’évoluer.
            </p>
          </div>
          <div className="public-cards-taxation-sre">
            {TAX_TYPES_MADAGASCAR.map((type, index) => {
              const Icon = type.icon;
              return (
                <article
                  key={type.acronym}
                  className="public-card-taxation-sre"
                  data-reveal="zoom"
                  data-delai={(index % 5) + 1}
                >
                  <div className="public-card-taxation-sre__header">
                    <span className="public-card-taxation-sre__icon">
                      <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className="public-card-taxation-sre__acronym">{type.acronym}</span>
                  </div>
                  <h3>{type.title}</h3>
                  <p>{type.description}</p>
                </article>
              );
            })}
          </div>
          <div className="public-tax-note-sre" data-reveal>
            <span className="public-tax-note-sre__icon">
              <ShieldCheck size={18} aria-hidden="true" />
            </span>
            <p>
              Ces fiches sont des repères généraux : l’imposition applicable dépend notamment de
              l’activité, du statut, du régime et des textes en vigueur. Les obligations proposées
              dans le portail dépendent des informations enregistrées par l’administration.
            </p>
            <a href="https://portal.impots.mg/textes/" target="_blank" rel="noreferrer">
              Textes officiels de la DGI <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="public-steps-section-sre" id="etapes">
          <div className="public-steps-section-sre__left" data-reveal="gauche">
            <span className="overline-sre">PARCOURS CONTRIBUABLE</span>
            <h2>Un suivi à chaque étape.</h2>
            <p>
              Votre espace n’affiche aucune donnée d’exemple. Les informations sont chargées après
              authentification.
            </p>
            <Link className="button-sre button-sre--primary" to="/inscription">
              Créer mon compte <ArrowRight size={15} />
            </Link>
          </div>
          <div className="public-steps-list-sre">
            {STEPS.map((e, idx) => (
              <StepItem
                key={e.number}
                number={e.number}
                title={e.title}
                description={e.description}
                delay={idx + 1}
              />
            ))}
          </div>
        </section>
        <section className="public-channels-section-sre" id="securite">
          <div className="public-channels-section-sre__card" data-reveal>
            <div>
              <span className="overline-sre">DÉCLARATION · PAS DE PAIEMENT INTÉGRÉ</span>
              <h2>Un suivi, pas un moyen de paiement.</h2>
              <p>
                Le portail ne se connecte à aucune banque ou opérateur et n’encaisse aucun fonds.
                Les modes et références renseignés sont déclaratifs et font l’objet d’un examen
                administratif.
              </p>
              <div className="public-channels-sre">
                <span>
                  <WalletCards size={17} /> Opération mobile
                </span>
                <span>
                  <Building2 size={17} /> Virement / autre canal
                </span>
              </div>
            </div>
            <div className="public-channels-seal-sre">
              <WalletCards size={30} />
              <strong>
                Pas de paiement
                <br />
                dans le portail
              </strong>
              <span>
                Une décision administrative ou un reçu interne ne remplace pas une preuve bancaire.
              </span>
            </div>
          </div>
        </section>
        <section
          className="public-contact-section-sre"
          id="contact"
          aria-labelledby="public-contact-title-sre"
        >
          <div className="public-contact-section-sre__header" data-reveal>
            <span className="overline-sre">CONTACT · {SRE_REGION.toUpperCase()}</span>
            <h2 id="public-contact-title-sre">Écrivez à l’administration.</h2>
            <p>
              Une question sur le portail ? Envoyez-nous un message. Il sera transmis aux
              administrateurs actifs ; l’adresse de réponse sera celle que vous indiquez.
            </p>
          </div>
          <div className="public-contact-section-sre__grid">
            <aside className="public-contact-section-sre__aside" data-reveal="gauche">
              <span className="public-contact-section-sre__icon">
                <MessageCircle size={21} aria-hidden="true" />
              </span>
              <h3>Comment pouvons-nous vous aider ?</h3>
              <p>
                Décrivez votre demande avec quelques détails afin que l’équipe puisse vous orienter.
                Aucun compte n’est nécessaire pour nous écrire.
              </p>
              <ul>
                <li>
                  <Mail size={15} aria-hidden="true" /> Réponse à l’adresse e-mail fournie
                </li>
                <li>
                  <ShieldCheck size={15} aria-hidden="true" /> N’envoyez jamais de mot de passe ni
                  de coordonnées bancaires
                </li>
              </ul>
            </aside>
            <div className="public-contact-section-sre__form" data-reveal="droite">
              <PublicContactForm />
            </div>
          </div>
        </section>
        <section className="public-final-call-sre" data-reveal="zoom">
          <span className="overline-sre">SERVICE · {SRE_REGION.toUpperCase()}</span>
          <h2>Accédez à votre espace.</h2>
          <p>Créez un compte ou connectez-vous pour consulter vos données.</p>
          <div>
            <Link className="button-sre button-sre--light button-sre--large" to="/inscription">
              Créer un compte <ArrowRight size={15} />
            </Link>
            <Link className="public-final-link-sre" to="/connexion">
              Se connecter
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
