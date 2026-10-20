import { ForgotPasswordForm } from "@/components/forms/auth/forgot-password-form";
import { AuthHeader } from "@/components/layout/auth-header";

export function ForgotPasswordPage() {
  return (
    <div className="page-auth-sre">
      <AuthHeader />
      <main className="auth-cadre-sre">
        <ForgotPasswordForm />
      </main>
      <footer className="auth-pied-sre">
        Lien de réinitialisation sécurisé : à usage unique, valable 24 heures, envoyé
        uniquement aux comptes actifs.
      </footer>
    </div>
  );
}
