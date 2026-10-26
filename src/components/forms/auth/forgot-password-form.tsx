import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, KeyRound, Mail } from "lucide-react";
import { ROUTES } from "@/constants";
import { callApi } from "@/services/api-client";
import { useApiForm } from "@/hooks";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/validation/auth.schema";
import { FormField, SubmitButton, FormError } from "@/components/forms/form-field";

/** Secure reset-link request: the server always answers in the same way (no account enumeration) and sends a single. */
export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    error,
    handleFailure,
  } = useApiForm<ForgotPasswordFormValues>({
    schema: forgotPasswordSchema,
    initialValues: { courriel: "" },
    fallbackMessage: "Impossible de traiter la demande. Réessayez.",
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await callApi<{ message: string }>("auth/mot-de-passe-oublie", {
        method: "POST",
        body: { courriel: values.courriel.trim().toLowerCase() },
      });
      setSent(true);
    } catch (cause) {
      handleFailure(cause);
    }
  });

  return (
    <section className="auth-card-sre">
      <div className="auth-icon-sre">
        <KeyRound size={20} />
      </div>
      <span className="overline-sre">RÉCUPÉRATION DU COMPTE</span>
      <h1>Mot de passe oublié</h1>
      {sent ? (
        <>
          <p role="status">
            Si un compte actif correspond à cette adresse, un lien de réinitialisation vient
            d’être envoyé. Le lien est à usage unique et expire dans 24 heures.
          </p>
          <Link className="auth-back-link-sre" to={ROUTES.login}>
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </>
      ) : (
        <>
          <p>
            Saisissez l’adresse e-mail de votre compte : un lien sécurisé de réinitialisation
            vous sera envoyé.
          </p>
          <form onSubmit={onSubmit} className="form-sre" noValidate>
            <FormField label="Adresse e-mail" error={errors.courriel} required>
              {(props) => (
                <span className="field-sre field-sre--icon">
                  <Mail size={16} aria-hidden="true" />
                  <input
                    {...props}
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    placeholder="nom@exemple.mg"
                    {...register("courriel")}
                  />
                </span>
              )}
            </FormField>
            <FormError message={error} />
            <SubmitButton inProgress={isSubmitting} pendingLabel="Envoi…">
              <>
                Envoyer le lien de réinitialisation <ArrowRight size={16} />
              </>
            </SubmitButton>
          </form>
          <Link className="auth-back-link-sre" to={ROUTES.login}>
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </>
      )}
    </section>
  );
}
