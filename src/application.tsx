import { useState, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  utiliserAuthentificationSre,
  correspondRoleSre,
  destinationRoleSre,
} from "@/contexte/contexte-authentification-sre";
import { utiliserSre } from "@/contexte/contexte-sre";
import { LayoutSre } from "@/composants/ui/layout-sre";
import { AccueilPublicSre } from "@/pages/front-office/accueil";
import { ConnexionPageSre } from "@/pages/authentification/connexion";
import { InscriptionPageSre } from "@/pages/authentification/inscription";
import {
  ChangementMotDePassePageSre,
  MotDePasseOubliePageSre,
  ReinitialisationMotDePassePageSre,
} from "@/pages/authentification/mot-de-passe";
import { TableauDeBordContribuableSre } from "@/pages/espace-client/tableau-de-bord";
import {
  ObligationsContribuableSre,
  DetailObligationContribuableSre,
} from "@/pages/espace-client/obligations";
import {
  NouveauPaiementContribuableSre,
  PaiementsContribuableSre,
  DetailPaiementContribuableSre,
} from "@/pages/espace-client/paiements";
import {
  DocumentsPaiementContribuableSre,
  DetailDocumentPaiementContribuableSre,
} from "@/pages/espace-client/documents";
import {
  NotificationsContribuableSre,
  ParametresContribuableSre,
  ProfilContribuableSre,
} from "@/pages/espace-client/profil";
import { TableauDeBordAdministrationSre } from "@/pages/back-office/tableau-de-bord";
import {
  ContribuablesAdministrationSre,
  DetailContribuableAdministrationSre,
  EntreprisesAdministrationSre,
} from "@/pages/back-office/contribuables";
import { UtilisateursAdministrationSre } from "@/pages/back-office/utilisateurs";
import { TypesImpotsAdministrationSre } from "@/pages/back-office/types-impots";
import { ObligationsAdministrationSre } from "@/pages/back-office/obligations";
import {
  DetailPaiementAdministrationSre,
  PaiementsAdministrationSre,
} from "@/pages/back-office/paiements";
import { ImportExcelAdministrationSre } from "@/pages/back-office/import-excel";
import { NotificationsAdministrationSre } from "@/pages/back-office/notifications";
import { RapportsAdministrationSre } from "@/pages/back-office/rapports";
import { JournalAdministrationSre } from "@/pages/back-office/journal";
import { ParametresAdministrationSre } from "@/pages/back-office/parametres";
import { ConfirmationSre, ZoneToastsSre } from "@/composants/ui/composants-sre";

export function ApplicationSre() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/accueil" replace />} />
        <Route path="/accueil" element={<AccueilPublicSre />} />
        <Route path="/connexion" element={<RouteConnexionSre />} />
        <Route path="/inscription" element={<InscriptionPageSre />} />
        <Route path="/mot-de-passe-oublie" element={<MotDePasseOubliePageSre />} />
        <Route
          path="/reinitialisation-mot-de-passe"
          element={<ReinitialisationMotDePassePageSre />}
        />
        <Route
          path="/admin"
          element={
            <RouteProtegeeSre role="ADMIN">
              <LayoutSre />
            </RouteProtegeeSre>
          }
        >
          <Route index element={<TableauDeBordAdministrationSre />} />
          <Route path="contribuables" element={<ContribuablesAdministrationSre />} />
          <Route path="contribuables/:id" element={<DetailContribuableAdministrationSre />} />
          <Route path="entreprises" element={<EntreprisesAdministrationSre />} />
          <Route path="entreprises/:id" element={<DetailContribuableAdministrationSre />} />
          <Route path="utilisateurs" element={<UtilisateursAdministrationSre />} />
          <Route path="types-impots" element={<TypesImpotsAdministrationSre />} />
          <Route path="obligations" element={<ObligationsAdministrationSre />} />
          <Route
            path="paiements-a-verifier"
            element={<PaiementsAdministrationSre verificationSeule />}
          />
          <Route path="paiements/:id" element={<DetailPaiementAdministrationSre />} />
          <Route path="paiements" element={<PaiementsAdministrationSre />} />
          <Route path="import-excel" element={<ImportExcelAdministrationSre />} />
          <Route path="notifications" element={<NotificationsAdministrationSre />} />
          <Route path="rapports" element={<RapportsAdministrationSre />} />
          <Route path="journal" element={<JournalAdministrationSre />} />
          <Route path="parametres" element={<ParametresAdministrationSre />} />
          <Route path="changement-mot-de-passe" element={<ChangementMotDePassePageSre />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
        <Route
          path="/client"
          element={
            <RouteProtegeeSre role="CLIENT">
              <LayoutSre />
            </RouteProtegeeSre>
          }
        >
          <Route index element={<TableauDeBordContribuableSre />} />
          <Route path="obligations" element={<ObligationsContribuableSre />} />
          <Route path="obligations/:id" element={<DetailObligationContribuableSre />} />
          <Route path="paiements/nouveau" element={<NouveauPaiementContribuableSre />} />
          <Route path="paiements/:id" element={<DetailPaiementContribuableSre />} />
          <Route path="paiements" element={<PaiementsContribuableSre />} />
          <Route path="documents/:id" element={<DetailDocumentPaiementContribuableSre />} />
          <Route path="documents" element={<DocumentsPaiementContribuableSre />} />
          <Route path="notifications" element={<NotificationsContribuableSre />} />
          <Route path="profil" element={<ProfilContribuableSre />} />
          <Route path="parametres" element={<ParametresContribuableSre />} />
          <Route path="changement-mot-de-passe" element={<ChangementMotDePassePageSre />} />
          <Route path="*" element={<Navigate to="/client" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/accueil" replace />} />
      </Routes>
      <ZoneToastsSre />
    </>
  );
}

function RouteProtegeeSre({ role, children }: { role: "ADMIN" | "CLIENT"; children: ReactNode }) {
  const {
    session,
    deconnecter,
    verificationApiEnCours,
    erreurVerificationApi,
    reessayerVerificationApi,
  } = utiliserAuthentificationSre();
  const { chargementInitial } = utiliserSre();
  const emplacement = useLocation();
  const [confirmationDeconnexion, definirConfirmationDeconnexion] = useState(false);
  const confirmerDeconnexion = () => {
    definirConfirmationDeconnexion(false);
    deconnecter();
  };

  if (chargementInitial || verificationApiEnCours) {
    return (
      <div className="chargement-portail-sre">
        <span className="marque-chargement-sre">SRE</span>
        <strong>Préparation de votre espace…</strong>
        <small>Vérification de la session et chargement depuis le serveur</small>
      </div>
    );
  }
  if (!session) {
    const retour = `${emplacement.pathname}${emplacement.search}`;
    return <Navigate to={`/connexion?${new URLSearchParams({ retour })}`} replace />;
  }
  if (erreurVerificationApi) {
    return (
      <>
        <main className="chargement-portail-sre" role="alert">
          <span className="marque-chargement-sre">SRE</span>
          <strong>Impossible de charger les données du serveur.</strong>
          <small>{erreurVerificationApi}</small>
          <div className="actions-formulaire-sre">
            <button className="bouton-sre bouton-sre--primaire" onClick={reessayerVerificationApi}>
              Réessayer
            </button>
            <button
              className="bouton-sre bouton-sre--contour"
              onClick={() => definirConfirmationDeconnexion(true)}
            >
              Se déconnecter
            </button>
          </div>
        </main>
        <ConfirmationSre
          ouvert={confirmationDeconnexion}
          titre="Se déconnecter ?"
          description="Votre session sera fermée sur cet appareil. Vous devrez vous authentifier à nouveau pour accéder à votre espace."
          fermer={() => definirConfirmationDeconnexion(false)}
          confirmer={confirmerDeconnexion}
          libelleConfirmer="Se déconnecter"
        />
      </>
    );
  }
  if (!correspondRoleSre(emplacement.pathname, role) || session.role !== role) {
    return <Navigate to={destinationRoleSre(session.role)} replace />;
  }
  const cheminChangement = `${destinationRoleSre(role)}/changement-mot-de-passe`;
  if (session.changementMotDePasseRequis && emplacement.pathname !== cheminChangement) {
    return <Navigate to={cheminChangement} replace />;
  }
  return children;
}

function RouteConnexionSre() {
  const { session } = utiliserAuthentificationSre();
  if (session) {
    const racine = destinationRoleSre(session.role);
    return (
      <Navigate
        to={session.changementMotDePasseRequis ? `${racine}/changement-mot-de-passe` : racine}
        replace
      />
    );
  }
  return <ConnexionPageSre />;
}
