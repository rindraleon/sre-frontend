import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { ROUTES } from "@/constants";

export function ForgotPasswordForm() {
  return (
    <section className="auth-carte-sre">
      <div className="auth-icone-sre">
        <KeyRound size={20} />
      </div>
      <span className="sur-titre-sre">RÉCUPÉRATION DU COMPTE</span>
      <h1>Réinitialisation indisponible</h1>
      <p>La récupération de mot de passe par e-mail n’est pas raccordée au backend.</p>
      <div className="note-securite-sre">
        <KeyRound size={16} />
        <p>
          <strong>Aucun lien ne sera généré ou envoyé</strong>
          <span>
            Les demandes et messages de récupération simulés ont été retirés. Utilisez une procédure
            d’assistance vérifiée par le service.
          </span>
        </p>
      </div>
      <Link className="lien-retour-auth-sre" to={ROUTES.connexion}>
        <ArrowLeft size={14} /> Retour à la connexion
      </Link>
    </section>
  );
}
