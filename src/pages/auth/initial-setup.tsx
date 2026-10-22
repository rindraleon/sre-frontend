import { InitialSetupForm } from "@/components/forms/auth/initial-setup-form";

/** Initial setup flow within the authenticated workspace (admin or client). */
export function InitialSetupPage() {
  return (
    <div className="page-content-sre">
      <section className="auth-card-sre">
        <InitialSetupForm />
      </section>
    </div>
  );
}
