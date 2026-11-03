import { ForgotPasswordForm } from "@/components/AuthComponents";
import { AuthHeader } from "@/components/Layout";

export function ForgotPasswordPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-pub-surface-alt text-sre-ink bg-[image:radial-gradient(ellipse_at_80%_15%,color-mix(in_srgb,var(--pub-accent-soft)_20%,transparent),transparent_32%)]">
      <AuthHeader />
      <main className="flex w-full flex-1 items-start justify-center px-5 py-[42px]">
        <ForgotPasswordForm />
      </main>
      <footer className="px-5 pb-4 pt-3 text-center text-[12px] text-pub-faint">
        Lien de réinitialisation sécurisé : à usage unique, valable 24 heures, envoyé uniquement aux
        comptes actifs.
      </footer>
    </div>
  );
}
