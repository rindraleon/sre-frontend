import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, KeyRound, MapPin, Phone, Store } from "lucide-react";
import { useAuth, roleHomePath } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi } from "@/services/api-client";
import { useApiForm } from "@/hooks";
import {
  configurationInitialeSchema,
  type ConfigurationInitialeFormValues,
} from "@/validation/auth.schema";
import type { ApiTaxpayer } from "@/types";
import {
  FormField,
  PasswordField,
  SubmitButton,
  FormError,
} from "@/components/forms/form-field";

const VALEURS_VIDES: ConfigurationInitialeFormValues = {
  motDePasseActuel: "",
  nouveauMotDePasse: "",
  confirmation: "",
  adresse: "",
  ville: "",
  telephone: "",
  nomCommercial: "",
};

/**
 * Configuration initiale obligatoire (première connexion d'un compte créé par
 * l'administration) : remplacement du mot de passe provisoire (numéro STAT) et
 * validation du profil. Tant qu'elle n'est pas terminée, les fonctionnalités
 * métier restent bloquées côté serveur.
 */
export function ConfigurationInitialeForm() {
  const navigation = useNavigate();
  const { session, configurerPremiereConnexion } = useAuth();
  const { notifier } = useSre();
  const [profilCharge, definirProfilCharge] = useState(false);
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    erreur,
    traiterEchec,
    setValue,
  } = useApiForm<ConfigurationInitialeFormValues>({
    schema: configurationInitialeSchema,
    valeursInitiales: VALEURS_VIDES,
    messageRepli: "Impossible de terminer la configuration. Réessayez.",
  });

  useEffect(() => {
    let actif = true;
    const chargerProfil = async () => {
      if (!session?.jetonApi || !session.contribuableId) {
        definirProfilCharge(true);
        return;
      }
      try {
        const profil = await callApi<ApiTaxpayer>("contribuables/moi", {
          token: session.jetonApi,
        });
        if (!actif) return;
        setValue("adresse", profil.adresse ?? "");
        setValue("ville", profil.ville ?? "");
        setValue("telephone", profil.telephone ?? "");
        setValue("nomCommercial", profil.nomCommercial ?? "");
      } catch {
        // Le profil sera repris depuis les valeurs saisies par l'utilisateur.
      } finally {
        if (actif) definirProfilCharge(true);
      }
    };
    void chargerProfil();
    return () => {
      actif = false;
    };
  }, [session, setValue]);

  const soumettre = handleSubmit(async (valeurs) => {
    try {
      await configurerPremiereConnexion(
        valeurs.motDePasseActuel,
        valeurs.nouveauMotDePasse,
        session?.contribuableId
          ? {
              adresse: valeurs.adresse,
              ville: valeurs.ville,
              telephone: valeurs.telephone,
              nomCommercial: valeurs.nomCommercial ?? "",
            }
          : undefined,
      );
      notifier(
        "Configuration terminée : votre mot de passe provisoire n’est plus valable.",
        "succes",
      );
      navigation(roleHomePath(session?.role ?? "CLIENT"), { replace: true });
    } catch (cause) {
      traiterEchec(cause);
    }
  });

  return (
    <>
      <h1 className="text-center">Configuration initiale de votre espace</h1>
      <p className="text-center">
        Première connexion : remplacez le mot de passe provisoire par votre mot de passe
        personnel, puis vérifiez les informations de votre profil. Cette étape est obligatoire
        avant d’accéder aux fonctionnalités.
      </p>
      <form onSubmit={soumettre} className="formulaire-sre" noValidate>
        <PasswordField
          libelle="Mot de passe provisoire (numéro STAT reçu)"
          erreur={errors.motDePasseActuel}
          requis
          autoComplete="current-password"
          placeholder="Mot de passe provisoire"
          {...register("motDePasseActuel")}
        />
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
          libelle="Confirmer le nouveau mot de passe"
          erreur={errors.confirmation}
          requis
          autoComplete="new-password"
          placeholder="Confirmez le mot de passe"
          {...register("confirmation")}
        />
        {session?.contribuableId && (
          <>
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
            <FormField
              libelle="Nom commercial (facultatif)"
              erreur={errors.nomCommercial}
            >
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
          </>
        )}
        <FormError message={erreur} />
        <SubmitButton
          enCours={isSubmitting}
          libelleEnCours="Enregistrement…"
          disabled={!profilCharge}
        >
          <>
            Valider la configuration <ArrowRight size={16} />
          </>
        </SubmitButton>
        <p className="text-center">
          <KeyRound size={13} aria-hidden="true" /> Le mot de passe provisoire est invalidé dès
          la validation.
        </p>
      </form>
    </>
  );
}
