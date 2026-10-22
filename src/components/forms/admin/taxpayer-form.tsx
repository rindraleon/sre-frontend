import type { UseFormReturn } from "react-hook-form";
import { Select } from "@/components/ui/select";
import { SRE_REGION } from "@/constants";
import { FormField, FormError } from "@/components/forms/form-field";
import { FormStepIndicator } from "@/components/forms/form-step-indicator";
import type { TaxpayerFormValues } from "@/validation/profile.schema";

/** Default values of the "taxpayer profile" form. */
export const PROFILE_EMPTY: TaxpayerFormValues = {
  nom: "",
  prenom: "",
  type: "PARTICULIER",
  raisonSociale: "",
  nomCommercial: "",
  nif: "",
  stat: "",
  adresse: "",
  region: SRE_REGION,
  ville: "",
  courriel: "",
  telephone: "",
  representantLegal: "",
  nomContact: "",
  prenomContact: "",
  fonctionContact: "",
};

/** Profile creation fields, organized into short steps in the modal. */
export function TaxpayerFormFields({
  form,
  error,
  step,
}: Readonly<{
  form: UseFormReturn<TaxpayerFormValues>;
  error?: string;
  step: number;
}>) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;
  const profileType = watch("type");
  const steps =
    profileType === "ENTREPRISE"
      ? ["Identité", "Identification", "Coordonnées"]
      : ["Identité", "Coordonnées"];
  const stepIndicator = profileType === "ENTREPRISE" || step === 0 ? step : 1;
  return (
    <div className="form-sre form-grid-sre compact-form-sre">
      <FormStepIndicator step={stepIndicator} steps={steps} />
      {step === 0 && (
        <>
          <FormField label="Type" error={errors.type} required>
            {(p) => (
              <Select {...p} className="field-simple-sre" {...register("type")}>
                <option value="PARTICULIER">Particulier</option>
                <option value="ENTREPRISE">Entreprise</option>
              </Select>
            )}
          </FormField>
          {profileType === "ENTREPRISE" ? (
            <>
              <FormField label="Raison sociale" error={errors.raisonSociale} required>
                {(p) => (
                  <input {...p} className="field-simple-sre" {...register("raisonSociale")} />
                )}
              </FormField>
              <FormField label="Nom commercial" error={errors.nomCommercial} help="Facultatif">
                {(p) => (
                  <input {...p} className="field-simple-sre" {...register("nomCommercial")} />
                )}
              </FormField>
            </>
          ) : (
            <>
              <FormField label="Nom" error={errors.nom} required>
                {(p) => (
                  <input
                    {...p}
                    className="field-simple-sre"
                    autoComplete="family-name"
                    {...register("nom")}
                  />
                )}
              </FormField>
              <FormField label="Prénom" error={errors.prenom}>
                {(p) => (
                  <input
                    {...p}
                    className="field-simple-sre"
                    autoComplete="given-name"
                    {...register("prenom")}
                  />
                )}
              </FormField>
            </>
          )}
        </>
      )}
      {step === 1 && (
        <>
          <FormField label="NIF" error={errors.nif} help="Facultatif">
            {(p) => <input {...p} className="field-simple-sre" {...register("nif")} />}
          </FormField>
          {profileType === "ENTREPRISE" && (
            <>
              <FormField label="STAT" error={errors.stat} help="Facultatif">
                {(p) => <input {...p} className="field-simple-sre" {...register("stat")} />}
              </FormField>
              <FormField
                label="Représentant légal"
                error={errors.representantLegal}
                help="Facultatif"
              >
                {(p) => (
                  <input {...p} className="field-simple-sre" {...register("representantLegal")} />
                )}
              </FormField>
            </>
          )}
        </>
      )}
      {step === 2 && (
        <>
          <FormField label="Adresse e-mail" error={errors.courriel} required>
            {(p) => (
              <input
                {...p}
                className="field-simple-sre"
                type="email"
                inputMode="email"
                autoComplete="email"
                {...register("courriel")}
              />
            )}
          </FormField>
          <FormField label="Téléphone" error={errors.telephone} required>
            {(p) => (
              <input
                {...p}
                className="field-simple-sre"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                {...register("telephone")}
              />
            )}
          </FormField>
          <FormField label="Adresse" error={errors.adresse} required>
            {(p) => (
              <input
                {...p}
                className="field-simple-sre"
                autoComplete="street-address"
                {...register("adresse")}
              />
            )}
          </FormField>
          <FormField label="Région">
            {(p) => <input {...p} className="field-simple-sre" value={SRE_REGION} readOnly />}
          </FormField>
          <FormField label="Ville / Commune" error={errors.ville} required>
            {(p) => (
              <input
                {...p}
                className="field-simple-sre"
                autoComplete="address-level2"
                {...register("ville")}
              />
            )}
          </FormField>
        </>
      )}
      <div className="field-sre-wide">
        <FormError message={error} />
      </div>
    </div>
  );
}
