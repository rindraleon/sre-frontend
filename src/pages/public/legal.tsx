import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Building2,
  ClipboardList,
  FileText,
  LockKeyhole,
  ShieldCheck,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";
import { SRE_REGION } from "@/utils/constants";
import { PublicBrand } from "@/components/public/public-brand";
import { PublicFooter } from "@/components/public/public-footer";
import { useHauteurEntete, useReveal } from "@/hooks";

const SOURCE_DGI = "https://portal.impots.mg/textes/";
const SOURCE_LOI_DONNEES =
  "https://digital.gov.mg/en/2022/07/05/loi-n-2014-038-sur-la-protection-des-donnees-a-caractere-personnel/";

type SectionLien = { id: string; libelle: string };
type PublicLegalShellProps = {
  titre: string;
  surtitre: string;
  introduction: string;
  icone: LucideIcon;
  libelleCarte: string;
  sections: SectionLien[];
  titreAlerte: string;
  texteAlerte: string;
  children: ReactNode;
};

function PublicLegalShell({
  titre,
  surtitre,
  introduction,
  icone: Icone,
  libelleCarte,
  sections,
  titreAlerte,
  texteAlerte,
  children,
}: Readonly<PublicLegalShellProps>) {
  useReveal();
  const entete = useRef<HTMLElement | null>(null);
  useHauteurEntete(entete);

  useEffect(() => {
    const ancienTitre = document.title;
    document.title = `${titre} · SRE · ${SRE_REGION}`;
    return () => {
      document.title = ancienTitre;
    };
  }, [titre]);

  return (
    <div className="site-public-sre site-juridique-public-sre">
      <header className="entete-public-sre entete-juridique-public-sre" ref={entete}>
        <PublicBrand subtitle={SRE_REGION} />
        <nav className="navigation-juridique-sre" aria-label="Navigation du portail">
          <Link to="/aide">Aide</Link>
          <a href="/accueil#contact">Contact</a>
          <Link className="bouton-sre bouton-sre--contour bouton-sre--petit" to="/connexion">
            Connexion
          </Link>
        </nav>
      </header>

      <main className="contenu-juridique-sre">
        <nav className="fil-ariane-juridique-sre" aria-label="Fil d’Ariane">
          <Link to="/accueil">Accueil</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{titre}</span>
        </nav>

        <section className="hero-juridique-sre" data-revelation="gauche">
          <div className="hero-juridique-sre__texte">
            <span className="surtitre-juridique-sre">{surtitre}</span>
            <h1>{titre}</h1>
            <p>{introduction}</p>
            <span className="hero-juridique-sre__lieu">
              <Building2 size={15} aria-hidden="true" /> SRE · {SRE_REGION} · Madagascar
            </span>
          </div>
          <div className="carte-juridique-sre" aria-label={libelleCarte}>
            <span className="carte-juridique-sre__icone">
              <Icone size={25} aria-hidden="true" />
            </span>
            <strong>{libelleCarte}</strong>
            <small>Informations publiques du portail SRE</small>
            <span className="carte-juridique-sre__decor" aria-hidden="true" />
          </div>
        </section>

        <div className="grille-juridique-sre">
          <aside className="sommaire-juridique-sre">
            <div className="sommaire-juridique-sre__interieur">
              <span className="sommaire-juridique-sre__titre">Sur cette page</span>
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  {section.libelle}
                </a>
              ))}
              <a className="sommaire-juridique-sre__aide" href="/accueil#contact">
                Poser une question <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </aside>

          <article className="texte-juridique-sre">{children}</article>
        </div>

        <aside className="alerte-juridique-sre" role="note" data-revelation>
          <span className="alerte-juridique-sre__icone">
            <ShieldCheck size={19} aria-hidden="true" />
          </span>
          <div>
            <strong>{titreAlerte}</strong>
            <p>{texteAlerte}</p>
          </div>
        </aside>
      </main>

      <PublicFooter />
    </div>
  );
}

function LegalSection({
  id,
  numero,
  titre,
  children,
}: Readonly<{ id: string; numero: string; titre: string; children: ReactNode }>) {
  return (
    <section className="section-texte-juridique-sre" id={id} data-revelation>
      <span className="section-texte-juridique-sre__numero">{numero}</span>
      <div>
        <h2>{titre}</h2>
        <div className="section-texte-juridique-sre__corps">{children}</div>
      </div>
    </section>
  );
}

const SECTIONS_MENTIONS = [
  { id: "editeur", libelle: "Éditeur du portail" },
  { id: "hebergement", libelle: "Hébergement et réalisation" },
  { id: "objet", libelle: "Objet du portail" },
  { id: "sources", libelle: "Sources fiscales" },
  { id: "liens", libelle: "Liens et droits d’usage" },
];

export function MentionsLegalesPage() {
  return (
    <PublicLegalShell
      titre="Mentions légales"
      surtitre="REPÈRES INSTITUTIONNELS"
      introduction="Les informations d’identification du portail SRE et les règles d’usage des contenus publics, présentées avec les éléments institutionnels à confirmer par l’administration."
      icone={FileText}
      libelleCarte="Informations légales"
      sections={SECTIONS_MENTIONS}
      titreAlerte="Validation administrative requise avant publication"
      texteAlerte="La dénomination juridique complète de l’éditeur, l’adresse administrative, le directeur de publication, l’hébergeur et les coordonnées officielles ne sont pas définis dans les éléments du projet. Ils ne sont pas remplacés ici par des coordonnées supposées."
    >
      <LegalSection id="editeur" numero="01" titre="Éditeur du portail">
        <p>
          Le portail est présenté sous la marque <strong>SRE</strong> et concerne le périmètre de la
          région <strong>{SRE_REGION}</strong>, à Madagascar. La désignation administrative complète
          de l’autorité éditrice doit être confirmée par le service responsable avant la mise en
          ligne définitive.
        </p>
        <dl className="definitions-juridiques-sre">
          <div>
            <dt>Service présenté</dt>
            <dd>SRE · {SRE_REGION}</dd>
          </div>
          <div>
            <dt>Contact public</dt>
            <dd>
              <a href="/accueil#contact">Formulaire de contact accessible depuis l’accueil</a>
            </dd>
          </div>
          <div>
            <dt>Directeur ou directrice de publication</dt>
            <dd>Identité à renseigner par l’autorité éditrice.</dd>
          </div>
        </dl>
      </LegalSection>

      <LegalSection id="hebergement" numero="02" titre="Hébergement et réalisation">
        <p>
          Le prestataire d’hébergement, le lieu d’hébergement des données et les coordonnées de
          l’équipe éditoriale ne figurent pas dans les informations actuellement disponibles pour
          cette page. Ces renseignements doivent être publiés après validation par l’administration
          et l’équipe technique.
        </p>
        <div className="note-juridique-sre">
          <LockKeyhole size={17} aria-hidden="true" />
          <span>
            Aucun nom d’hébergeur, aucune adresse physique et aucune adresse électronique directe ne
            sont inventés dans cette version.
          </span>
        </div>
      </LegalSection>

      <LegalSection id="objet" numero="03" titre="Objet du portail">
        <p>
          Le portail permet de présenter les services du SRE et, après authentification, de
          consulter les informations et documents associés à un compte, de suivre les obligations
          enregistrées et de transmettre certaines déclarations à l’administration pour examen.
        </p>
        <p>
          Le portail n’exécute pas de paiement. Les informations publiques de présentation ne
          remplacent pas une décision administrative ni les textes officiels applicables.
        </p>
      </LegalSection>

      <LegalSection id="sources" numero="04" titre="Sources fiscales">
        <p>
          Les repères fiscaux présentés sur l’accueil sont synthétiques. Les catégories, conditions,
          taux et échéances sont susceptibles d’évoluer. Pour toute vérification, consultez les
          publications de la Direction générale des impôts.
        </p>
        <div className="liens-sources-juridiques-sre">
          <a href={SOURCE_DGI} target="_blank" rel="noreferrer">
            Recueil des textes de la DGI <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a href="https://portal.impots.mg/" target="_blank" rel="noreferrer">
            Portail de la Direction générale des impôts{" "}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </LegalSection>

      <LegalSection id="liens" numero="05" titre="Liens et droits d’usage">
        <p>
          Les liens vers des sites extérieurs sont fournis pour faciliter l’accès aux sources
          institutionnelles. Le contenu et les conditions d’utilisation de ces sites relèvent de
          leurs éditeurs respectifs.
        </p>
        <p>
          Les droits attachés au logo, aux textes, aux visuels et aux contenus réutilisés doivent
          être respectés selon les autorisations de leurs titulaires. Les éléments tiers et leurs
          licences sont à documenter par l’éditeur du portail.
        </p>
      </LegalSection>
    </PublicLegalShell>
  );
}

const SECTIONS_CONFIDENTIALITE = [
  { id: "responsable", libelle: "Responsable du traitement" },
  { id: "donnees", libelle: "Données concernées" },
  { id: "finalites", libelle: "Utilisation des données" },
  { id: "destinataires", libelle: "Accès et destinataires" },
  { id: "conservation", libelle: "Conservation et transferts" },
  { id: "droits", libelle: "Vos droits" },
  { id: "stockage", libelle: "Stockage dans le navigateur" },
];

export function PolitiqueConfidentialitePage() {
  return (
    <PublicLegalShell
      titre="Politique de confidentialité"
      surtitre="VOS DONNÉES PERSONNELLES"
      introduction="Cette notice décrit les données traitées dans le portail, les usages visibles dans l’application et les informations qui doivent être précisées par le responsable du traitement."
      icone={UserRoundCheck}
      libelleCarte="Données personnelles"
      sections={SECTIONS_CONFIDENTIALITE}
      titreAlerte="Notice de transparence à compléter"
      texteAlerte="Les coordonnées du responsable, les durées de conservation, l’identité des sous-traitants et les éventuels transferts hors de Madagascar doivent être confirmés par l’administration avant diffusion comme politique définitive."
    >
      <LegalSection id="responsable" numero="01" titre="Responsable du traitement">
        <p>
          Le portail est exploité sous la marque SRE pour le périmètre de la région {SRE_REGION}.
          L’identité juridique complète du responsable du traitement et le point de contact chargé
          des demandes relatives aux données doivent être indiqués par l’administration.
        </p>
        <p>
          La présente notice s’appuie sur les fonctionnalités observées dans l’application et sur la
          loi malgache n° 2014-038 relative à la protection des données à caractère personnel. Elle
          ne remplace pas la validation juridique ni l’inventaire formel des traitements.
        </p>
      </LegalSection>

      <LegalSection id="donnees" numero="02" titre="Données concernées">
        <ul className="liste-juridique-sre">
          <li>
            <strong>Compte et profil :</strong> nom, prénom ou raison sociale, adresse électronique,
            téléphone, adresse et ville, région, ainsi que les identifiants fiscaux ou
            administratifs fournis lorsqu’ils sont nécessaires au dossier.
          </li>
          <li>
            <strong>Dossier fiscal :</strong> informations liées aux obligations, déclarations,
            documents et demandes transmis ou enregistrés par l’administration pour le compte.
          </li>
          <li>
            <strong>Demandes de contact :</strong> nom, adresse électronique, sujet et contenu du
            message envoyé par le formulaire public.
          </li>
          <li>
            <strong>Sécurité et fonctionnement :</strong> informations de session et événements
            techniques nécessaires à l’authentification, au contrôle des accès et à l’exploitation
            du service. Les champs précis des journaux doivent être confirmés par l’équipe
            technique.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="finalites" numero="03" titre="Utilisation des données">
        <p>Les données sont utilisées, selon les fonctionnalités activées, pour :</p>
        <ul className="liste-juridique-sre">
          <li>créer et gérer les accès aux espaces du portail ;</li>
          <li>présenter à chaque compte les informations de dossier qui lui sont rattachées ;</li>
          <li>recevoir et faire examiner les déclarations adressées à l’administration ;</li>
          <li>répondre aux demandes transmises par le formulaire de contact ;</li>
          <li>protéger les accès et maintenir le fonctionnement du service.</li>
        </ul>
        <p>
          Les bases juridiques précises à associer à chaque finalité — notamment mission du service,
          obligation légale ou consentement lorsqu’il est requis — doivent être déterminées et
          documentées par le responsable du traitement.
        </p>
      </LegalSection>

      <LegalSection id="destinataires" numero="04" titre="Accès et destinataires">
        <p>
          Les informations d’un dossier sont accessibles au compte concerné et aux agents habilités,
          selon les rôles et permissions contrôlés par le serveur. Les messages du formulaire public
          sont adressés, par le service de messagerie configuré côté serveur, aux administrateurs
          actifs ; le formulaire n’expose pas leurs adresses au navigateur.
        </p>
        <p>
          Le message de contact n’est pas enregistré comme dossier de contact dans la base de
          données de l’application. Il est transmis par courriel : les traitements et durées de
          conservation appliqués par le serveur de messagerie et les boîtes destinataires dépendent
          de leur configuration et doivent être documentés par l’administration.
        </p>
        <p>
          Les prestataires techniques et les éventuels sous-traitants doivent être identifiés dans
          la version définitive de cette notice, avec leur rôle et les données auxquelles ils
          peuvent accéder.
        </p>
      </LegalSection>

      <LegalSection id="conservation" numero="05" titre="Conservation et transferts">
        <p>
          Les durées de conservation par catégorie de données ne sont pas définies dans les
          informations mises à disposition pour cette page. Elles doivent être fixées par le
          responsable en fonction des finalités, des obligations applicables et des règles
          d’archivage, puis publiées ici.
        </p>
        <p>
          Le lieu d’hébergement, les éventuels transferts de données hors de Madagascar et les
          garanties associées doivent également être confirmés. Aucune durée ni localisation n’est
          supposée dans cette notice.
        </p>
      </LegalSection>

      <LegalSection id="droits" numero="06" titre="Vos droits">
        <p>
          Dans les conditions prévues par la loi malgache n° 2014-038, les personnes concernées
          disposent notamment de droits d’information, d’accès, de rectification et d’opposition.
          L’exercice de ces droits peut être soumis aux conditions et exceptions prévues par les
          textes applicables.
        </p>
        <p>
          Pour adresser une demande, utilisez le{" "}
          <a href="/accueil#contact">formulaire de contact public</a> et précisez le droit que vous
          souhaitez exercer ainsi que le compte ou dossier concerné. Évitez d’inclure un mot de
          passe ou des coordonnées bancaires. L’identité et les coordonnées officielles du
          responsable devront être complétées afin de permettre une demande directe.
        </p>
        <a
          className="lien-loi-donnees-sre"
          href={SOURCE_LOI_DONNEES}
          target="_blank"
          rel="noreferrer"
        >
          Consulter la loi n° 2014-038 <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </LegalSection>

      <LegalSection id="stockage" numero="07" titre="Stockage dans le navigateur">
        <p>
          Le code actuel conserve le jeton de session dans le stockage de session du navigateur (
          <code>sessionStorage</code>) et la préférence de thème dans le stockage local (
          <code>localStorage</code>). Cette préférence sert uniquement à retenir l’affichage clair
          ou sombre. Les données fiscales du compte sont chargées depuis le serveur.
        </p>
        <p>
          Aucun outil de mesure d’audience ou traceur publicitaire n’a été identifié dans le code
          public audité. Cette information devra être revue si de nouveaux outils ou intégrations
          sont ajoutés au portail.
        </p>
        <div className="note-juridique-sre">
          <ClipboardList size={17} aria-hidden="true" />
          <span>
            Pour une question ou une demande relative à vos données, vous pouvez aussi consulter la
            page <Link to="/aide">Aide</Link> avant d’écrire à l’administration.
          </span>
        </div>
      </LegalSection>
    </PublicLegalShell>
  );
}
