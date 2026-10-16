import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { Button } from "@/components/ui";
import { useApiForm } from "@/hooks";
import { passwordChangeSchema, type PasswordChangeFormValues } from "@/validation/auth.schema";
import { PasswordField, SubmitButton, FormError } from "@/components/forms/form-field";

export const CHANGE_PASSWORD_VIDE: PasswordChangeFormValues = {
  motDePasseActuel: "",
  nouveauMotDePasse: "",
  confirmation: "",
};

export function ChangePasswordForm() {
  const [termine, definirTermine] = useState(false);
  const { changerMotDePasse, session } = useAuth();
  const { notifier } = useSre();
  const navigation = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    errors,
    isSubmitting,
    erreur,
    reinitialiserErreur,
    traiterEchec,
  } = useApiForm<PasswordChangeFormValues>({
    schema: passwordChangeSchema,
    valeursInitiales: CHANGE_PASSWORD_VIDE,
    messageRepli: "Impossible de mettre à jour le mot de passe.",
  });

  const soumettre = handleSubmit(async (valeurs) => {
    reinitialiserErreur();
    try {
      const reussi = await changerMotDePasse(valeurs.motDePasseActuel, valeurs.nouveauMotDePasse);
      if (!reussi) {
        setError("motDePasseActuel", {
          type: "server",
          message: "Le mot de passe actuel est incorrect.",
        });
        return;
      }
      definirTermine(true);
      notifier("Votre mot de passe a été modifié.", "succes");
    } catch (cause) {
      traiterEchec(cause);
    }
  });

  return (
    <section className="carte-sre changement-mdp-sre">
      <span className="auth-icone-sre">
        <KeyRound size={20} />
      </span>
      <span className="sur-titre-sre">SÉCURITÉ DU COMPTE</span>
      <h1>
        {session?.changementMotDePasseRequis
          ? "Première connexion : changez le mot de passe"
          : "Changer mon mot de passe"}
      </h1>
      <p>
        {session?.changementMotDePasseRequis
          ? "Votre compte exige un changement de mot de passe. Choisissez un nouveau mot de passe avant de continuer."
          : "Le nouveau mot de passe sera vérifié et enregistré par le serveur."}
      </p>
      {!termine ? (
        <form className="formulaire-sre" onSubmit={soumettre} noValidate>
          <PasswordField
            libelle="Mot de passe temporaire ou actuel"
            erreur={errors.motDePasseActuel}
            requis
            autoComplete="current-password"
            {...register("motDePasseActuel")}
          />
          <PasswordField
            libelle="Nouveau mot de passe"
            erreur={errors.nouveauMotDePasse}
            aide="10 caractères minimum, une majuscule, une minuscule et un chiffre."
            requis
            autoComplete="new-password"
            {...register("nouveauMotDePasse")}
          />
          <PasswordField
            libelle="Confirmer le nouveau mot de passe"
            erreur={errors.confirmation}
            requis
            autoComplete="new-password"
            {...register("confirmation")}
          />
          <FormError message={erreur} />
          <SubmitButton enCours={isSubmitting} libelleEnCours="Mise à jour…">
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
