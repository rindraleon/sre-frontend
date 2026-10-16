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
        La récupération sera disponible lorsqu’un service serveur sécurisé sera configuré.
      </footer>
    </div>
  );
}
