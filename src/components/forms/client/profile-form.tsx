import type { UseFormReturn } from "react-hook-form";
import { SRE_REGION } from "@/constants";
import { FormField, FormError } from "@/components/forms/form-field";
import type { ClientProfileFormValues } from "@/validation/profile.schema";

/** Valeurs par défaut du formulaire des coordonnées du profil client. */
export const COORDONNEES_VIDES: ClientProfileFormValues = {
  nomCommercial: "",
  adresse: "",
  ville: "",
  telephone: "",
};

/** Champs du formulaire des coordonnées client (sans le <form> ni sa soumission). */
export function ClientProfileFormFields({
  formulaire,
  erreur,
  estEntreprise,
  courriel,
}: Readonly<{
  formulaire: UseFormReturn<ClientProfileFormValues>;
  erreur?: string;
  estEntreprise: boolean;
  courriel: string;
}>) {
  const {
    register,
    formState: { errors },
  } = formulaire;
  return (
    <>
      {estEntreprise && (
        <FormField libelle="Nom commercial" erreur={errors.nomCommercial} aide="Facultatif">
          {(p) => <input {...p} className="champ-simple-sre" {...register("nomCommercial")} />}
        </FormField>
      )}
      <FormField libelle="Adresse" erreur={errors.adresse} requis>
        {(p) => (
          <input
            {...p}
            className="champ-simple-sre"
            autoComplete="street-address"
            {...register("adresse")}
          />
        )}
      </FormField>
      <FormField libelle="Région">
        {(p) => <input {...p} className="champ-simple-sre" value={SRE_REGION} readOnly />}
      </FormField>
      <FormField libelle="Ville / Commune" erreur={errors.ville} requis>
        {(p) => (
          <input
            {...p}
            className="champ-simple-sre"
            autoComplete="address-level2"
            {...register("ville")}
          />
        )}
      </FormField>
      <FormField libelle="Téléphone" erreur={errors.telephone} requis>
        {(p) => (
          <input
            {...p}
            className="champ-simple-sre"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            {...register("telephone")}
          />
        )}
      </FormField>
      <FormField libelle="Adresse e-mail de connexion">
        {(p) => <input {...p} className="champ-simple-sre" value={courriel} readOnly />}
      </FormField>
      <FormError message={erreur} />
    </>
  );
}
