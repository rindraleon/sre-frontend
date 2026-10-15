import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { AuthHeader } from "@/components/layout/auth-header";

export function ResetPasswordPage() {
  return (
    <div className="page-auth-sre">
      <AuthHeader />
      <main className="auth-cadre-sre">
        <section className="auth-carte-sre">
          <div className="auth-icone-sre">
            <KeyRound size={20} />
          </div>
          <span className="sur-titre-sre">SÉCURITÉ DU COMPTE</span>
          <h1>Lien de réinitialisation non pris en charge</h1>
          <p>
            Cette page n’accepte pas de jeton local. Aucun mot de passe ne peut être modifié sans
            validation du backend.
          </p>
          <Link className="lien-retour-auth-sre" to="/connexion">
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </section>
      </main>
    </div>
  );
}
