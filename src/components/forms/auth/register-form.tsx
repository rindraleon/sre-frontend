import { Select } from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, UserRound } from "lucide-react";
import type { RegistrationProfile } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { Button } from "@/components/ui";
import { SRE_REGION } from "@/constants";
import { createRegistrationSchema, type RegistrationFormValues } from "@/validation/auth.schema";
import { applyApiErrors, apiErrorMessage } from "@/validation/apiErrors";
import { FormField, PasswordField, SubmitButton, FormError } from "@/components/forms/form-field";

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

export function RegisterForm({ isFirstAdministrator }: Readonly<{ isFirstAdministrator: boolean }>) {
  const { register: signUp } = useAuth();
  const { notify } = useSre();
  const navigation = useNavigate();
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(createRegistrationSchema(isFirstAdministrator)),
    mode: "onTouched",
    defaultValues: EMPTY_REGISTRATION,
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = form;
  const type = watch("type");

  const steps = isFirstAdministrator
    ? [
        { label: "Identité", fields: ["nom", "prenom"] as const },
        { label: "Sécurité", fields: ["courriel", "motDePasse", "confirmation"] as const },
      ]
    : [
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
  const lastStep = step === steps.length - 1;

  const goToNextStep = async () => {
    const valid = await trigger([...steps[step].fields], { shouldFocus: true });
    if (valid) setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const onSubmit = handleSubmit(async (values) => {
    setError("");
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
      const global = applyApiErrors(form, cause);
      setError(
        global.length
          ? global.join(" ")
          : apiErrorMessage(cause, "Impossible de créer le compte. Réessayez."),
      );
    }
  });

  return (
    <form
      className="form-sre form-grid-sre compact-form-sre"
      onSubmit={onSubmit}
      noValidate
    >
      <nav
        className="registration-steps-sre field-sre-wide"
        aria-label="Progression de l’inscription"
      >
        <ol>
          {steps.map((entry, index) => (
            <li
              key={entry.label}
              aria-current={index === step ? "step" : undefined}
              className={index < step ? "step-completed-sre" : ""}
            >
              {index + 1}. {entry.label}
            </li>
          ))}
        </ol>
      </nav>

      {step === 0 && (
        <>
          {!isFirstAdministrator && (
            <fieldset className="taxpayer-type-choice-sre field-sre-wide">
              <legend>Type de contribuable</legend>
              <button
                type="button"
                aria-pressed={type === "PARTICULIER"}
                className={
                  type === "PARTICULIER"
                    ? "taxpayer-type-sre taxpayer-type-sre--active"
                    : "taxpayer-type-sre"
                }
                onClick={() => setValue("type", "PARTICULIER", { shouldValidate: true })}
              >
                <UserRound size={17} />
                <span>
                  <strong>Particulier</strong>
                  <small>Profil personnel</small>
                </span>
              </button>
              <button
                type="button"
                aria-pressed={type === "ENTREPRISE"}
                className={
                  type === "ENTREPRISE"
                    ? "taxpayer-type-sre taxpayer-type-sre--active"
                    : "taxpayer-type-sre"
                }
                onClick={() => setValue("type", "ENTREPRISE", { shouldValidate: true })}
              >
                <Building2 size={17} />
                <span>
                  <strong>Entreprise</strong>
                  <small>Profil professionnel</small>
                </span>
              </button>
            </fieldset>
          )}
          {!isFirstAdministrator && type === "ENTREPRISE" ? (
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
              <FormField label="NIF" error={errors.nif} help="Facultatif selon votre situation">
                {(p) => <input {...p} className="field-simple-sre" {...register("nif")} />}
              </FormField>
              <FormField label="STAT" error={errors.stat} help="Facultatif">
                {(p) => <input {...p} className="field-simple-sre" {...register("stat")} />}
              </FormField>
              <FormField label="Représentant légal" error={errors.representantLegal}>
                {(p) => (
                  <input {...p} className="field-simple-sre" {...register("representantLegal")} />
                )}
              </FormField>
              <FormField label="Nom du contact" error={errors.nomContact}>
                {(p) => <input {...p} className="field-simple-sre" {...register("nomContact")} />}
              </FormField>
              <FormField label="Prénom du contact" error={errors.prenomContact}>
                {(p) => (
                  <input {...p} className="field-simple-sre" {...register("prenomContact")} />
                )}
              </FormField>
              <FormField label="Fonction du contact" error={errors.fonctionContact}>
                {(p) => (
                  <input {...p} className="field-simple-sre" {...register("fonctionContact")} />
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
              {!isFirstAdministrator && (
                <FormField
                  label="NIF"
                  error={errors.nif}
                  help="Facultatif selon votre situation"
                >
                  {(p) => <input {...p} className="field-simple-sre" {...register("nif")} />}
                </FormField>
              )}
            </>
          )}
        </>
      )}

      {step === 1 && !isFirstAdministrator && (
        <>
          <FormField
            label="Adresse"
            error={errors.adresse}
            required
            className="field-sre-wide"
          >
            {(p) => (
              <input
                {...p}
                className="field-simple-sre"
                autoComplete="street-address"
                {...register("adresse")}
              />
            )}
          </FormField>
          <FormField label="Région" error={errors.region} required>
            {(p) => (
              <Select {...p} className="field-simple-sre" {...register("region")}>
                <option value={SRE_REGION}>{SRE_REGION}</option>
              </Select>
            )}
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
          <FormField
            label="Adresse e-mail"
            error={errors.courriel}
            required
            className="field-sre-wide"
          >
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
                placeholder="+261 …"
                {...register("telephone")}
              />
            )}
          </FormField>
        </>
      )}

      {lastStep && (
        <>
          {isFirstAdministrator && (
            <FormField
              label="Adresse e-mail"
              error={errors.courriel}
              required
              className="field-sre-wide"
            >
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
          )}
          <PasswordField
            label="Mot de passe"
            error={errors.motDePasse}
            help="10 caractères minimum, une majuscule, une minuscule et un chiffre."
            required
            autoComplete="new-password"
            {...register("motDePasse")}
          />
          <PasswordField
            label="Confirmer le mot de passe"
            error={errors.confirmation}
            required
            autoComplete="new-password"
            {...register("confirmation")}
          />
          <div className="field-sre-wide">
            <div className="security-note-sre">
              <CheckCircle2 size={16} />
              <p>
                <strong>Compte sécurisé par le serveur</strong>
                <span>
                  Le mot de passe est haché côté serveur; votre profil est enregistré dans la base
                  du portail SRE.
                </span>
              </p>
            </div>
          </div>
        </>
      )}

      <div className="field-sre-wide">
        <FormError message={error} />
      </div>
      <div className="form-actions-sre field-sre-wide">
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
