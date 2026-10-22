import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { Button } from "@/components/ui";
import { useApiForm } from "@/hooks";
import { passwordChangeSchema, type PasswordChangeFormValues } from "@/validation/auth.schema";
import { PasswordField, SubmitButton, FormError } from "@/components/forms/form-field";

export const CHANGE_PASSWORD_EMPTY: PasswordChangeFormValues = {
  motDePasseActuel: "",
  nouveauMotDePasse: "",
  confirmation: "",
};

export function ChangePasswordForm() {
  const [completed, setCompleted] = useState(false);
  const { changePassword, session } = useAuth();
  const { notify } = useSre();
  const navigation = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    errors,
    isSubmitting,
    error,
    resetError,
    handleFailure,
  } = useApiForm<PasswordChangeFormValues>({
    schema: passwordChangeSchema,
    initialValues: CHANGE_PASSWORD_EMPTY,
    fallbackMessage: "Impossible de mettre à jour le mot de passe.",
  });

  const onSubmit = handleSubmit(async (values) => {
    resetError();
    try {
      const reussi = await changePassword(values.motDePasseActuel, values.nouveauMotDePasse);
      if (!reussi) {
        setError("motDePasseActuel", {
          type: "server",
          message: "Le mot de passe actuel est incorrect.",
        });
        return;
      }
      setCompleted(true);
      notify("Votre mot de passe a été modifié.", "success");
    } catch (cause) {
      handleFailure(cause);
    }
  });

  return (
    <section className="card-sre password-change-sre">
      <span className="auth-icon-sre">
        <KeyRound size={20} />
      </span>
      <span className="overline-sre">SÉCURITÉ DU COMPTE</span>
      <h1>
        {session?.mustChangePassword
          ? "Première connexion : changez le mot de passe"
          : "Changer mon mot de passe"}
      </h1>
      <p>
        {session?.mustChangePassword
          ? "Votre compte exige un changement de mot de passe. Choisissez un nouveau mot de passe avant de continuer."
          : "Le nouveau mot de passe sera vérifié et enregistré par le serveur."}
      </p>
      {!completed ? (
        <form className="form-sre" onSubmit={onSubmit} noValidate>
          <PasswordField
            label="Mot de passe temporaire ou actuel"
            error={errors.motDePasseActuel}
            required
            autoComplete="current-password"
            {...register("motDePasseActuel")}
          />
          <PasswordField
            label="Nouveau mot de passe"
            error={errors.nouveauMotDePasse}
            help="10 caractères minimum, une majuscule, une minuscule et un chiffre."
            required
            autoComplete="new-password"
            {...register("nouveauMotDePasse")}
          />
          <PasswordField
            label="Confirmer le nouveau mot de passe"
            error={errors.confirmation}
            required
            autoComplete="new-password"
            {...register("confirmation")}
          />
          <FormError message={error} />
          <SubmitButton inProgress={isSubmitting} pendingLabel="Mise à jour…">
            Mettre à jour <ArrowRight size={15} />
          </SubmitButton>
        </form>
      ) : (
        <Button onClick={() => navigation(session?.role === "ADMIN" ? "/admin" : "/client")}>
          Continuer vers mon espace <ArrowRight size={15} />
        </Button>
      )}
    </section>
  );
}
