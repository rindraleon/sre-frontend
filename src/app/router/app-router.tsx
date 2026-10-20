import { useState, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth, pathMatchesRole, roleHomePath } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { AppLayout } from "@/components/layout/app-layout";
import { PublicHomePage } from "@/pages/public/home";
import { MentionsLegalesPage, PolitiqueConfidentialitePage } from "@/pages/public/legal";
import { LoginPage } from "@/pages/auth/login";
import { RegisterPage } from "@/pages/auth/register";
import { ChangePasswordPage } from "@/pages/auth/change-password";
import { ForgotPasswordPage } from "@/pages/auth/forgot-password";
import { ResetPasswordPage } from "@/pages/auth/reset-password";
import { ClientDashboardPage } from "@/pages/client/dashboard";
import { ClientObligationsPage } from "@/pages/client/obligations";
import { ClientObligationDetailPage } from "@/pages/client/obligation-detail";
import { ClientPaymentsPage } from "@/pages/client/payments";
import { ClientNewPaymentPage } from "@/pages/client/new-payment";
import { ClientPaymentDetailPage } from "@/pages/client/payment-detail";
import { ClientDocumentsPage } from "@/pages/client/documents";
import { ClientDocumentDetailPage } from "@/pages/client/document-detail";
import { ClientProfilePage } from "@/pages/client/profile";
import { ClientNotificationsPage } from "@/pages/client/notifications";
import { ClientSettingsPage } from "@/pages/client/settings";
import { AdminDashboardPage } from "@/pages/admin/dashboard";
import { AdminTaxpayersPage, AdminBusinessesPage } from "@/pages/admin/taxpayers";
import { AdminTaxpayerDetailPage } from "@/pages/admin/taxpayer-detail";
import { AdminUsersPage } from "@/pages/admin/users";
import { AdminTaxTypesPage } from "@/pages/admin/tax-types";
import { AdminObligationsPage } from "@/pages/admin/obligations";
import { AdminPaymentsPage } from "@/pages/admin/payments";
import { AdminPaymentDetailPage } from "@/pages/admin/payment-detail";
import { AdminRetardsPage } from "@/pages/admin/retards";
import { AdminTaxpayerImportPage } from "@/pages/admin/taxpayer-import";
import { AdminNotificationsPage } from "@/pages/admin/notifications";
import { AdminReportsPage } from "@/pages/admin/reports";
import { AdminActivityLogPage } from "@/pages/admin/activity-log";
import { AdminSettingsPage } from "@/pages/admin/settings";
import { AidePage } from "@/pages/aide";
import { ActivationPage } from "@/pages/auth/activation";
import { ConfigurationInitialePage } from "@/pages/auth/configuration-initiale";
import { ConfirmDialog, ToastRegion } from "@/components/ui";
import { PageLoader } from "@/components/ui/core-spin-loader";
import { RouteProgress } from "@/app/router/route-progress";

export function App() {
  return (
    <>
      <RouteProgress />
      <Routes>
        <Route path="/" element={<Navigate to="/accueil" replace />} />
        <Route path="/accueil" element={<PublicHomePage />} />
        <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialitePage />} />
        <Route path="/aide" element={<AidePage />} />
        <Route path="/connexion" element={<LoginRoute />} />
        <Route path="/inscription" element={<RegisterPage />} />
        <Route path="/activation" element={<ActivationPage />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
        <Route path="/reinitialisation-mot-de-passe" element={<ResetPasswordPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="contribuables" element={<AdminTaxpayersPage />} />
          <Route path="contribuables/:id" element={<AdminTaxpayerDetailPage />} />
          <Route path="entreprises" element={<AdminBusinessesPage />} />
          <Route path="entreprises/:id" element={<AdminTaxpayerDetailPage />} />
          <Route path="utilisateurs" element={<AdminUsersPage />} />
          <Route path="types-impots" element={<AdminTaxTypesPage />} />
          <Route path="obligations" element={<AdminObligationsPage />} />
          <Route path="paiements-a-verifier" element={<AdminPaymentsPage verificationSeule />} />
          <Route path="paiements/:id" element={<AdminPaymentDetailPage />} />
          <Route path="paiements" element={<AdminPaymentsPage />} />
          <Route path="retards" element={<AdminRetardsPage />} />
          <Route path="import-excel" element={<AdminTaxpayerImportPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="rapports" element={<AdminReportsPage />} />
          <Route path="journal" element={<AdminActivityLogPage />} />
          <Route path="parametres" element={<AdminSettingsPage />} />
          <Route path="aide" element={<AidePage dansEspace />} />
          <Route path="configuration-initiale" element={<ConfigurationInitialePage />} />
          <Route path="changement-mot-de-passe" element={<ChangePasswordPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
        <Route
          path="/client"
          element={
            <ProtectedRoute role="CLIENT">
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ClientDashboardPage />} />
          <Route path="obligations" element={<ClientObligationsPage />} />
          <Route path="obligations/:id" element={<ClientObligationDetailPage />} />
          <Route path="paiements/nouveau" element={<ClientNewPaymentPage />} />
          <Route path="paiements/:id" element={<ClientPaymentDetailPage />} />
          <Route path="paiements" element={<ClientPaymentsPage />} />
          <Route path="documents/:id" element={<ClientDocumentDetailPage />} />
          <Route path="documents" element={<ClientDocumentsPage />} />
          <Route path="notifications" element={<ClientNotificationsPage />} />
          <Route path="profil" element={<ClientProfilePage />} />
          <Route path="parametres" element={<ClientSettingsPage />} />
          <Route path="aide" element={<AidePage dansEspace />} />
          <Route path="configuration-initiale" element={<ConfigurationInitialePage />} />
          <Route path="changement-mot-de-passe" element={<ChangePasswordPage />} />
          <Route path="*" element={<Navigate to="/client" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/accueil" replace />} />
      </Routes>
      <ToastRegion />
    </>
  );
}

function ProtectedRoute({ role, children }: Readonly<{ role: "ADMIN" | "CLIENT"; children: ReactNode }>) {
  const {
    session,
    deconnecter,
    verificationApiEnCours,
    erreurVerificationApi,
    reessayerVerificationApi,
  } = useAuth();
  const { chargementInitial } = useSre();
  const emplacement = useLocation();
  const [confirmationDeconnexion, setConfirmationDeconnexion] = useState(false);
  const confirmerDeconnexion = () => {
    setConfirmationDeconnexion(false);
    deconnecter();
  };

  if (chargementInitial || verificationApiEnCours) {
    return (
      <div className="chargement-portail-sre">
        <span className="marque-chargement-sre">SRE</span>
        <PageLoader
          libelle="Préparation de votre espace…"
          detail="Vérification de la session et chargement depuis le serveur"
        />
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
              onClick={() => setConfirmationDeconnexion(true)}
            >
              Se déconnecter
            </button>
          </div>
        </main>
        <ConfirmDialog
          ouvert={confirmationDeconnexion}
          titre="Se déconnecter ?"
          description="Votre session sera fermée sur cet appareil. Vous devrez vous authentifier à nouveau pour accéder à votre espace."
          fermer={() => setConfirmationDeconnexion(false)}
          confirmer={confirmerDeconnexion}
          libelleConfirmer="Se déconnecter"
        />
      </>
    );
  }
  if (!pathMatchesRole(emplacement.pathname, role) || session.role !== role) {
    return <Navigate to={roleHomePath(session.role)} replace />;
  }
  const configurationRequise = session.changementMotDePasseRequis || !session.profilComplete;
  const cheminConfiguration = `${roleHomePath(role)}/configuration-initiale`;
  if (configurationRequise && emplacement.pathname !== cheminConfiguration) {
    return <Navigate to={cheminConfiguration} replace />;
  }
  return children;
}

function LoginRoute() {
  const { session } = useAuth();
  if (session) {
    const racine = roleHomePath(session.role);
    const configurationRequise = session.changementMotDePasseRequis || !session.profilComplete;
    return (
      <Navigate to={configurationRequise ? `${racine}/configuration-initiale` : racine} replace />
    );
  }
  return <LoginPage />;
}
