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
  const [searchParams] = useSearchParams();
  const navigation = useNavigate();
  const { notify } = useSre();
  const token = searchParams.get("jeton") ?? "";
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    error,
    handleFailure,
  } = useApiForm<ActivationFormValues>({
    schema: activationSchema,
    initialValues: {
      jeton: token,
      nouveauMotDePasse: "",
      confirmation: "",
      adresse: "",
      ville: "",
      telephone: "",
      nomCommercial: "",
    },
    fallbackMessage: "Impossible de terminer l’activation. Réessayez.",
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await callApi<{ message: string }>("auth/activation/confirmer", {
        method: "POST",
        body: {
          jeton: values.jeton,
          nouveauMotDePasse: values.nouveauMotDePasse,
          profil: {
            adresse: values.adresse,
            ville: values.ville,
            telephone: values.telephone,
            nomCommercial: values.nomCommercial ?? "",
          },
        },
      });
      notify("Votre espace est activé. Vous pouvez vous connecter.", "success");
      void navigation("/connexion", { replace: true });
    } catch (cause) {
      handleFailure(cause);
    }
  });

  return (
    <>
      <h1 className="text-center">Activer votre espace entreprise</h1>
      <p className="text-center">
        Définissez votre mot de passe personnel et vérifiez les informations de votre profil.
        Le lien d’activation est à usage unique.
      </p>
      <form onSubmit={onSubmit} className="form-sre" noValidate>
        <PasswordField
          label="Nouveau mot de passe"
          error={errors.nouveauMotDePasse}
          help="10 caractères minimum, avec une majuscule, une minuscule et un chiffre."
          required
          autoComplete="new-password"
          placeholder="Votre mot de passe personnel"
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
        <FormField label="Adresse" error={errors.adresse} required>
          {(props) => (
            <span className="field-sre field-sre--icon">
              <MapPin size={16} aria-hidden="true" />
              <input
                {...props}
                type="text"
                autoComplete="street-address"
                placeholder="Adresse complète"
                {...register("adresse")}
              />
            </span>
          )}
        </FormField>
        <FormField label="Ville / commune" error={errors.ville} required>
          {(props) => (
            <span className="field-sre field-sre--icon">
              <Building2 size={16} aria-hidden="true" />
              <input
                {...props}
                type="text"
                autoComplete="address-level2"
                placeholder="Ville ou commune"
                {...register("ville")}
              />
            </span>
          )}
        </FormField>
        <FormField label="Téléphone" error={errors.telephone} required>
          {(props) => (
            <span className="field-sre field-sre--icon">
              <Phone size={16} aria-hidden="true" />
              <input
                {...props}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Ex. 034 00 000 00"
                {...register("telephone")}
              />
            </span>
          )}
        </FormField>
        <FormField label="Nom commercial (facultatif)" error={errors.nomCommercial}>
          {(props) => (
            <span className="field-sre field-sre--icon">
              <Store size={16} aria-hidden="true" />
              <input
                {...props}
                type="text"
                placeholder="Nom commercial"
                {...register("nomCommercial")}
              />
            </span>
          )}
        </FormField>
        <FormError message={error} />
        <SubmitButton inProgress={isSubmitting} pendingLabel="Activation…">
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
