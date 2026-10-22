import { useState, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth, pathMatchesRole, roleHomePath } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { AppLayout } from "@/components/layout/app-layout";
import { PublicHomePage } from "@/pages/public/home";
import { LegalNoticePage, PrivacyPolicyPage } from "@/pages/public/legal";
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
import { AdminOverduePage } from "@/pages/admin/overdue";
import { AdminTaxpayerImportPage } from "@/pages/admin/taxpayer-import";
import { AdminNotificationsPage } from "@/pages/admin/notifications";
import { AdminReportsPage } from "@/pages/admin/reports";
import { AdminActivityLogPage } from "@/pages/admin/activity-log";
import { AdminContactMessagesPage } from "@/pages/admin/contact-messages";
import { AdminSettingsPage } from "@/pages/admin/settings";
import { HelpPage } from "@/pages/help";
import { ActivationPage } from "@/pages/auth/activation";
import { InitialSetupPage } from "@/pages/auth/initial-setup";
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
        <Route path="/mentions-legales" element={<LegalNoticePage />} />
        <Route path="/politique-confidentialite" element={<PrivacyPolicyPage />} />
        <Route path="/aide" element={<HelpRoute />} />
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
          <Route path="paiements-a-verifier" element={<AdminPaymentsPage verificationOnly />} />
          <Route path="paiements/:id" element={<AdminPaymentDetailPage />} />
          <Route path="paiements" element={<AdminPaymentsPage />} />
          <Route path="retards" element={<AdminOverduePage />} />
          <Route path="import-excel" element={<AdminTaxpayerImportPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="rapports" element={<AdminReportsPage />} />
          <Route path="journal" element={<AdminActivityLogPage />} />
          <Route path="messages-contact" element={<AdminContactMessagesPage />} />
          <Route path="parametres" element={<AdminSettingsPage />} />
          <Route path="aide" element={<HelpPage withinAppLayout />} />
          <Route path="configuration-initiale" element={<InitialSetupPage />} />
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
          <Route path="aide" element={<HelpPage withinAppLayout />} />
          <Route path="configuration-initiale" element={<InitialSetupPage />} />
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
    logOut,
    isApiVerificationInProgress,
    apiVerificationError,
    retryApiVerification,
  } = useAuth();
  const { isInitialLoading } = useSre();
  const location = useLocation();
  const [confirmationLogout, setConfirmationLogout] = useState(false);
  const confirmLogout = () => {
    setConfirmationLogout(false);
    logOut();
  };

  if (isInitialLoading || isApiVerificationInProgress) {
    return (
      <div className="portal-loading-sre">
        <span className="loading-brand-sre">SRE</span>
        <PageLoader
          label="Préparation de votre espace…"
          detail="Vérification de la session et chargement depuis le serveur"
        />
      </div>
    );
  }
  if (!session) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/connexion?${new URLSearchParams({ retour: returnTo })}`} replace />;
  }
  if (apiVerificationError) {
    return (
      <>
        <main className="portal-loading-sre" role="alert">
          <span className="loading-brand-sre">SRE</span>
          <strong>Impossible de charger les données du serveur.</strong>
          <small>{apiVerificationError}</small>
          <div className="form-actions-sre">
            <button className="button-sre button-sre--primary" onClick={retryApiVerification}>
              Réessayer
            </button>
            <button
              className="button-sre button-sre--outline"
              onClick={() => setConfirmationLogout(true)}
            >
              Se déconnecter
            </button>
          </div>
        </main>
        <ConfirmDialog
          open={confirmationLogout}
          title="Se déconnecter ?"
          description="Votre session sera fermée sur cet appareil. Vous devrez vous authentifier à nouveau pour accéder à votre espace."
          close={() => setConfirmationLogout(false)}
          confirm={confirmLogout}
          confirmLabel="Se déconnecter"
        />
      </>
    );
  }
  if (!pathMatchesRole(location.pathname, role) || session.role !== role) {
    return <Navigate to={roleHomePath(session.role)} replace />;
  }
  const configurationRequired = session.mustChangePassword || !session.isProfileComplete;
  const setupPath = `${roleHomePath(role)}/configuration-initiale`;
  if (configurationRequired && location.pathname !== setupPath) {
    return <Navigate to={setupPath} replace />;
  }
  return children;
}

function LoginRoute() {
  const { session } = useAuth();
  if (session) {
    const rootPath = roleHomePath(session.role);
    const configurationRequired = session.mustChangePassword || !session.isProfileComplete;
    return (
      <Navigate to={configurationRequired ? `${rootPath}/configuration-initiale` : rootPath} replace />
    );
  }
  return <LoginPage />;
}

function HelpRoute() {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to={`/connexion?${new URLSearchParams({ retour: "/aide" })}`} replace />;
  }
  return <HelpPage />;
}
