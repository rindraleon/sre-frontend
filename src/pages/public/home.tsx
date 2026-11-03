import {
  PUBLIC_ANCHOR_CLASS,
  PUBLIC_CHANNELS_CARD_CLASS,
  PUBLIC_CHANNELS_LIST_CLASS,
  PUBLIC_CHANNELS_OVERLINE_CLASS,
  PUBLIC_CHANNELS_SEAL_CLASS,
  PUBLIC_CHANNELS_SECTION_CLASS,
  PUBLIC_CONTACT_ASIDE_CLASS,
  PUBLIC_CONTACT_FORM_PANEL_CLASS,
  PUBLIC_CONTACT_GRID_CLASS,
  PUBLIC_CONTACT_HEADER_CLASS,
  PUBLIC_CONTACT_ICON_CLASS,
  PUBLIC_CONTACT_SECTION_CLASS,
  PUBLIC_FINAL_CALL_CLASS,
  PUBLIC_FINAL_CALL_LINK_CLASS,
  PUBLIC_FINAL_CALL_OVERLINE_CLASS,
  PUBLIC_HEADER_ACTIONS_CLASS,
  PUBLIC_HEADER_CLASS,
  PUBLIC_HERO_ACTIONS_CLASS,
  PUBLIC_HERO_CLASS,
  PUBLIC_HERO_ILLUSTRATION_CLASS,
  PUBLIC_HERO_LEAD_CLASS,
  PUBLIC_HERO_OVERLINE_CLASS,
  PUBLIC_HERO_PATH_BRAND_CLASS,
  PUBLIC_HERO_PATH_FALLBACK_CLASS,
  PUBLIC_HERO_PATH_HALO_CLASS,
  PUBLIC_HERO_PATH_ZONE_CLASS,
  PUBLIC_HERO_POINTS_CLASS,
  PUBLIC_HERO_TEXT_CLASS,
  PUBLIC_HERO_TITLE_CLASS,
  PUBLIC_NAVIGATION_CLASS,
  PUBLIC_NAV_LINK_CLASS,
  PUBLIC_PROMISE_BANNER_CLASS,
  PUBLIC_SCROLL_HINT_CLASS,
  PUBLIC_SCROLL_HINT_LINK_CLASS,
  PUBLIC_SECTION_HEADER_CLASS,
  PUBLIC_SECTION_LEAD_CLASS,
  PUBLIC_SECTION_OVERLINE_CLASS,
  PUBLIC_SECTION_TITLE_CLASS,
  PUBLIC_SERVICES_GRID_CLASS,
  PUBLIC_SERVICES_SECTION_CLASS,
  PUBLIC_SITE_CLASS,
  PUBLIC_STEPS_LEFT_CLASS,
  PUBLIC_STEPS_LIST_CLASS,
  PUBLIC_STEPS_SECTION_CLASS,
  PUBLIC_TAXATION_CARD_ACRONYM_CLASS,
  PUBLIC_TAXATION_CARD_CLASS,
  PUBLIC_TAXATION_CARD_HEADER_CLASS,
  PUBLIC_TAXATION_CARD_ICON_CLASS,
  PUBLIC_TAXATION_GRID_CLASS,
  PUBLIC_TAXATION_HEADER_CLASS,
  PUBLIC_TAXATION_SECTION_CLASS,
  PUBLIC_TAX_NOTE_CLASS,
  PUBLIC_TAX_NOTE_ICON_CLASS,
  REVEAL_CLASS,
  REVEAL_LEFT_CLASS,
  REVEAL_RIGHT_CLASS,
  REVEAL_UP_CLASS,
  REVEAL_ZOOM_CLASS,
  buttonVariants,
} from "@/components";
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
import { SRE_REGION } from "@/data";
import { cn } from "@/utils";
import { PublicContactForm } from "@/components/PublicSiteComponents";
import { FeatureCard } from "@/components/PublicSiteComponents";
import { PromiseItem } from "@/components/PublicSiteComponents";
import { PublicBrand } from "@/components/PublicSiteComponents";
import { PublicFooter } from "@/components/PublicSiteComponents";
import { PublicThemeToggle } from "@/components/PublicSiteComponents";
import { StepItem } from "@/components/PublicSiteComponents";
import { STEPS, FEATURES, PROMISES, TAX_TYPES_MADAGASCAR } from "@/data";
import { useHeaderHeight, useReveal } from "@/hooks";
import { useTheme } from "@/contexts";

const PathDrawingPortfolioHero = lazy(() => import("@/components/ui/path-drawing-portfolio-hero"));

export function PublicHomePage() {
  useReveal();
  const header = useRef<HTMLElement | null>(null);
  useHeaderHeight(header);
  const { theme } = useTheme();
  const isDark = theme === "sombre";
  return (
    <div className={PUBLIC_SITE_CLASS}>
      <header className={PUBLIC_HEADER_CLASS} ref={header}>
        <PublicBrand subtitle={SRE_REGION} />
        <nav className={PUBLIC_NAVIGATION_CLASS} aria-label="Navigation publique">
          <a className={PUBLIC_NAV_LINK_CLASS} href="#services">
            Services
          </a>
          <a className={PUBLIC_NAV_LINK_CLASS} href="#fiscalite">
            Fiscalité
          </a>
          <a className={PUBLIC_NAV_LINK_CLASS} href="#etapes">
            Parcours
          </a>
          <a className={PUBLIC_NAV_LINK_CLASS} href="#securite">
            Sécurité
          </a>
          <a className={PUBLIC_NAV_LINK_CLASS} href="#contact">
            Contact
          </a>
        </nav>
        <div className={PUBLIC_HEADER_ACTIONS_CLASS}>
          <PublicThemeToggle />
          <Link className={buttonVariants({ variant: "outline", size: "small" })} to="/connexion">
            Connexion
          </Link>
        </div>
      </header>
      <main>
        <section className={PUBLIC_HERO_CLASS}>
          <div className={PUBLIC_HERO_TEXT_CLASS}>
            <div className={PUBLIC_HERO_OVERLINE_CLASS}>
              <i /> SERVICE · {SRE_REGION.toUpperCase()}
            </div>
            <h1 className={PUBLIC_HERO_TITLE_CLASS}>
              Vos démarches fiscales,
              <br />
              <em>claires et suivies.</em>
            </h1>
            <p className={PUBLIC_HERO_LEAD_CLASS}>
              Consultez les informations rattachées à votre compte et suivez les déclarations
              enregistrées pour le périmètre de {SRE_REGION}.
            </p>
            <div className={PUBLIC_HERO_ACTIONS_CLASS}>
              <Link
                className={buttonVariants({ variant: "primary", size: "large" })}
                to="/inscription"
              >
                Accéder au portail <ArrowRight size={16} />
              </Link>
              <Link className={buttonVariants({ variant: "light", size: "large" })} to="/connexion">
                J’ai déjà un compte
              </Link>
            </div>
            <div className={PUBLIC_HERO_POINTS_CLASS}>
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
          <div className={cn(PUBLIC_HERO_ILLUSTRATION_CLASS, PUBLIC_HERO_PATH_ZONE_CLASS)}>
            <div className={PUBLIC_HERO_PATH_HALO_CLASS} aria-hidden="true" />
            <Suspense
              fallback={
                <div
                  className={PUBLIC_HERO_PATH_FALLBACK_CLASS}
                  aria-label="SRE, portail fiscal régional"
                >
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
                className={PUBLIC_HERO_PATH_BRAND_CLASS}
              />
            </Suspense>
          </div>
          <div className={PUBLIC_SCROLL_HINT_CLASS}>
            <a className={PUBLIC_SCROLL_HINT_LINK_CLASS} href="#services">
              DÉCOUVRIR LE PORTAIL <ArrowDown size={13} />
            </a>
          </div>
        </section>
        <section className={PUBLIC_PROMISE_BANNER_CLASS}>
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
        <section className={cn(PUBLIC_SERVICES_SECTION_CLASS, PUBLIC_ANCHOR_CLASS)} id="services">
          <div
            className={cn(PUBLIC_SECTION_HEADER_CLASS, REVEAL_CLASS, REVEAL_UP_CLASS)}
            data-reveal
          >
            <span className={PUBLIC_SECTION_OVERLINE_CLASS}>SERVICES DU PORTAIL</span>
            <h2 className={PUBLIC_SECTION_TITLE_CLASS}>
              Les démarches utiles,
              <br />
              au même endroit.
            </h2>
            <p className={PUBLIC_SECTION_LEAD_CLASS}>
              Les listes et documents affichés proviennent des données réellement enregistrées pour
              votre compte.
            </p>
          </div>
          <div className={PUBLIC_SERVICES_GRID_CLASS}>
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
          className={cn(PUBLIC_TAXATION_SECTION_CLASS, PUBLIC_ANCHOR_CLASS)}
          id="fiscalite"
          aria-labelledby="public-taxation-title-sre"
        >
          <div
            className={cn(
              PUBLIC_SECTION_HEADER_CLASS,
              PUBLIC_TAXATION_HEADER_CLASS,
              REVEAL_CLASS,
              REVEAL_UP_CLASS,
            )}
            data-reveal
          >
            <span className={PUBLIC_SECTION_OVERLINE_CLASS}>REPÈRES FISCAUX · MADAGASCAR</span>
            <h2 className={PUBLIC_SECTION_TITLE_CLASS} id="public-taxation-title-sre">
              Les principales catégories d’impôts.
            </h2>
            <p className={PUBLIC_SECTION_LEAD_CLASS}>
              Quelques repères pour mieux comprendre les impositions prévues par le Code des impôts,
              sans figer de taux ou d’échéances susceptibles d’évoluer.
            </p>
          </div>
          <div className={PUBLIC_TAXATION_GRID_CLASS}>
            {TAX_TYPES_MADAGASCAR.map((type, index) => {
              const Icon = type.icon;
              return (
                <article
                  key={type.acronym}
                  className={cn(PUBLIC_TAXATION_CARD_CLASS, REVEAL_CLASS, REVEAL_ZOOM_CLASS)}
                  data-reveal="zoom"
                  data-delai={(index % 5) + 1}
                >
                  <div className={PUBLIC_TAXATION_CARD_HEADER_CLASS}>
                    <span className={PUBLIC_TAXATION_CARD_ICON_CLASS}>
                      <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className={PUBLIC_TAXATION_CARD_ACRONYM_CLASS}>{type.acronym}</span>
                  </div>
                  <h3>{type.title}</h3>
                  <p>{type.description}</p>
                </article>
              );
            })}
          </div>
          <div className={cn(PUBLIC_TAX_NOTE_CLASS, REVEAL_CLASS, REVEAL_UP_CLASS)} data-reveal>
            <span className={PUBLIC_TAX_NOTE_ICON_CLASS}>
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

        <section className={cn(PUBLIC_STEPS_SECTION_CLASS, PUBLIC_ANCHOR_CLASS)} id="etapes">
          <div
            className={cn(PUBLIC_STEPS_LEFT_CLASS, REVEAL_CLASS, REVEAL_LEFT_CLASS)}
            data-reveal="gauche"
          >
            <span className={PUBLIC_SECTION_OVERLINE_CLASS}>PARCOURS CONTRIBUABLE</span>
            <h2 className={PUBLIC_SECTION_TITLE_CLASS}>Un suivi à chaque étape.</h2>
            <p className={PUBLIC_SECTION_LEAD_CLASS}>
              Votre espace n’affiche aucune donnée d’exemple. Les informations sont chargées après
              authentification.
            </p>
            <Link className={buttonVariants({ variant: "primary" })} to="/inscription">
              Créer mon compte <ArrowRight size={15} />
            </Link>
          </div>
          <div className={PUBLIC_STEPS_LIST_CLASS}>
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
        <section className={cn(PUBLIC_CHANNELS_SECTION_CLASS, PUBLIC_ANCHOR_CLASS)} id="securite">
          <div
            className={cn(PUBLIC_CHANNELS_CARD_CLASS, REVEAL_CLASS, REVEAL_UP_CLASS)}
            data-reveal
          >
            <div>
              <span className={PUBLIC_CHANNELS_OVERLINE_CLASS}>
                DÉCLARATION · PAS DE PAIEMENT INTÉGRÉ
              </span>
              <h2>Un suivi, pas un moyen de paiement.</h2>
              <p>
                Le portail ne se connecte à aucune banque ou opérateur et n’encaisse aucun fonds.
                Les modes et références renseignés sont déclaratifs et font l’objet d’un examen
                administratif.
              </p>
              <div className={PUBLIC_CHANNELS_LIST_CLASS}>
                <span>
                  <WalletCards size={17} /> Opération mobile
                </span>
                <span>
                  <Building2 size={17} /> Virement / autre canal
                </span>
              </div>
            </div>
            <div className={PUBLIC_CHANNELS_SEAL_CLASS}>
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
          className={cn(PUBLIC_CONTACT_SECTION_CLASS, PUBLIC_ANCHOR_CLASS)}
          id="contact"
          aria-labelledby="public-contact-title-sre"
        >
          <div
            className={cn(PUBLIC_CONTACT_HEADER_CLASS, REVEAL_CLASS, REVEAL_UP_CLASS)}
            data-reveal
          >
            <span className={PUBLIC_SECTION_OVERLINE_CLASS}>
              CONTACT · {SRE_REGION.toUpperCase()}
            </span>
            <h2 id="public-contact-title-sre">Écrivez à l’administration.</h2>
            <p>
              Une question sur le portail ? Envoyez-nous un message. Il sera transmis aux
              administrateurs actifs ; l’adresse de réponse sera celle que vous indiquez.
            </p>
          </div>
          <div className={PUBLIC_CONTACT_GRID_CLASS}>
            <aside
              className={cn(PUBLIC_CONTACT_ASIDE_CLASS, REVEAL_CLASS, REVEAL_LEFT_CLASS)}
              data-reveal="gauche"
            >
              <span className={PUBLIC_CONTACT_ICON_CLASS}>
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
            <div
              className={cn(PUBLIC_CONTACT_FORM_PANEL_CLASS, REVEAL_CLASS, REVEAL_RIGHT_CLASS)}
              data-reveal="droite"
            >
              <PublicContactForm />
            </div>
          </div>
        </section>
        <section
          className={cn(PUBLIC_FINAL_CALL_CLASS, REVEAL_CLASS, REVEAL_ZOOM_CLASS)}
          data-reveal="zoom"
        >
          <span className={PUBLIC_FINAL_CALL_OVERLINE_CLASS}>
            SERVICE · {SRE_REGION.toUpperCase()}
          </span>
          <h2>Accédez à votre espace.</h2>
          <p>Créez un compte ou connectez-vous pour consulter vos données.</p>
          <div>
            <Link className={buttonVariants({ variant: "light", size: "large" })} to="/inscription">
              Créer un compte <ArrowRight size={15} />
            </Link>
            <Link className={PUBLIC_FINAL_CALL_LINK_CLASS} to="/connexion">
              Se connecter
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
