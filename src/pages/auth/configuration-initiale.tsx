import { ConfigurationInitialeForm } from "@/components/forms/auth/configuration-initiale-form";

/** Parcours de configuration initiale dans l'espace authentifié (admin ou client). */
export function ConfigurationInitialePage() {
  return (
    <div className="page-contenu-sre">
      <section className="auth-carte-sre">
        <ConfigurationInitialeForm />
      </section>
    </div>
  );
}
