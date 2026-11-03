import { ResetPasswordForm } from "@/components/AuthComponents";
import { AuthHeader } from "@/components/Layout";

export function ResetPasswordPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-pub-surface-alt text-sre-ink bg-[image:radial-gradient(ellipse_at_80%_15%,color-mix(in_srgb,var(--pub-accent-soft)_20%,transparent),transparent_32%)]">
      <AuthHeader />
      <main className="">
        <ResetPasswordForm />
      </main>
    </div>
  );
}
