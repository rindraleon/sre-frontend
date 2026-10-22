import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { AuthHeader } from "@/components/layout/auth-header";
import { LoginForm } from "@/components/forms/auth/login-form";
import { getRegistrationStateApi } from "@/services/api-client";
import { ROUTES } from "@/constants";


export function LoginPage() {
  const [isAdministratorInitialized, setAdministratorInitialized] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    let isActive = true;
    getRegistrationStateApi()
      .then((state) => {
        if (isActive) setAdministratorInitialized(state.administrateurInitialise);
      })
      .catch(() => {
        if (isActive) setAdministratorInitialized(true);
      });
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="page-auth-sre">
      <AuthHeader
        overline="ACCÈS AUX SERVICES FISCAUX"
        linkLabel="Retour au portail"
        linkPath="/accueil"
      />
      <main className="auth-frame-sre">
        <section className="auth-card-sre">
          <LoginForm />
          <p className="auth-link-secondary-sre">
            Pas encore de compte ? <Link to={ROUTES.registration}>Créer un compte</Link>
          </p>
          {isAdministratorInitialized === false && (
            <div className="auth-first-admin-sre">
              <span>Aucun administrateur n’existe encore.</span>
              <Link to={ROUTES.registration}>
                <ShieldCheck size={13} /> Créer le premier administrateur{" "}
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
