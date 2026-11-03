import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/Layout";
import {
  PublicHomePage,
  LegalNoticePage,
  PrivacyPolicyPage,
  VerifyReceiptPage,
} from "@/pages/public";
import {
  RegisterPage,
  ChangePasswordPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  ActivationPage,
  InitialSetupPage,
} from "@/pages/auth";
import {
  ClientDashboardPage,
  ClientObligationsPage,
  ClientObligationDetailPage,
  ClientPaymentsPage,
  ClientNewPaymentPage,
  ClientPaymentDetailPage,
  ClientDocumentsPage,
  ClientDocumentDetailPage,
  ClientProfilePage,
  ClientNotificationsPage,
  ClientSettingsPage,
} from "@/pages/client";
import {
  AdminDashboardPage,
  AdminTaxpayersPage,
  AdminBusinessesPage,
  AdminTaxpayerDetailPage,
  AdminUsersPage,
  AdminTaxTypesPage,
  AdminObligationsPage,
  AdminPaymentsPage,
  AdminPaymentDetailPage,
  AdminOverduePage,
  AdminTaxpayerImportPage,
  AdminNotificationsPage,
  AdminReportsPage,
  AdminActivityLogPage,
  AdminContactMessagesPage,
  AdminSettingsPage,
} from "@/pages/admin";
import { HelpPage } from "@/pages/help";
import { HelpRoute, LoginRoute, ProtectedRoute } from "@/routes/guards";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/accueil" replace />} />
      <Route path="/accueil" element={<PublicHomePage />} />
      <Route path="/mentions-legales" element={<LegalNoticePage />} />
      <Route path="/politique-confidentialite" element={<PrivacyPolicyPage />} />
      <Route path="/aide" element={<HelpRoute />} />
      <Route path="/verifier-recu" element={<VerifyReceiptPage />} />
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
  );
}
