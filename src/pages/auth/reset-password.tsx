import { ResetPasswordForm } from "@/components/forms/auth/reset-password-form";
import { AuthHeader } from "@/components/layout/auth-header";

export function ResetPasswordPage() {
  return (
    <div className="page-auth-sre">
      <AuthHeader />
      <main className="auth-cadre-sre">
        <ResetPasswordForm />
      </main>
    </div>
  );
}
