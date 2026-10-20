import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { AuthHeader } from "@/components/layout/auth-header";
import { LoginForm } from "@/components/forms/auth/login-form";
import { getRegistrationStateApi } from "@/services/api-client";
import { ROUTES } from "@/constants";


export function LoginPage() {
  const [administrateurInitialise, setAdministrateurInitialise] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    let actif = true;
    getRegistrationStateApi()
      .then((etat) => {
        if (actif) setAdministrateurInitialise(etat.administrateurInitialise);
      })
      .catch(() => {
        if (actif) setAdministrateurInitialise(true);
      });
    return () => {
      actif = false;
    };
  }, []);

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
          {administrateurInitialise === false && (
            <div className="auth-premier-admin-sre">
              <span>Aucun administrateur n’existe encore.</span>
              <Link to={ROUTES.inscription}>
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
