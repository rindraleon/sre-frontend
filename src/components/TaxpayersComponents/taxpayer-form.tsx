import type { UseFormReturn } from "react-hook-form";
import { SRE_REGION } from "@/data";
import {
  FormError,
  FormStepIndicator,
  TextField,
  COMPACT_FORM_CLASS,
  FORM_GRID_CLASS,
  FORM_CLASS,
  FIELD_WIDE_CLASS,
} from "@/components";
import type { TaxpayerFormValues } from "@/schemas";
import { cn } from "@/utils";

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

type TaxpayerForm = UseFormReturn<TaxpayerFormValues>;

function IdentityStep({
  form,
  fixedType,
}: Readonly<{ form: TaxpayerForm; fixedType?: TaxpayerFormValues["type"] }>) {
  const { register, watch, formState } = form;
  const { errors } = formState;
  const profileType = watch("type");

  if (fixedType) {
    return (
      <>
        <input type="hidden" {...register("type")} />
        <TextField
          label="Type"
          required
          readOnly
          value={fixedType === "ENTREPRISE" ? "Entreprise" : "Particulier"}
          registration={register("type")}
        />
        {fixedType === "ENTREPRISE" ? (
          <>
            <TextField
              label="Raison sociale"
              error={errors.raisonSociale}
              required
              placeholder="Nom légal de l’entreprise"
              registration={register("raisonSociale")}
            />
            <TextField
              label="Nom commercial"
              error={errors.nomCommercial}
              help="Facultatif"
              placeholder="Nom utilisé par l’entreprise"
              registration={register("nomCommercial")}
            />
          </>
        ) : (
          <>
            <TextField
              label="Nom"
              error={errors.nom}
              required
              autoComplete="family-name"
              placeholder="Votre nom"
              registration={register("nom")}
            />
            <TextField
              label="Prénom"
              error={errors.prenom}
              autoComplete="given-name"
              placeholder="Votre prénom"
              registration={register("prenom")}
            />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <TextField
        label="Type"
        required
        readOnly
        value={profileType === "ENTREPRISE" ? "Entreprise" : "Particulier"}
        registration={register("type")}
      />
      {profileType === "ENTREPRISE" ? (
        <>
          <TextField
            label="Raison sociale"
            error={errors.raisonSociale}
            required
            placeholder="Nom légal de l’entreprise"
            registration={register("raisonSociale")}
          />
          <TextField
            label="Nom commercial"
            error={errors.nomCommercial}
            help="Facultatif"
            placeholder="Nom utilisé par l’entreprise"
            registration={register("nomCommercial")}
          />
        </>
      ) : (
        <>
          <TextField
            label="Nom"
            error={errors.nom}
            required
            autoComplete="family-name"
            placeholder="Votre nom"
            registration={register("nom")}
          />
          <TextField
            label="Prénom"
            error={errors.prenom}
            autoComplete="given-name"
            placeholder="Votre prénom"
            registration={register("prenom")}
          />
        </>
      )}
    </>
  );
}

function TaxIdentifierStep({ form }: Readonly<{ form: TaxpayerForm }>) {
  const { register, watch, formState } = form;
  const { errors } = formState;
  return (
    <>
      <TextField
        label="NIF"
        error={errors.nif}
        required
        placeholder="Numéro d’identification fiscale"
        registration={register("nif")}
      />
      {watch("type") === "ENTREPRISE" && (
        <>
          <TextField
            label="STAT"
            error={errors.stat}
            help="Facultatif"
            placeholder="Numéro statistique"
            registration={register("stat")}
          />
          <TextField
            label="Représentant légal"
            error={errors.representantLegal}
            help="Facultatif"
            placeholder="Nom du représentant légal"
            registration={register("representantLegal")}
          />
        </>
      )}
    </>
  );
}

function ContactStep({ form }: Readonly<{ form: TaxpayerForm }>) {
  const { register, formState } = form;
  const { errors } = formState;
  return (
    <>
      <TextField
        label="Adresse e-mail"
        type="email"
        inputMode="email"
        autoComplete="email"
        error={errors.courriel}
        required
        placeholder="nom@exemple.mg"
        registration={register("courriel")}
      />
      <TextField
        label="Téléphone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        error={errors.telephone}
        required
        placeholder="+261 …"
        registration={register("telephone")}
      />
      <TextField
        label="Adresse"
        error={errors.adresse}
        required
        autoComplete="street-address"
        placeholder="Adresse complète"
        registration={register("adresse")}
      />
      <TextField label="Région" readOnly value={SRE_REGION} registration={register("region")} />
      <TextField
        label="Ville / Commune"
        error={errors.ville}
        required
        autoComplete="address-level2"
        placeholder="Ville ou commune"
        registration={register("ville")}
      />
    </>
  );
}

export function TaxpayerFormFields({
  form,
  error,
  step,
  fixedType,
}: Readonly<{
  form: TaxpayerForm;
  error?: string;
  step: number;
  fixedType?: TaxpayerFormValues["type"];
}>) {
  const profileType = form.watch("type");
  const steps =
    profileType === "ENTREPRISE"
      ? ["Identité", "Identification", "Coordonnées"]
      : ["Identité", "Coordonnées"];
  const stepIndicator = profileType === "ENTREPRISE" || step === 0 ? step : 1;

  return (
    <div className={cn(FORM_GRID_CLASS, COMPACT_FORM_CLASS, FORM_CLASS)}>
      <FormStepIndicator step={stepIndicator} steps={steps} />
      {step === 0 && <IdentityStep form={form} fixedType={fixedType} />}
      {step === 1 && <TaxIdentifierStep form={form} />}
      {step === 2 && <ContactStep form={form} />}
      <div className={cn(FIELD_WIDE_CLASS)}>
        <FormError message={error} />
      </div>
    </div>
  );
}
