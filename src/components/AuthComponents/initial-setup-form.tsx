import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, KeyRound, MapPin, Phone, Store } from "lucide-react";
import { useAuth, roleHomePath } from "@/contexts";
import { useSre } from "@/contexts";
import { loadMyTaxpayerApi } from "@/services/taxpayers";
import { useApiForm } from "@/hooks";
import { initialSetupSchema, type InitialSetupFormValues } from "@/schemas";
import { FormField, PasswordField, SubmitButton, FormError, FORM_CLASS } from "@/components";
import { cn } from "@/utils";

const EMPTY_VALUES: InitialSetupFormValues = {
  motDePasseActuel: "",
  nouveauMotDePasse: "",
  confirmation: "",
  adresse: "",
  ville: "",
  telephone: "",
  nomCommercial: "",
};

export function InitialSetupForm() {
  const navigation = useNavigate();
  const { session, completeInitialSetup } = useAuth();
  const { notify } = useSre();
  const [loadedProfile, setProfilePayload] = useState(false);
  const { register, handleSubmit, errors, isSubmitting, error, handleFailure, setValue } =
    useApiForm<InitialSetupFormValues>({
      schema: initialSetupSchema,
      initialValues: EMPTY_VALUES,
      fallbackMessage: "Impossible de terminer la configuration. Réessayez.",
    });

  useEffect(() => {
    let isActive = true;
    const loadProfile = async () => {
      if (!session?.apiToken || !session.taxpayerId) {
        setProfilePayload(true);
        return;
      }
      try {
        const profile = await loadMyTaxpayerApi(session.apiToken);
        if (!isActive) return;
        setValue("adresse", profile.adresse ?? "");
        setValue("ville", profile.ville ?? "");
        setValue("telephone", profile.telephone ?? "");
        setValue("nomCommercial", profile.nomCommercial ?? "");
      } catch (cause) {
        console.warn("Profil non préchargé pour la configuration initiale.", cause);
      } finally {
        if (isActive) setProfilePayload(true);
      }
    };
    void loadProfile();
    return () => {
      isActive = false;
    };
  }, [session, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await completeInitialSetup(
        values.motDePasseActuel,
        values.nouveauMotDePasse,
        session?.taxpayerId
          ? {
              adresse: values.adresse,
              ville: values.ville,
              telephone: values.telephone,
              nomCommercial: values.nomCommercial ?? "",
            }
          : undefined,
      );
      notify(
        "Configuration terminée : votre mot de passe provisoire n’est plus valable.",
        "success",
      );
      navigation(roleHomePath(session?.role ?? "CLIENT"), { replace: true });
    } catch (cause) {
      handleFailure(cause);
    }
  });

  return (
    <>
      <h1 className="text-center">Configuration initiale de votre espace</h1>
      <p className="text-center">
        Première connexion : remplacez le mot de passe provisoire par votre mot de passe personnel,
        puis vérifiez les informations de votre profil. Cette étape est obligatoire avant d’accéder
        aux fonctionnalités.
      </p>
      <form onSubmit={onSubmit} className={cn(FORM_CLASS)} noValidate>
        <PasswordField
          label="Mot de passe provisoire (numéro STAT reçu)"
          error={errors.motDePasseActuel}
          required
          autoComplete="current-password"
          placeholder="Mot de passe provisoire"
          {...register("motDePasseActuel")}
        />
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
          label="Confirmer le nouveau mot de passe"
          error={errors.confirmation}
          required
          autoComplete="new-password"
          placeholder="Confirmez le mot de passe"
          {...register("confirmation")}
        />
        {session?.taxpayerId && (
          <>
            <FormField label="Adresse" error={errors.adresse} required>
              {(props) => (
                <span className="flex min-h-[39px] items-center gap-2 rounded-[7px] border border-pub-border bg-pub-surface px-[10px] text-pub-muted [&_input]:min-h-[35px] [&_input]:border-0 [&_input]:bg-transparent [&_input]:p-0 [&_input]:outline-none [&_input]:shadow-none">
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
                <span className="flex min-h-[39px] items-center gap-2 rounded-[7px] border border-pub-border bg-pub-surface px-[10px] text-pub-muted [&_input]:min-h-[35px] [&_input]:border-0 [&_input]:bg-transparent [&_input]:p-0 [&_input]:outline-none [&_input]:shadow-none">
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
                <span className="flex min-h-[39px] items-center gap-2 rounded-[7px] border border-pub-border bg-pub-surface px-[10px] text-pub-muted [&_input]:min-h-[35px] [&_input]:border-0 [&_input]:bg-transparent [&_input]:p-0 [&_input]:outline-none [&_input]:shadow-none">
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
                <span className="flex min-h-[39px] items-center gap-2 rounded-[7px] border border-pub-border bg-pub-surface px-[10px] text-pub-muted [&_input]:min-h-[35px] [&_input]:border-0 [&_input]:bg-transparent [&_input]:p-0 [&_input]:outline-none [&_input]:shadow-none">
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
          </>
        )}
        <FormError message={error} />
        <SubmitButton
          inProgress={isSubmitting}
          pendingLabel="Enregistrement…"
          disabled={!loadedProfile}
        >
          <>
            Valider la configuration <ArrowRight size={16} />
          </>
        </SubmitButton>
        <p className="text-center">
          <KeyRound size={13} aria-hidden="true" /> Le mot de passe provisoire est invalidé dès la
          validation.
        </p>
      </form>
    </>
  );
}
