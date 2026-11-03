import type { UseFormReturn } from "react-hook-form";
import { SRE_REGION } from "@/data";
import { FormField, FormError, FIELD_INPUT_CLASS } from "@/components";
import type { ClientProfileFormValues } from "@/schemas";

export const CONTACT_DETAILS_EMPTY: ClientProfileFormValues = {
  nif: "",
  nomCommercial: "",
  adresse: "",
  ville: "",
  telephone: "",
};

export function ClientProfileFormFields({
  form,
  error,
  isBusinessTaxpayer,
  email,
}: Readonly<{
  form: UseFormReturn<ClientProfileFormValues>;
  error?: string;
  isBusinessTaxpayer: boolean;
  email: string;
}>) {
  const {
    register,
    formState: { errors },
  } = form;
  return (
    <>
      <FormField label="NIF" error={errors.nif} required>
        {(p) => (
          <input
            {...p}
            className={FIELD_INPUT_CLASS}
            placeholder="Numéro d’identification fiscale"
            {...register("nif")}
          />
        )}
      </FormField>
      {isBusinessTaxpayer && (
        <FormField label="Nom commercial" error={errors.nomCommercial} help="Facultatif">
          {(p) => (
            <input
              {...p}
              className={FIELD_INPUT_CLASS}
              placeholder="Nom utilisé par l’entreprise"
              {...register("nomCommercial")}
            />
          )}
        </FormField>
      )}
      <FormField label="Adresse" error={errors.adresse} required>
        {(p) => (
          <input
            {...p}
            className={FIELD_INPUT_CLASS}
            autoComplete="street-address"
            placeholder="Adresse complète"
            {...register("adresse")}
          />
        )}
      </FormField>
      <FormField label="Région">
        {(p) => <input {...p} className={FIELD_INPUT_CLASS} value={SRE_REGION} readOnly />}
      </FormField>
      <FormField label="Ville / Commune" error={errors.ville} required>
        {(p) => (
          <input
            {...p}
            className={FIELD_INPUT_CLASS}
            autoComplete="address-level2"
            placeholder="Ville ou commune"
            {...register("ville")}
          />
        )}
      </FormField>
      <FormField label="Téléphone" error={errors.telephone} required>
        {(p) => (
          <input
            {...p}
            className={FIELD_INPUT_CLASS}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+261 …"
            {...register("telephone")}
          />
        )}
      </FormField>
      <FormField label="Adresse e-mail de connexion">
        {(p) => <input {...p} className={FIELD_INPUT_CLASS} value={email} readOnly />}
      </FormField>
      <FormError message={error} />
    </>
  );
}
