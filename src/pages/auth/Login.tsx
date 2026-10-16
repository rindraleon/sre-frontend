import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AuthHeader } from "@/components/layout/auth-header";
import { LoginForm } from "@/components/forms/auth/login-form";
import { ROUTES } from "@/constants";

export function LoginPage() {
  return (
    <div className="page-auth-sre">
      <AuthHeader
        surTitre="ACCÈS AUX SERVICES FISCAUX"
        libelleLien="Retour au portail"
        cheminLien="/accueil"
      />
      <main className="auth-cadre-sre">
        <section className="auth-carte-sre">
          <LoginForm />
          <p className="auth-lien-secondaire-sre">
            Pas encore de compte ? <Link to={ROUTES.inscription}>Créer un compte</Link>
          </p>
          <div className="auth-premier-admin-sre">
            <span>Première visite ?</span>
            <Link to={ROUTES.inscription}>
              Créer le premier compte administrateur ou un compte contribuable{" "}
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
