import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import { ROUTES } from "@/data";
import { resetPasswordApi } from "@/services/auth";
import { useApiForm } from "@/hooks";
import { resetSchema, type PasswordResetFormValues } from "@/schemas";
import { PasswordField, SubmitButton, FormError, FORM_CLASS, OVERLINE_CLASS } from "@/components";
import { cn } from "@/utils";

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("jeton") ?? "";
  const [completed, setCompleted] = useState(false);
  const { register, handleSubmit, errors, isSubmitting, error, handleFailure } =
    useApiForm<PasswordResetFormValues>({
      schema: resetSchema,
      initialValues: { jeton: token, nouveauMotDePasse: "", confirmation: "" },
      fallbackMessage: "Impossible de réinitialiser le mot de passe. Réessayez.",
    });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await resetPasswordApi(values.jeton, values.nouveauMotDePasse);
      setCompleted(true);
    } catch (cause) {
      handleFailure(cause);
    }
  });

  return (
    <section className="w-[min(100%,435px)] rounded-[14px] border border-pub-border bg-pub-glass px-7 py-[26px] shadow-pub-sm">
      <div className="grid size-[39px] place-items-center rounded-[11px] bg-pub-accent-bg text-sre-teal">
        <KeyRound size={20} />
      </div>
      <span className={OVERLINE_CLASS}>SÉCURITÉ DU COMPTE</span>
      <h1>Réinitialisation du mot de passe</h1>
      {completed ? (
        <>
          <p role="status">
            Votre mot de passe a été réinitialisé. Connectez-vous avec votre nouveau mot de passe.
          </p>
          <Link
            className="mt-[18px] flex items-center justify-center gap-[5px] text-[12px] text-pub-muted transition-colors hover:text-sre-teal"
            to={ROUTES.login}
          >
            <ArrowLeft size={14} /> Aller à la connexion
          </Link>
        </>
      ) : !token ? (
        <>
          <p role="alert">
            Lien de réinitialisation incomplet : aucun jeton fourni. Ouvrez le lien reçu par e-mail,
            ou demandez-en un nouveau.
          </p>
          <Link
            className="mt-[18px] flex items-center justify-center gap-[5px] text-[12px] text-pub-muted transition-colors hover:text-sre-teal"
            to={ROUTES.forgotPassword}
          >
            <ArrowLeft size={14} /> Demander un nouveau lien
          </Link>
        </>
      ) : (
        <>
          <p>Définissez votre nouveau mot de passe. Le lien est à usage unique.</p>
          <form onSubmit={onSubmit} className={cn(FORM_CLASS)} noValidate>
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
