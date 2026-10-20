import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import { ROUTES } from "@/constants";
import { callApi } from "@/services/api-client";
import { useApiForm } from "@/hooks";
import {
  reinitialisationSchema,
  type ReinitialisationFormValues,
} from "@/validation/auth.schema";
import { PasswordField, SubmitButton, FormError } from "@/components/forms/form-field";

/**
 * Réinitialisation via le jeton à usage unique reçu par courriel
 * (`/reinitialisation-mot-de-passe?jeton=…`). Le jeton est validé par le
 * serveur (expiration, usage unique) avant toute modification.
 */
export function ResetPasswordForm() {
  const [rechercheParams] = useSearchParams();
  const jeton = rechercheParams.get("jeton") ?? "";
  const [termine, definirTermine] = useState(false);
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    erreur,
    traiterEchec,
  } = useApiForm<ReinitialisationFormValues>({
    schema: reinitialisationSchema,
    valeursInitiales: { jeton, nouveauMotDePasse: "", confirmation: "" },
    messageRepli: "Impossible de réinitialiser le mot de passe. Réessayez.",
  });

  const soumettre = handleSubmit(async (valeurs) => {
    try {
      await callApi<{ message: string }>("auth/reinitialisation-mot-de-passe", {
        method: "POST",
        body: { jeton: valeurs.jeton, nouveauMotDePasse: valeurs.nouveauMotDePasse },
      });
      definirTermine(true);
    } catch (cause) {
      traiterEchec(cause);
    }
  });

  return (
    <section className="auth-carte-sre">
      <div className="auth-icone-sre">
        <KeyRound size={20} />
      </div>
      <span className="sur-titre-sre">SÉCURITÉ DU COMPTE</span>
      <h1>Réinitialisation du mot de passe</h1>
      {termine ? (
        <>
          <p role="status">
            Votre mot de passe a été réinitialisé. Connectez-vous avec votre nouveau mot de passe.
          </p>
          <Link className="lien-retour-auth-sre" to={ROUTES.connexion}>
            <ArrowLeft size={14} /> Aller à la connexion
          </Link>
        </>
      ) : !jeton ? (
        <>
          <p role="alert">
            Lien de réinitialisation incomplet : aucun jeton fourni. Ouvrez le lien reçu par
            e-mail, ou demandez-en un nouveau.
          </p>
          <Link className="lien-retour-auth-sre" to={ROUTES.motDePasseOublie}>
            <ArrowLeft size={14} /> Demander un nouveau lien
          </Link>
        </>
      ) : (
        <>
          <p>Définissez votre nouveau mot de passe. Le lien est à usage unique.</p>
          <form onSubmit={soumettre} className="formulaire-sre" noValidate>
            <PasswordField
              libelle="Nouveau mot de passe"
              erreur={errors.nouveauMotDePasse}
              aide="10 caractères minimum, avec une majuscule, une minuscule et un chiffre."
              requis
              autoComplete="new-password"
              placeholder="Votre nouveau mot de passe"
              {...register("nouveauMotDePasse")}
            />
            <PasswordField
              libelle="Confirmer le mot de passe"
              erreur={errors.confirmation}
              requis
              autoComplete="new-password"
              placeholder="Confirmez le mot de passe"
              {...register("confirmation")}
            />
            <FormError message={erreur} />
            <SubmitButton enCours={isSubmitting} libelleEnCours="Enregistrement…">
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
