import { useMemo } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  BookOpenCheck,
  ClipboardCheck,
  FileText,
  Gauge,
  LifeBuoy,
  LogIn,
  Mail,
  Receipt,
  ShieldCheck,
  TriangleAlert,
  WalletCards,
} from "lucide-react";
import { AuthHeader } from "@/components/layout/auth-header";
import { useAuth } from "@/context/AuthContext";

type SectionHelp = {
  id: string;
  title: string;
  icon: typeof Gauge;
  summary: string;
  points: string[];
};

const COMMON_SECTIONS: SectionHelp[] = [
  {
    id: "demarrage",
    title: "Démarrage et connexion",
    icon: LogIn,
    summary: "Accéder à votre espace et sécuriser votre compte.",
    points: [
      "La connexion utilise votre adresse e-mail et votre mot de passe. Le numéro STAT n’est jamais demandé dans un champ séparé.",
      "Première connexion d’un compte créé par l’administration : le mot de passe provisoire est le numéro STAT transmis ; la configuration initiale (nouveau mot de passe + validation du profil) est obligatoire avant tout accès aux fonctionnalités.",
      "Vous pouvez aussi ouvrir le lien d’activation sécurisé du courriel de bienvenue : à usage unique et à expiration contrôlée, il permet de définir directement votre mot de passe personnel.",
      "Un mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule et un chiffre.",
      "La déconnexion demande toujours une confirmation explicite ; vous pouvez annuler sans quitter la page.",
      "Mot de passe oublié : un lien de réinitialisation à usage unique (24 h) est envoyé par e-mail ; aucune information sur l’existence d’un compte n’est divulguée.",
    ],
  },
  {
    id: "statuts",
    title: "Statuts, validations et documents",
    icon: ShieldCheck,
    summary: "Comprendre les états d’un dossier et ce qu’ils autorisent.",
    points: [
      "Obligation : « À payer », « En retard », « Paiement en cours », « En vérification », « Payée », « Rejetée », « Correction demandée ».",
      "Une déclaration de paiement est soumise en attente de validation : elle porte le statut « En vérification » jusqu’à la décision d’un administrateur.",
      "L’accusé de réception atteste uniquement la soumission de votre déclaration.",
      "Le reçu interne (facture) n’est émis, consultable et téléchargeable qu’après la validation effective du paiement par un administrateur autorisé.",
      "En cas de rejet, le document reste indisponible et le motif éventuel est affiché sur la déclaration.",
    ],
  },
  {
    id: "depannage",
    title: "Dépannage",
    icon: LifeBuoy,
    summary: "Solutions aux erreurs les plus courantes.",
    points: [
      "« Identifiants incorrects » : vérifiez l’adresse e-mail, le mot de passe et le numéro STAT (requis pour les profils qui en disposent).",
      "Le bouton de connexion reste inactif tant que le service serveur n’est pas configuré : contactez l’administration.",
      "Une page vide signifie qu’aucune donnée n’est enregistrée sur le serveur pour ce filtre : aucun jeu de démonstration n’est affiché.",
      "Téléchargement impossible : le document n’est disponible qu’après validation du paiement et pour le compte propriétaire.",
      "En cas d’erreur serveur, réessayez ; si l’anomalie persiste, notez le message affiché et contactez l’administration avec la référence du dossier.",
    ],
  },
];

const SECTIONS_CLIENT: SectionHelp[] = [
  {
    id: "espace-client",
    title: "Mon espace contribuable",
    icon: Gauge,
    summary: "Consulter vos obligations, déclarer un paiement et suivre vos documents.",
    points: [
      "« Mes impôts » liste vos obligations fiscales enregistrées (référence, période, montant, échéance, statut).",
      "« Déclarer un paiement » : sélectionnez l’obligation, indiquez la référence de transaction et les informations du moyen utilisé ; la déclaration est enregistrée pour vérification.",
      "« Historique des paiements » : suivez chaque déclaration et ses décisions ; « Mes reçus » regroupe les documents réellement émis.",
      "Chaque compte ne voit que ses propres dossiers : aucune donnée d’une autre entité n’est accessible.",
    ],
  },
  {
    id: "procedure-paiement",
    title: "Procédure de déclaration de paiement",
    icon: WalletCards,
    summary: "Les étapes d’une déclaration, de la saisie à la validation.",
    points: [
      "1. Ouvrez « Déclarer un paiement » et choisissez l’obligation concernée.",
      "2. Renseignez le mode de paiement, la référence de transaction et la date ; joignez les informations demandées.",
      "3. Soumettez : la déclaration passe en « En vérification » et un accusé de réception est généré.",
      "4. Un administrateur examine la déclaration puis la confirme, la rejette ou demande une correction.",
      "5. Après confirmation, le reçu devient disponible dans « Mes reçus » (consultation et téléchargement PDF).",
    ],
  },
  {
    id: "notifications-client",
    title: "Notifications et rappels",
    icon: Mail,
    summary: "Suivre les rappels d’échéances et les messages de l’administration.",
    points: [
      "Les rappels d’échéances apparaissent dans « Notifications » ; un compteur signale les messages non lus.",
      "« Tout marquer comme lu » vide le compteur ; l’historique reste consultable.",
      "Les dossiers déjà régularisés ne font plus l’objet de rappels de retard.",
    ],
  },
];

const SECTIONS_ADMIN: SectionHelp[] = [
  {
    id: "back-office",
    title: "Back-office : périmètre et rôles",
    icon: Gauge,
    summary: "Gérer les profils, comptes, types d’impôts et obligations.",
    points: [
      "Les profils contribuables et entreprises sont créés ou importés (Excel) ; l’import crée aussi les comptes des entreprises valides (profil + compte liés, e-mail d’activation envoyé).",
      "« Comptes utilisateurs » : statut des accès ; le dernier administrateur actif ne peut pas être désactivé.",
      "« Types d’impôts » : configuration validée par l’administration, sans barème préchargé.",
      "« Obligations fiscales » : création d’enregistrements (référence, période, montant, échéance) attribués à un contribuable.",
    ],
  },
  {
    id: "validation-paiements",
    title: "Validation des paiements",
    icon: ClipboardCheck,
    summary: "Décision administrative et émission des reçus.",
    points: [
      "« Vérification des paiements » liste les déclarations en attente (statut « En vérification »).",
      "Chaque déclaration présente la référence de transaction, le montant calculé depuis l’obligation et l’historique des événements.",
      "Confirmer : la déclaration devient « Confirmée », l’obligation « Payée » et le reçu interne est émis automatiquement.",
      "Rejeter ou demander une correction : un motif d’au moins 5 caractères est requis ; aucun reçu n’est émis et le document reste indisponible.",
      "Toute décision est tracée (administrateur, date, motif) ; une seconde décision sur la même déclaration est refusée.",
    ],
  },
  {
    id: "retards",
    title: "Retards et notifications groupées",
    icon: TriangleAlert,
    summary: "Détecter les dossiers en retard et notifier plusieurs entités.",
    points: [
      "« Retards & notifications » calcule les retards depuis les échéances et les statuts enregistrés (nom, STAT, référence, jours de retard).",
      "Filtrez par recherche, situation (en retard, en vérification, rejeté, correction demandée) ou type d’entité ; les dossiers régularisés sont exclus par défaut.",
      "Sélectionnez une ou plusieurs entités (cases à cocher), vérifiez le nombre de destinataires puis cliquez sur « Envoyer une notification ».",
      "Personnalisez le modèle de message : les variables {nom}, {reference}, {echeance}, {joursRetard}, {montant} sont remplacées pour chaque destinataire, sans mélange de données.",
      "Un récapitulatif est demandé avant l’envoi ; le résultat distingue les notifications créées, les doublons ignorés et les échecs partiels.",
      "L’historique conserve destinataire, dossier, message, date, administrateur auteur et statut d’envoi (« En attente », « Envoyée », « Échec » — la livraison n’est annoncée « Délivrée » qu’après confirmation du fournisseur).",
    ],
  },
  {
    id: "premier-admin",
    title: "Création initiale de l’administration",
    icon: Receipt,
    summary: "Un seul processus de création initiale, contrôlé par le serveur.",
    points: [
      "Tant qu’aucun administrateur n’existe, l’écran d’inscription propose « Créer le premier compte » (administrateur).",
      "La vérification et l’attribution du rôle sont effectuées côté serveur ; le bouton disparaît dès qu’un administrateur existe.",
      "Toute seconde tentative de création initiale est refusée par le serveur, même si la requête est contournée.",
      "Récupération d’accès : un lien sécurisé de réinitialisation à usage unique est envoyé par e-mail ; à défaut, une procédure administrative encadrée s’applique (vérification d’identité) — aucun mécanisme de contournement n’est exposé par l’application.",
    ],
  },
  {
    id: "premiere-connexion",
    title: "Comptes entreprises et première connexion",
    icon: BookOpenCheck,
    summary: "Import des comptes, e-mail d’activation et configuration initiale obligatoire.",
    points: [
      "L’administrateur importe les entreprises depuis un fichier Excel : chaque ligne valide (raison sociale, e-mail, STAT) crée un profil et un compte distinct, lié à son numéro STAT.",
      "Un e-mail de bienvenue est envoyé à chaque entreprise : message personnalisé, lien du site officiel, instructions, adresse e-mail du compte et mot de passe provisoire (le STAT), ainsi que le lien d’activation sécurisé recommandé.",
      "Le statut d’envoi de chaque e-mail est suivi ; en cas d’échec, l’administrateur peut renvoyer l’e-mail depuis la page d’import.",
      "L’import est idempotent : réimporter le même fichier ne crée aucun compte ni profil en double (les doublons sont signalés ligne par ligne).",
      "À la première connexion (e-mail + STAT en mot de passe provisoire, ou lien d’activation), la configuration initiale s’impose : nouveau mot de passe, confirmation, vérification du profil — bloquée côté serveur tant qu’elle n’est pas terminée.",
      "Après validation, le mot de passe provisoire est définitivement invalidé et les connexions suivantes utilisent uniquement l’adresse e-mail et le nouveau mot de passe.",
    ],
  },
];

function BlockSection({ section }: Readonly<{ section: SectionHelp }>) {
  const Icon = section.icon;
  return (
    <section id={section.id} className="help-section-sre">
      <h2>
        <Icon size={18} aria-hidden="true" /> {section.title}
      </h2>
      <p className="help-summary-sre">{section.summary}</p>
      <ul>
        {section.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </section>
  );
}

/** Help page: concise documentation, organized and adapted to the signed-in profile. */
export function HelpPage({ withinAppLayout = false }: Readonly<{ withinAppLayout?: boolean }>) {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const moduleRequest = searchParams.get("module");

  const sections = useMemo(() => {
    const list = [...COMMON_SECTIONS];
    if (!session || session.role === "CLIENT") list.push(...SECTIONS_CLIENT);
    if (!session || session.role === "ADMIN") list.push(...SECTIONS_ADMIN);
    return list;
  }, [session]);

  const returnTo = session
    ? session.role === "ADMIN"
      ? { path: "/admin", label: "Retour au back-office" }
      : { path: "/client", label: "Retour à mon espace" }
    : { path: "/accueil", label: "Retour à l’accueil" };

  if (!withinAppLayout && session) {
    return <Navigate to={session.role === "ADMIN" ? "/admin/aide" : "/client/aide"} replace />;
  }

  return (
    <div className={`help-page-sre ${withinAppLayout ? "help-page-sre--area" : ""}`}>
      {!withinAppLayout && (
        <AuthHeader
          linkLabel={session ? returnTo.label : "Connexion"}
          linkPath={session ? returnTo.path : "/connexion"}
        />
      )}
      <main className="help-content-sre">
        {withinAppLayout && (
          <nav className="breadcrumb-sre" aria-label="Fil d’Ariane">
            <span>Accueil</span>
            <i aria-hidden="true">/</i>
            <span aria-current="page">Aide &amp; documentation</span>
          </nav>
        )}
        <header className="help-header-sre">
          <h1>
            <BookOpenCheck size={22} aria-hidden="true" /> Aide &amp; documentation
          </h1>
          <p>
            Présentation des fonctionnalités, procédures essentielles, statuts et dépannage.{" "}
            {moduleRequest
              ? "Le contenu est adapté au module consulté."
              : "Le contenu s’adapte à votre profil."}
          </p>
        </header>
        <div className="help-body-sre">
          <nav className="help-toc-sre" aria-label="Sommaire de l’aide">
            <strong>Sommaire</strong>
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                {section.title}
              </a>
            ))}
          </nav>
          <div className="help-sections-sre">
            {sections.map((section) => (
              <BlockSection key={section.id} section={section} />
            ))}
            <section className="help-section-sre">
              <h2>
                <FileText size={18} aria-hidden="true" /> Bonnes pratiques
              </h2>
              <ul>
                <li>
                  Vérifiez toujours le statut d’une déclaration avant de considérer un paiement comme
                  traité : seule la validation administrative ouvre l’accès au reçu.
                </li>
                <li>
                  Conservez vos références de transaction ; elles figurent sur l’accusé de réception et
                  dans l’historique.
                </li>
                <li>
                  Utilisez un mot de passe unique et ne le transmettez jamais, y compris par courriel.
                </li>
              </ul>
            </section>
            <p className="help-footer-sre">
              Une question reste sans réponse ?{" "}
              {session ? (
                <Link to={returnTo.path}>{returnTo.label}</Link>
              ) : (
                <Link to="/connexion">Contactez votre administration depuis votre espace</Link>
              )}
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
