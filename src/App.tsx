import { useState, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth, pathMatchesRole, roleHomePath } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { PublicHomePage } from "@/pages/public/Home";
import { LoginPage } from "@/pages/auth/Login";
import { RegisterPage } from "@/pages/auth/Register";
import { ChangePasswordPage } from "@/pages/auth/ChangePassword";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPassword";
import { ResetPasswordPage } from "@/pages/auth/ResetPassword";
import { ClientDashboardPage } from "@/pages/client/Dashboard";
import { ClientObligationsPage } from "@/pages/client/Obligations";
import { ClientObligationDetailPage } from "@/pages/client/ObligationDetail";
import { ClientPaymentsPage } from "@/pages/client/Payments";
import { ClientNewPaymentPage } from "@/pages/client/NewPayment";
import { ClientPaymentDetailPage } from "@/pages/client/PaymentDetail";
import { ClientDocumentsPage } from "@/pages/client/Documents";
import { ClientDocumentDetailPage } from "@/pages/client/DocumentDetail";
import { ClientProfilePage } from "@/pages/client/Profile";
import { ClientNotificationsPage } from "@/pages/client/Notifications";
import { ClientSettingsPage } from "@/pages/client/Settings";
import { AdminDashboardPage } from "@/pages/admin/Dashboard";
import { AdminTaxpayersPage, AdminBusinessesPage } from "@/pages/admin/Taxpayers";
import { AdminTaxpayerDetailPage } from "@/pages/admin/TaxpayerDetail";
import { AdminUsersPage } from "@/pages/admin/Users";
import { AdminTaxTypesPage } from "@/pages/admin/TaxTypes";
import { AdminObligationsPage } from "@/pages/admin/Obligations";
import { AdminPaymentsPage } from "@/pages/admin/Payments";
import { AdminPaymentDetailPage } from "@/pages/admin/PaymentDetail";
import { AdminTaxpayerImportPage } from "@/pages/admin/TaxpayerImport";
import { AdminNotificationsPage } from "@/pages/admin/Notifications";
import { AdminReportsPage } from "@/pages/admin/Reports";
import { AdminActivityLogPage } from "@/pages/admin/ActivityLog";
import { AdminSettingsPage } from "@/pages/admin/Settings";
import { ConfirmDialog, ToastRegion } from "@/components/ui";
import { PageLoader } from "@/components/ui/CoreSpinLoader";

export function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/accueil" replace />} />
        <Route path="/accueil" element={<PublicHomePage />} />
        <Route path="/connexion" element={<LoginRoute />} />
        <Route path="/inscription" element={<RegisterPage />} />
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
          <Route path="import-excel" element={<AdminTaxpayerImportPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="rapports" element={<AdminReportsPage />} />
          <Route path="journal" element={<AdminActivityLogPage />} />
          <Route path="parametres" element={<AdminSettingsPage />} />
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
          <Route path="changement-mot-de-passe" element={<ChangePasswordPage />} />
          <Route path="*" element={<Navigate to="/client" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/accueil" replace />} />
      </Routes>
      <ToastRegion />
    </>
  );
}

function ProtectedRoute({ role, children }: { role: "ADMIN" | "CLIENT"; children: ReactNode }) {
  const {
    session,
    deconnecter,
    verificationApiEnCours,
    erreurVerificationApi,
    reessayerVerificationApi,
  } = useAuth();
  const { chargementInitial } = useSre();
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
              onClick={() => definirConfirmationDeconnexion(true)}
            >
              Se déconnecter
            </button>
          </div>
        </main>
        <ConfirmDialog
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
  if (!pathMatchesRole(emplacement.pathname, role) || session.role !== role) {
    return <Navigate to={roleHomePath(session.role)} replace />;
  }
  const cheminChangement = `${roleHomePath(role)}/changement-mot-de-passe`;
  if (session.changementMotDePasseRequis && emplacement.pathname !== cheminChangement) {
    return <Navigate to={cheminChangement} replace />;
  }
  return children;
}

function LoginRoute() {
  const { session } = useAuth();
  if (session) {
    const racine = roleHomePath(session.role);
    return (
      <Navigate
        to={session.changementMotDePasseRequis ? `${racine}/changement-mot-de-passe` : racine}
        replace
      />
    );
  }
  return <LoginPage />;
}
