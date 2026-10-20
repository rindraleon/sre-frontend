import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, KeyRound, Mail } from "lucide-react";
import { ROUTES } from "@/constants";
import { callApi } from "@/services/api-client";
import { useApiForm } from "@/hooks";
import {
  motDePasseOublieSchema,
  type MotDePasseOublieFormValues,
} from "@/validation/auth.schema";
import { FormField, SubmitButton, FormError } from "@/components/forms/form-field";

/**
 * Demande de lien sécurisé de réinitialisation : le serveur répond toujours de
 * la même façon (aucune énumération de comptes) et envoie un jeton à usage
 * unique valable 24 heures si un compte actif correspond.
 */
export function ForgotPasswordForm() {
  const [envoye, definirEnvoye] = useState(false);
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    erreur,
    traiterEchec,
  } = useApiForm<MotDePasseOublieFormValues>({
    schema: motDePasseOublieSchema,
    valeursInitiales: { courriel: "" },
    messageRepli: "Impossible de traiter la demande. Réessayez.",
  });

  const soumettre = handleSubmit(async (valeurs) => {
    try {
      await callApi<{ message: string }>("auth/mot-de-passe-oublie", {
        method: "POST",
        body: { courriel: valeurs.courriel.trim().toLowerCase() },
      });
      definirEnvoye(true);
    } catch (cause) {
      traiterEchec(cause);
    }
  });

  return (
    <section className="auth-carte-sre">
      <div className="auth-icone-sre">
        <KeyRound size={20} />
      </div>
      <span className="sur-titre-sre">RÉCUPÉRATION DU COMPTE</span>
      <h1>Mot de passe oublié</h1>
      {envoye ? (
        <>
          <p role="status">
            Si un compte actif correspond à cette adresse, un lien de réinitialisation vient
            d’être envoyé. Le lien est à usage unique et expire dans 24 heures.
          </p>
          <Link className="lien-retour-auth-sre" to={ROUTES.connexion}>
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </>
      ) : (
        <>
          <p>
            Saisissez l’adresse e-mail de votre compte : un lien sécurisé de réinitialisation
            vous sera envoyé.
          </p>
          <form onSubmit={soumettre} className="formulaire-sre" noValidate>
            <FormField libelle="Adresse e-mail" erreur={errors.courriel} requis>
              {(proprietes) => (
                <span className="champ-sre champ-sre--icone">
                  <Mail size={16} aria-hidden="true" />
                  <input
                    {...proprietes}
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    placeholder="nom@exemple.mg"
                    {...register("courriel")}
                  />
                </span>
              )}
            </FormField>
            <FormError message={erreur} />
            <SubmitButton enCours={isSubmitting} libelleEnCours="Envoi…">
              <>
                Envoyer le lien de réinitialisation <ArrowRight size={16} />
              </>
            </SubmitButton>
          </form>
          <Link className="lien-retour-auth-sre" to={ROUTES.connexion}>
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </>
      )}
    </section>
  );
}
