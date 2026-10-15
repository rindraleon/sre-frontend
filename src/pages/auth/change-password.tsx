import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { Button } from "@/components/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordChangeSchema, type PasswordChangeFormValues } from "@/validation/auth.schema";
import { applyApiErrors, apiErrorMessage } from "@/validation/apiErrors";
import { PasswordField, SubmitButton, FormError } from "@/components/forms/form-field";

export function ChangePasswordPage() {
  const [erreur, definirErreur] = useState("");
  const [termine, definirTermine] = useState(false);
  const { changerMotDePasse, session } = useAuth();
  const { notifier } = useSre();
  const navigation = useNavigate();
  const formulaire = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    mode: "onTouched",
    defaultValues: { motDePasseActuel: "", nouveauMotDePasse: "", confirmation: "" },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = formulaire;

  const soumettre = handleSubmit(async (valeurs) => {
    definirErreur("");
    try {
      const reussi = await changerMotDePasse(valeurs.motDePasseActuel, valeurs.nouveauMotDePasse);
      if (!reussi) {
        formulaire.setError("motDePasseActuel", {
          type: "server",
          message: "Le mot de passe actuel est incorrect.",
        });
        return;
      }
      definirTermine(true);
      notifier("Votre mot de passe a été modifié.", "succes");
    } catch (cause) {
      const globales = applyApiErrors(formulaire, cause);
      definirErreur(
        globales.length
          ? globales.join(" ")
          : apiErrorMessage(cause, "Impossible de mettre à jour le mot de passe."),
      );
    }
  });

  return (
    <div className="page-contenu-sre">
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
    </div>
  );
}
