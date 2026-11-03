import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, KeyRound, Mail } from "lucide-react";
import { ROUTES } from "@/data";
import { requestPasswordResetApi } from "@/services/auth";
import { useApiForm } from "@/hooks";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/schemas";
import { FormField, SubmitButton, FormError, FORM_CLASS, OVERLINE_CLASS } from "@/components";
import { cn } from "@/utils";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, errors, isSubmitting, error, handleFailure } =
    useApiForm<ForgotPasswordFormValues>({
      schema: forgotPasswordSchema,
      initialValues: { courriel: "" },
      fallbackMessage: "Impossible de traiter la demande. Réessayez.",
    });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await requestPasswordResetApi(values.courriel.trim().toLowerCase());
      setSent(true);
    } catch (cause) {
      handleFailure(cause);
    }
  });

  return (
    <section className="w-[min(100%,435px)] rounded-[14px] border border-pub-border bg-pub-glass px-7 py-[26px] shadow-pub-sm">
      <div className="grid size-[39px] place-items-center rounded-[11px] bg-pub-accent-bg text-sre-teal">
        <KeyRound size={20} />
      </div>
      <span className={OVERLINE_CLASS}>RÉCUPÉRATION DU COMPTE</span>
      <h1>Mot de passe oublié</h1>
      {sent ? (
        <>
          <output>
            Si un compte actif correspond à cette adresse, un lien de réinitialisation vient d’être
            envoyé. Le lien est à usage unique et expire dans 24 heures.
          </output>
          <Link
            className="mt-[18px] flex items-center justify-center gap-[5px] text-[12px] text-pub-muted transition-colors hover:text-sre-teal"
            to={ROUTES.login}
          >
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </>
      ) : (
        <>
          <p>
            Saisissez l’adresse e-mail de votre compte : un lien sécurisé de réinitialisation vous
            sera envoyé.
          </p>
          <form onSubmit={onSubmit} className={cn(FORM_CLASS)} noValidate>
            <FormField label="Adresse e-mail" error={errors.courriel} required>
              {(props) => (
                <span className="flex min-h-[39px] items-center gap-2 rounded-[7px] border border-pub-border bg-pub-surface px-[10px] text-pub-muted [&_input]:min-h-[35px] [&_input]:border-0 [&_input]:bg-transparent [&_input]:p-0 [&_input]:outline-none [&_input]:shadow-none">
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
          <Link
            className="mt-[18px] flex items-center justify-center gap-[5px] text-[12px] text-pub-muted transition-colors hover:text-sre-teal"
            to={ROUTES.login}
          >
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </>
      )}
    </section>
  );
}
