import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, KeyRound, MapPin, Building2, Phone, Store } from "lucide-react";
import { useSre } from "@/context/SreContext";
import { callApi } from "@/services/api-client";
import { useApiForm } from "@/hooks";
import { activationSchema, type ActivationFormValues } from "@/validation/auth.schema";
import {
  FormField,
  PasswordField,
  SubmitButton,
  FormError,
} from "@/components/forms/form-field";



export function ActivationForm() {
  const [rechercheParams] = useSearchParams();
  const navigation = useNavigate();
  const { notifier } = useSre();
  const jeton = rechercheParams.get("jeton") ?? "";
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    erreur,
    traiterEchec,
  } = useApiForm<ActivationFormValues>({
    schema: activationSchema,
    valeursInitiales: {
      jeton,
      nouveauMotDePasse: "",
      confirmation: "",
      adresse: "",
      ville: "",
      telephone: "",
      nomCommercial: "",
    },
    messageRepli: "Impossible de terminer l’activation. Réessayez.",
  });

  const soumettre = handleSubmit(async (valeurs) => {
    try {
      await callApi<{ message: string }>("auth/activation/confirmer", {
        method: "POST",
        body: {
          jeton: valeurs.jeton,
          nouveauMotDePasse: valeurs.nouveauMotDePasse,
          profil: {
            adresse: valeurs.adresse,
            ville: valeurs.ville,
            telephone: valeurs.telephone,
            nomCommercial: valeurs.nomCommercial ?? "",
          },
        },
      });
      notifier("Votre espace est activé. Vous pouvez vous connecter.", "succes");
      void navigation("/connexion", { replace: true });
    } catch (cause) {
      traiterEchec(cause);
    }
  });

  return (
    <>
      <h1 className="text-center">Activer votre espace entreprise</h1>
      <p className="text-center">
        Définissez votre mot de passe personnel et vérifiez les informations de votre profil.
        Le lien d’activation est à usage unique.
      </p>
      <form onSubmit={soumettre} className="formulaire-sre" noValidate>
        <PasswordField
          libelle="Nouveau mot de passe"
          erreur={errors.nouveauMotDePasse}
          aide="10 caractères minimum, avec une majuscule, une minuscule et un chiffre."
          requis
          autoComplete="new-password"
          placeholder="Votre mot de passe personnel"
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
        <FormField libelle="Adresse" erreur={errors.adresse} requis>
          {(proprietes) => (
            <span className="champ-sre champ-sre--icone">
              <MapPin size={16} aria-hidden="true" />
              <input
                {...proprietes}
                type="text"
                autoComplete="street-address"
                placeholder="Adresse complète"
                {...register("adresse")}
              />
            </span>
          )}
        </FormField>
        <FormField libelle="Ville / commune" erreur={errors.ville} requis>
          {(proprietes) => (
            <span className="champ-sre champ-sre--icone">
              <Building2 size={16} aria-hidden="true" />
              <input
                {...proprietes}
                type="text"
                autoComplete="address-level2"
                placeholder="Ville ou commune"
                {...register("ville")}
              />
            </span>
          )}
        </FormField>
        <FormField libelle="Téléphone" erreur={errors.telephone} requis>
          {(proprietes) => (
            <span className="champ-sre champ-sre--icone">
              <Phone size={16} aria-hidden="true" />
              <input
                {...proprietes}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Ex. 034 00 000 00"
                {...register("telephone")}
              />
            </span>
          )}
        </FormField>
        <FormField libelle="Nom commercial (facultatif)" erreur={errors.nomCommercial}>
          {(proprietes) => (
            <span className="champ-sre champ-sre--icone">
              <Store size={16} aria-hidden="true" />
              <input
                {...proprietes}
                type="text"
                placeholder="Nom commercial"
                {...register("nomCommercial")}
              />
            </span>
          )}
        </FormField>
        <FormError message={erreur} />
        <SubmitButton enCours={isSubmitting} libelleEnCours="Activation…">
          <>
            Activer mon espace <ArrowRight size={16} />
          </>
        </SubmitButton>
        <p className="text-center">
          <KeyRound size={13} aria-hidden="true" /> Le mot de passe provisoire reçu par courriel
          n’est plus nécessaire après cette étape.
        </p>
      </form>
    </>
  );
}
