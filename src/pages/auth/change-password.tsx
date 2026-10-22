import { ChangePasswordForm } from "@/components/forms/auth/change-password-form";

export function ChangePasswordPage() {
  return (
    <div className="page-content-sre">
      <nav className="breadcrumb-sre" aria-label="Fil d’Ariane">
        <span>Accueil</span>
        <i aria-hidden="true">/</i>
        <span aria-current="page">Changer mon mot de passe</span>
      </nav>
      <ChangePasswordForm />
    </div>
  );
}
