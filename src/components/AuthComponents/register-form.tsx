import { cn } from "@/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, UserRound } from "lucide-react";
import type { RegistrationProfile } from "@/types";
import { useAuth , useSre } from "@/contexts";
import {
  Button,
  COMPACT_FORM_CLASS,
  FIELD_SELECT_CLASS,
  FORM_ACTIONS_CLASS,
  FORM_CLASS,
  FormError,
  FormField,
  PasswordField,
  REGISTRATION_STEPS_CLASS,
  STEP_COMPLETED_CLASS,
  SubmitButton,
  TextField,
} from "@/components";
import { SRE_REGION } from "@/data";
import { useApiForm } from "@/hooks";
import { createRegistrationSchema, type RegistrationFormValues } from "@/schemas";
import type { UseApiFormResult } from "@/hooks";

export const EMPTY_REGISTRATION: RegistrationFormValues = {
  type: "PARTICULIER",
  nom: "",
  prenom: "",
  raisonSociale: "",
  nomCommercial: "",
  nif: "",
  stat: "",
  representantLegal: "",
  nomContact: "",
  prenomContact: "",
  fonctionContact: "",
  adresse: "",
  region: SRE_REGION,
  ville: "",
  courriel: "",
  telephone: "",
  motDePasse: "",
  confirmation: "",
};

type RegistrationForm = UseApiFormResult<RegistrationFormValues>;

function buildSteps(isFirstAdministrator: boolean) {
  if (isFirstAdministrator) {
    return [
      { label: "Identité", fields: ["nom", "prenom"] as const },
      { label: "Sécurité", fields: ["courriel", "motDePasse", "confirmation"] as const },
    ];
  }
  return [
    {
      label: "Profil",
      fields: [
        "nom",
        "prenom",
        "raisonSociale",
        "nomCommercial",
        "nif",
        "stat",
        "representantLegal",
        "nomContact",
        "prenomContact",
        "fonctionContact",
      ] as const,
    },
    { label: "Coordonnées", fields: ["adresse", "ville", "courriel", "telephone"] as const },
    { label: "Sécurité", fields: ["motDePasse", "confirmation"] as const },
  ];
}

function TaxpayerTypeChoice({ form }: Readonly<{ form: RegistrationForm }>) {
  const type = form.watch("type");
  return (
    <fieldset className="flex flex-wrap gap-2 border-0 p-0 m-0 [&_legend]:mb-0.5 [&_legend]:w-full [&_legend]:text-[11px] [&_legend]:font-bold [&_legend]:text-pub-muted md:col-span-2">
      <legend>Type de contribuable</legend>
      {(
        [
          { value: "PARTICULIER", label: "Particulier", hint: "Profil personnel", Icon: UserRound },
          {
            value: "ENTREPRISE",
            label: "Entreprise",
            hint: "Profil professionnel",
            Icon: Building2,
          },
        ] as const
      ).map(({ value, label, hint, Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={type === value}
          className={
            type === value
              ? "flex min-w-[145px] cursor-pointer items-center gap-2 rounded-lg border border-pub-border-accent bg-pub-surface-soft px-[11px] py-[9px] text-left text-sre-teal [&>span]:flex [&>span]:flex-col [&>span]:gap-[3px] [&_strong]:text-[12px] [&_strong]:text-pub-accent-strong [&_small]:text-[11px] [&_small]:text-pub-faint"
              : "flex min-w-[145px] cursor-pointer items-center gap-2 rounded-lg border border-pub-border bg-pub-surface px-[11px] py-[9px] text-left text-pub-muted [&>span]:flex [&>span]:flex-col [&>span]:gap-[3px] [&_strong]:text-[12px] [&_strong]:text-pub-body-strong [&_small]:text-[11px] [&_small]:text-pub-faint"
          }
          onClick={() => form.setValue("type", value, { shouldValidate: true })}
        >
          <Icon size={17} />
          <span>
            <strong>{label}</strong>
            <small>{hint}</small>
          </span>
        </button>
      ))}
    </fieldset>
  );
}

function ProfileStep({
  form,
  isFirstAdministrator,
}: Readonly<{ form: RegistrationForm; isFirstAdministrator: boolean }>) {
  const { errors, register } = form;
  const isBusiness = form.watch("type") === "ENTREPRISE";

  return (
    <>
      {!isFirstAdministrator && <TaxpayerTypeChoice form={form} />}
      {!isFirstAdministrator && isBusiness ? (
        <>
          <TextField
            label="Raison sociale"
            error={errors.raisonSociale}
            required
            className="md:col-span-2"
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
          <TextField
            label="NIF"
            error={errors.nif}
            required
            placeholder="Numéro d’identification fiscale"
            registration={register("nif")}
          />
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
            placeholder="Nom du représentant légal"
            registration={register("representantLegal")}
          />
          <TextField
            label="Nom du contact"
            error={errors.nomContact}
            placeholder="Nom du contact"
            registration={register("nomContact")}
          />
          <TextField
            label="Prénom du contact"
            error={errors.prenomContact}
            placeholder="Prénom du contact"
            registration={register("prenomContact")}
          />
          <TextField
            label="Fonction du contact"
            error={errors.fonctionContact}
            placeholder="Ex. Directeur administratif"
            registration={register("fonctionContact")}
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
          {!isFirstAdministrator && (
            <TextField
              label="NIF"
              error={errors.nif}
              required
              placeholder="Numéro d’identification fiscale"
              registration={register("nif")}
            />
          )}
        </>
      )}
    </>
  );
}

function ContactStep({ form }: Readonly<{ form: RegistrationForm }>) {
  const { errors, register } = form;
  return (
    <>
      <TextField
        label="Adresse"
        error={errors.adresse}
        className="md:col-span-2"
        required
        autoComplete="street-address"
        placeholder="Adresse complète"
        registration={register("adresse")}
      />
      <FormField label="Région" error={errors.region} required>
        {(field) => (
          <select {...field} className={FIELD_SELECT_CLASS} {...register("region")}>
            <option value={SRE_REGION}>{SRE_REGION}</option>
          </select>
        )}
      </FormField>
      <TextField
        label="Ville / Commune"
        error={errors.ville}
        required
        autoComplete="address-level2"
        placeholder="Ville ou commune"
        registration={register("ville")}
      />
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
    </>
  );
}

function SecurityStep({
  form,
  isFirstAdministrator,
}: Readonly<{ form: RegistrationForm; isFirstAdministrator: boolean }>) {
  const { errors, register } = form;
  return (
    <>
      {isFirstAdministrator && (
        <TextField
          label="Adresse e-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          error={errors.courriel}
          required
          className="md:col-span-2"
          placeholder="nom@exemple.mg"
          registration={register("courriel")}
        />
      )}
      <PasswordField
        label="Mot de passe"
        error={errors.motDePasse}
        help="10 caractères minimum, une majuscule, une minuscule et un chiffre."
        required
        autoComplete="new-password"
        placeholder="Votre mot de passe"
        {...register("motDePasse")}
      />
      <PasswordField
        label="Confirmer le mot de passe"
        error={errors.confirmation}
        required
        autoComplete="new-password"
        placeholder="Confirmez le mot de passe"
        {...register("confirmation")}
      />
      <div className="md:col-span-2">
        <div className="mt-[15px]">
          <CheckCircle2 size={16} />
          <p>
            <strong>Compte sécurisé par le serveur</strong>
            <span>
              Le mot de passe est haché côté serveur; votre profil est enregistré dans la base du
              portail SRE.
            </span>
          </p>
        </div>
      </div>
    </>
  );
}

export function RegisterForm({
  isFirstAdministrator,
}: Readonly<{ isFirstAdministrator: boolean }>) {
  const { register: signUp } = useAuth();
  const { notify } = useSre();
  const navigation = useNavigate();
  const [step, setStep] = useState(0);

  const form = useApiForm<RegistrationFormValues>({
    schema: createRegistrationSchema(isFirstAdministrator),
    initialValues: EMPTY_REGISTRATION,
    fallbackMessage: "Impossible de créer le compte. Réessayez.",
  });
  const { handleSubmit, trigger, error, isSubmitting, handleFailure } = form;

  const steps = buildSteps(isFirstAdministrator);
  const lastStep = step === steps.length - 1;

  const goToNextStep = async () => {
    const valid = await trigger([...steps[step].fields], { shouldFocus: true });
    if (valid) setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { motDePasse: password, confirmation: _confirmation, ...profileValues } = values;
      const profileData: RegistrationProfile = isFirstAdministrator
        ? {
            ...profileValues,
            type: "PARTICULIER",
            raisonSociale: undefined,
            nif: "",
            adresse: "",
            ville: "",
            region: "",
          }
        : profileValues;
      const result = await signUp(profileData, password);
      notify(
        result.role === "ADMIN"
          ? "Premier compte administrateur créé."
          : "Compte contribuable créé sur le serveur.",
        "success",
      );
      void navigation(result.role === "ADMIN" ? "/admin" : "/client", { replace: true });
    } catch (cause) {
      handleFailure(cause);
    }
  });

  return (
    <form
      className={cn(
        COMPACT_FORM_CLASS,
        FORM_CLASS,
        "!grid w-full grid-cols-1 items-start md:grid-cols-2 md:!gap-x-4",
      )}
      onSubmit={onSubmit}
      noValidate
    >
      <nav
        className={cn(REGISTRATION_STEPS_CLASS, "md:col-span-2")}
        aria-label="Progression de l’inscription"
      >
        <ol>
          {steps.map((entry, index) => (
            <li
              key={entry.label}
              aria-current={index === step ? "step" : undefined}
              className={index < step ? STEP_COMPLETED_CLASS : undefined}
            >
              {index + 1}. {entry.label}
            </li>
          ))}
        </ol>
      </nav>

      {step === 0 && <ProfileStep form={form} isFirstAdministrator={isFirstAdministrator} />}
      {step === 1 && !isFirstAdministrator && <ContactStep form={form} />}
      {lastStep && <SecurityStep form={form} isFirstAdministrator={isFirstAdministrator} />}

      <div className="md:col-span-2">
        <FormError message={error} />
      </div>
      <div className={cn(FORM_ACTIONS_CLASS, "md:col-span-2")}>
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => setStep((current) => Math.max(0, current - 1))}
          >
            <ArrowLeft size={15} /> Précédent
          </Button>
        )}
        {!lastStep ? (
          <Button type="button" onClick={() => void goToNextStep()}>
            Suivant <ArrowRight size={16} />
          </Button>
        ) : (
          <SubmitButton inProgress={isSubmitting} pendingLabel="Création du compte…">
            {isFirstAdministrator
              ? "Initialiser l’administration"
              : "Créer mon compte contribuable"}{" "}
            <ArrowRight size={16} />
          </SubmitButton>
        )}
      </div>
    </form>
  );
}
