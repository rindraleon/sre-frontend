import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Building2,
  FileCheck2,
  Landmark,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { SRE_REGION } from "@/utils/constants";
import { FEATURES, ETAPES, PROMESSES } from "@/constants/public-content";
import { FeatureCard } from "@/components/public/feature-card";
import { StepItem } from "@/components/public/step-item";
import { PromiseItem } from "@/components/public/promise-item";

export function PublicHomePage() {
  return (
    <div className="site-public-sre">
      <header className="entete-public-sre fixed-top">
        <Link to="/accueil" className="marque-sre">
          <span>
            <Landmark size={21} />
          </span>
          <div>
            <strong>
              SRE<span>·</span>Portail
            </strong>
            <small>PORTAIL DE SUIVI FISCAL</small>
          </div>
        </Link>
        <nav className="navigation-public-sre">
          <a href="#services">Services</a>
          <a href="#etapes">Parcours</a>
          <a href="#securite">Sécurité</a>
        </nav>
        <div className="actions-entete-public-sre">
          <Link className="lien-connexion-public-sre" to="/connexion">
            Connexion
          </Link>
          <Link className="bouton-sre bouton-sre--primaire" to="/inscription">
            Créer un compte <ArrowRight size={15} />
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
          <div className="hero-public-sre__illustration">
            <div className="carte-portail-public-sre">
              <div className="carte-portail-public-sre__entete">
                <div>
                  <span className="point-acces-sre" /> ESPACE SÉCURISÉ
                </div>
                <span className="carte-portail-public-sre__menu">•••</span>
              </div>
              <div className="carte-portail-public-sre__salutation">
                <small>VOTRE ESPACE CONTRIBUABLE</small>
                <strong>Suivi de votre dossier</strong>
                <span>Après authentification sécurisée</span>
              </div>
              <div className="carte-portail-public-sre__ligne">
                <span className="carte-portail-public-sre__icone">
                  <FileCheck2 size={16} />
                </span>
                <div>
                  <strong>Obligations enregistrées</strong>
                  <small>Consultation des données liées au compte</small>
                </div>
                <span className="mini-badge-attente-sre">Consulter</span>
              </div>
              <div className="carte-portail-public-sre__paiement">
                <span>
                  <WalletCards size={16} />
                </span>
                <div>
                  <small>DÉCLARATION</small>
                  <strong>Soumission pour examen</strong>
                </div>
                <i>
                  <ArrowRight size={14} />
                </i>
              </div>
              <div className="carte-portail-public-sre__sceau">
                <ShieldCheck size={15} /> Aucune transaction exécutée
              </div>
              <div className="hero-orbite-sre hero-orbite-sre--un" />
              <div className="hero-orbite-sre hero-orbite-sre--deux" />
            </div>
            <div className="hero-illustration-fond-sre">
              <div className="illustration-soleil-sre" />
              <div className="illustration-batiment-sre">
                <span className="fronton-batiment-sre">
                  <Landmark size={66} strokeWidth={1.05} />
                </span>
                <span className="colonne-batiment-sre" />
                <span className="colonne-batiment-sre" />
                <span className="colonne-batiment-sre" />
                <span className="base-batiment-sre" />
              </div>
              <span className="illustration-chiffre-sre">MGA</span>
              <span className="illustration-cercle-sre">SRE</span>
            </div>
          </div>
          <div className="scroll-indication-sre">
            <a href="#services">
              DÉCOUVRIR LE PORTAIL <ArrowDown size={13} />
            </a>
          </div>
        </section>
        <section className="bandeau-promesse-public-sre">
          {PROMESSES.map((p, idx) => (
            <PromiseItem key={idx} icone={p.icone} titre={p.titre} description={p.description} />
          ))}
        </section>
        <section className="section-services-public-sre" id="services">
          <div className="section-public-entete-sre">
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
            {FEATURES.map((f) => (
              <FeatureCard
                key={f.titre}
                index={f.index}
                Icône={f.icone}
                titre={f.titre}
                description={f.description}
                lienTexte={f.lienTexte}
              />
            ))}
          </div>
        </section>
        <section className="section-etapes-public-sre" id="etapes">
          <div className="section-etapes-public-sre__gauche">
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
            {ETAPES.map((e) => (
              <StepItem
                key={e.numero}
                numero={e.numero}
                titre={e.titre}
                description={e.description}
              />
            ))}
          </div>
        </section>
        <section className="section-canaux-public-sre" id="securite">
          <div className="section-canaux-public-sre__carte">
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
        <section className="appel-final-public-sre">
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
      <footer className="pied-public-sre">
        <div className="pied-public-sre__principal">
          <Link to="/accueil" className="marque-sre">
            <span>
              <Landmark size={20} />
            </span>
            <div>
              <strong>
                SRE<span>·</span>Portail
              </strong>
              <small>{SRE_REGION.toUpperCase()}</small>
            </div>
          </Link>
          <p>
            Les informations affichées sont celles enregistrées par le serveur. Aucun taux fiscal ou
            contact officiel n’est défini dans l’interface.
          </p>
        </div>
        <div className="pied-public-sre__bas">
          <span>{SRE_REGION}</span>
          <span>
            <ShieldCheck size={13} /> Aucune opération financière n’est exécutée
          </span>
        </div>
      </footer>
    </div>
  );
}
