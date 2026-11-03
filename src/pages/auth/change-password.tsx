import { BREADCRUMB_CLASS, PAGE_CONTENT_CLASS } from "@/components";
import { ChangePasswordForm } from "@/components/AuthComponents";

export function ChangePasswordPage() {
  return (
    <div className={PAGE_CONTENT_CLASS}>
      <nav className={BREADCRUMB_CLASS} aria-label="Fil d’Ariane">
        <span>Accueil</span>
        <i aria-hidden="true">/</i>
        <span aria-current="page">Changer mon mot de passe</span>
      </nav>
      <ChangePasswordForm />
    </div>
  );
}
