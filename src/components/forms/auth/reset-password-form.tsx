import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import { ROUTES } from "@/constants";
import { callApi } from "@/services/api-client";
import { useApiForm } from "@/hooks";
import {
  resetSchema,
  type PasswordResetFormValues,
} from "@/validation/auth.schema";
import { PasswordField, SubmitButton, FormError } from "@/components/forms/form-field";

/**
 * Reset through the single-use token received by e-mail
 * (`/reinitialisation-mot-de-passe?jeton=…`). The token is validated by the
 * server (expiry, single use) before any change.
 */
export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("jeton") ?? "";
  const [completed, setCompleted] = useState(false);
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    error,
    handleFailure,
  } = useApiForm<PasswordResetFormValues>({
    schema: resetSchema,
    initialValues: { jeton: token, nouveauMotDePasse: "", confirmation: "" },
    fallbackMessage: "Impossible de réinitialiser le mot de passe. Réessayez.",
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await callApi<{ message: string }>("auth/reinitialisation-mot-de-passe", {
        method: "POST",
        body: { jeton: values.jeton, nouveauMotDePasse: values.nouveauMotDePasse },
      });
      setCompleted(true);
    } catch (cause) {
      handleFailure(cause);
    }
  });

  return (
    <section className="auth-card-sre">
      <div className="auth-icon-sre">
        <KeyRound size={20} />
      </div>
      <span className="overline-sre">SÉCURITÉ DU COMPTE</span>
      <h1>Réinitialisation du mot de passe</h1>
      {completed ? (
        <>
          <p role="status">
            Votre mot de passe a été réinitialisé. Connectez-vous avec votre nouveau mot de passe.
          </p>
          <Link className="auth-back-link-sre" to={ROUTES.login}>
            <ArrowLeft size={14} /> Aller à la connexion
          </Link>
        </>
      ) : !token ? (
        <>
          <p role="alert">
            Lien de réinitialisation incomplet : aucun jeton fourni. Ouvrez le lien reçu par
            e-mail, ou demandez-en un nouveau.
          </p>
          <Link className="auth-back-link-sre" to={ROUTES.forgotPassword}>
            <ArrowLeft size={14} /> Demander un nouveau lien
          </Link>
        </>
      ) : (
        <>
          <p>Définissez votre nouveau mot de passe. Le lien est à usage unique.</p>
          <form onSubmit={onSubmit} className="form-sre" noValidate>
            <PasswordField
              label="Nouveau mot de passe"
              error={errors.nouveauMotDePasse}
              help="10 caractères minimum, avec une majuscule, une minuscule et un chiffre."
              required
              autoComplete="new-password"
              placeholder="Votre nouveau mot de passe"
              {...register("nouveauMotDePasse")}
            />
            <PasswordField
              label="Confirmer le mot de passe"
              error={errors.confirmation}
              required
              autoComplete="new-password"
              placeholder="Confirmez le mot de passe"
              {...register("confirmation")}
            />
            <FormError message={error} />
            <SubmitButton inProgress={isSubmitting} pendingLabel="Enregistrement…">
              <>
                Réinitialiser le mot de passe <ArrowRight size={16} />
              </>
            </SubmitButton>
          </form>
        </>
      )}
    </section>
  );
}
