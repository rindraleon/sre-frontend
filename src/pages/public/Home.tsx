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
import { ETAPES, FEATURES, PROMESSES, TYPES_IMPOTS_MADAGASCAR } from "@/constants/public-content";
import { useHauteurEntete, useReveal } from "@/hooks";
import { PublicBrand } from "@/components/public/public-brand";
import { PublicFooter } from "@/components/public/public-footer";
import { FeatureCard } from "@/components/public/feature-card";
import { StepItem } from "@/components/public/step-item";
import { PromiseItem } from "@/components/public/promise-item";
import { PublicContactForm } from "@/components/public/contact-form";

const PathDrawingPortfolioHero = lazy(() => import("@/components/ui/path-drawing-portfolio-hero"));

export function PublicHomePage() {
  useReveal();
  const entete = useRef<HTMLElement | null>(null);
  useHauteurEntete(entete);
  return (
    <div className="site-public-sre">
      <header className="entete-public-sre" ref={entete}>
        <PublicBrand subtitle={SRE_REGION} />
        <nav className="navigation-public-sre" aria-label="Navigation publique">
          <a href="#services">Services</a>
          <a href="#fiscalite">Fiscalité</a>
          <a href="#etapes">Parcours</a>
          <a href="#securite">Sécurité</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="actions-entete-public-sre">
          <Link className="lien-connexion-public-sre" to="/aide">
            Aide
          </Link>
          <Link className="bouton-sre bouton-sre--contour bouton-sre--petit" to="/connexion">
            Connexion
          </Link>
        </div>
      </header>
      <main>
        <section className="hero-public-sre">
          <div className="hero-public-sre__texte">
            <div className="sur-titre-sre">
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
            <div className="hero-public-sre__actions">
              <Link className="bouton-sre bouton-sre--primaire bouton-sre--grand" to="/inscription">
                Accéder au portail <ArrowRight size={16} />
              </Link>
              <Link className="bouton-sre bouton-sre--clair bouton-sre--grand" to="/connexion">
                J’ai déjà un compte
              </Link>
            </div>
            <div className="hero-points-public-sre">
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
          <div className="hero-public-sre__illustration hero-sre-path-zone">
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
                // eyebrow="PORTAIL FISCAL RÉGIONAL"
                // tagline={`Service Régional des Entreprises · ${SRE_REGION}`}
                fromColor="#176f86"
                toColor="#15947c"
                layout="embedded"
                showScrollCue={false}
                className="hero-sre-path-brand"
              />
            </Suspense>
            {/* <div className="hero-sre-path-zone__signature" aria-hidden="true">
              <span />
              <small>HAUTE MATSIATRA · MADAGASCAR</small>
            </div> */}
          </div>
          <div className="scroll-indication-sre">
            <a href="#services">
              DÉCOUVRIR LE PORTAIL <ArrowDown size={13} />
            </a>
          </div>
        </section>
        <section className="bandeau-promesse-public-sre">
          {PROMESSES.map((p, idx) => (
            <PromiseItem
              key={idx}
              icone={p.icone}
              titre={p.titre}
              description={p.description}
              delai={idx + 1}
            />
          ))}
        </section>
        <section className="section-services-public-sre" id="services">
          <div className="section-public-entete-sre" data-revelation>
            <span className="sur-titre-sre">SERVICES DU PORTAIL</span>
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
          <div className="cartes-services-public-sre">
            {FEATURES.map((f, idx) => (
              <FeatureCard
                key={f.titre}
                index={f.index}
                Icône={f.icone}
                titre={f.titre}
                description={f.description}
                lienTexte={f.lienTexte}
                delai={idx + 1}
              />
            ))}
          </div>
        </section>
        <section
          className="section-fiscalite-public-sre"
          id="fiscalite"
          aria-labelledby="titre-fiscalite-public-sre"
        >
          <div
            className="section-public-entete-sre section-fiscalite-public-sre__entete"
            data-revelation
          >
            <span className="sur-titre-sre">REPÈRES FISCAUX · MADAGASCAR</span>
            <h2 id="titre-fiscalite-public-sre">Les principales catégories d’impôts.</h2>
            <p>
              Quelques repères pour mieux comprendre les impositions prévues par le Code des impôts,
              sans figer de taux ou d’échéances susceptibles d’évoluer.
            </p>
          </div>
          <div className="cartes-fiscalite-public-sre">
            {TYPES_IMPOTS_MADAGASCAR.map((type, index) => {
              const Icone = type.icone;
              return (
                <article
                  key={type.sigle}
                  className="carte-fiscalite-public-sre"
                  data-revelation="zoom"
                  data-delai={(index % 5) + 1}
                >
                  <div className="carte-fiscalite-public-sre__entete">
                    <span className="carte-fiscalite-public-sre__icone">
                      <Icone size={19} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className="carte-fiscalite-public-sre__sigle">{type.sigle}</span>
                  </div>
                  <h3>{type.intitule}</h3>
                  <p>{type.description}</p>
                </article>
              );
            })}
          </div>
          <div className="note-fiscalite-public-sre" data-revelation>
            <span className="note-fiscalite-public-sre__icone">
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

        <section className="section-etapes-public-sre" id="etapes">
          <div className="section-etapes-public-sre__gauche" data-revelation="gauche">
            <span className="sur-titre-sre">PARCOURS CONTRIBUABLE</span>
            <h2>Un suivi à chaque étape.</h2>
            <p>
              Votre espace n’affiche aucune donnée d’exemple. Les informations sont chargées après
              authentification.
            </p>
            <Link className="bouton-sre bouton-sre--primaire" to="/inscription">
              Créer mon compte <ArrowRight size={15} />
            </Link>
          </div>
          <div className="liste-etapes-public-sre">
            {ETAPES.map((e, idx) => (
              <StepItem
                key={e.numero}
                numero={e.numero}
                titre={e.titre}
                description={e.description}
                delai={idx + 1}
              />
            ))}
          </div>
        </section>
        <section className="section-canaux-public-sre" id="securite">
          <div className="section-canaux-public-sre__carte" data-revelation>
            <div>
              <span className="sur-titre-sre">DÉCLARATION · PAS DE PAIEMENT INTÉGRÉ</span>
              <h2>Un suivi, pas un moyen de paiement.</h2>
              <p>
                Le portail ne se connecte à aucune banque ou opérateur et n’encaisse aucun fonds.
                Les modes et références renseignés sont déclaratifs et font l’objet d’un examen
                administratif.
              </p>
              <div className="canaux-public-sre">
                <span>
                  <WalletCards size={17} /> Opération mobile
                </span>
                <span>
                  <Building2 size={17} /> Virement / autre canal
                </span>
              </div>
            </div>
            <div className="canaux-sceau-public-sre">
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
          className="section-contact-public-sre"
          id="contact"
          aria-labelledby="titre-contact-public-sre"
        >
          <div className="section-contact-public-sre__entete" data-revelation>
            <span className="sur-titre-sre">CONTACT · {SRE_REGION.toUpperCase()}</span>
            <h2 id="titre-contact-public-sre">Écrivez à l’administration.</h2>
            <p>
              Une question sur le portail ? Envoyez-nous un message. Il sera transmis aux
              administrateurs actifs ; l’adresse de réponse sera celle que vous indiquez.
            </p>
          </div>
          <div className="section-contact-public-sre__grille">
            <aside className="section-contact-public-sre__aside" data-revelation="gauche">
              <span className="section-contact-public-sre__icone">
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
              <Link className="section-contact-public-sre__aide" to="/aide">
                Consulter l’aide avant d’écrire <ArrowRight size={14} />
              </Link>
            </aside>
            <div className="section-contact-public-sre__formulaire" data-revelation="droite">
              <PublicContactForm />
            </div>
          </div>
        </section>
        <section className="appel-final-public-sre" data-revelation="zoom">
          <span className="sur-titre-sre">SERVICE · {SRE_REGION.toUpperCase()}</span>
          <h2>Accédez à votre espace.</h2>
          <p>Créez un compte ou connectez-vous pour consulter vos données.</p>
          <div>
            <Link className="bouton-sre bouton-sre--clair bouton-sre--grand" to="/inscription">
              Créer un compte <ArrowRight size={15} />
            </Link>
            <Link className="lien-final-public-sre" to="/connexion">
              Se connecter
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
