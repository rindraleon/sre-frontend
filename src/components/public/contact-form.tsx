import { useState } from "react";
import { ArrowRight, CheckCircle2, Mail, Send, UserRound } from "lucide-react";
import { FormError, FormField, SubmitButton } from "@/components/forms/form-field";
import { useApiForm } from "@/hooks";
import { callApi, isApiConfigured } from "@/services/api-client";
import { publicContactSchema, type PublicContactFormValues } from "@/validation/auth.schema";

interface ConfirmationContact {
  statut: "ENVOYE" | "CAPTURE";
  message: string;
}

const EMPTY_VALUES: PublicContactFormValues = {
  nom: "",
  courriel: "",
  sujet: "",
  message: "",
  siteWeb: "",
};

/** Public contact form: single column, no internal scrolling. */
export function PublicContactForm() {
  const [confirmation, setConfirmation] = useState<ConfirmationContact | null>(null);
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    error,
    handleFailure,
    resetForm,
  } = useApiForm<PublicContactFormValues>({
    schema: publicContactSchema,
    initialValues: EMPTY_VALUES,
    fallbackMessage: "Impossible de transmettre votre message. Réessayez plus tard.",
  });

  const onSubmit = handleSubmit(async (values) => {
    setConfirmation(null);
    try {
      const result = await callApi<ConfirmationContact>("contact", {
        method: "POST",
        body: {
          nom: values.nom.trim(),
          courriel: values.courriel.trim().toLowerCase(),
          sujet: values.sujet.trim(),
          message: values.message.trim(),
          siteWeb: values.siteWeb ?? "",
        },
      });
      setConfirmation(result);
    } catch (cause) {
      handleFailure(cause);
    }
  });

  if (confirmation) {
    return (
      <div
        className={`contact-confirmation-sre ${confirmation.statut === "CAPTURE" ? "contact-confirmation-sre--test" : ""}`}
        role="status"
        aria-live="polite"
      >
        <span className="contact-confirmation-sre__icon">
          <CheckCircle2 size={22} aria-hidden="true" />
        </span>
        <strong>
          {confirmation.statut === "CAPTURE"
            ? "Message reçu en mode test"
            : "Message transmis à l’administration"}
        </strong>
        <p>{confirmation.message}</p>
        <button
          type="button"
          className="contact-link-sre"
          onClick={() => {
            setConfirmation(null);
            resetForm(EMPTY_VALUES);
          }}
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form-sre" onSubmit={onSubmit} noValidate>
      <div className="contact-form-header-sre">
        <span className="contact-form-header-sre__icon">
          <Send size={17} aria-hidden="true" />
        </span>
        <div>
          <strong>Écrire à l’administration</strong>
          <small>Les champs marqués * sont obligatoires.</small>
        </div>
      </div>

      <FormField label="Nom" error={errors.nom} required>
        {(props) => (
          <span className="field-sre field-sre--icon">
            <UserRound size={16} aria-hidden="true" />
            <input
              {...props}
              type="text"
              autoComplete="name"
              maxLength={120}
              placeholder="Votre nom"
              {...register("nom")}
            />
          </span>
        )}
      </FormField>

      <FormField label="Adresse e-mail" error={errors.courriel} required>
        {(props) => (
          <span className="field-sre field-sre--icon">
            <Mail size={16} aria-hidden="true" />
            <input
              {...props}
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={254}
              placeholder="nom@exemple.mg"
              {...register("courriel")}
            />
          </span>
        )}
      </FormField>

      <FormField label="Sujet" error={errors.sujet} required>
        {(props) => (
          <input
            {...props}
            className="field-simple-sre"
            type="text"
            maxLength={140}
            placeholder="Objet de votre demande"
            {...register("sujet")}
          />
        )}
      </FormField>

      <FormField
        label="Votre message"
        error={errors.message}
        help="N’incluez pas de mot de passe ni de données bancaires."
        required
      >
        {(props) => (
          <textarea
            {...props}
            className="field-simple-sre field-text-sre"
            rows={4}
            maxLength={4000}
            placeholder="Expliquez votre demande…"
            {...register("message")}
          />
        )}
      </FormField>

      {/* Anti-bot honeypot hidden visually and ignored by the keyboard. */}
      <div className="contact-honeypot-sre" aria-hidden="true">
        <label htmlFor="contact-site-web">Ne pas remplir ce champ</label>
        <input
          id="contact-site-web"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("siteWeb")}
        />
      </div>

      <FormError message={error} />
      {!isApiConfigured && (
        <output className="contact-warning-sre">
          Le service de contact n’est pas disponible pour le moment. Réessayez plus tard.
        </output>
      )}
      <SubmitButton
        inProgress={isSubmitting}
        pendingLabel="Transmission…"
        disabled={!isApiConfigured}
      >
        Transmettre le message <ArrowRight size={16} />
      </SubmitButton>
      <p className="contact-privacy-sre">
        Votre adresse e-mail sera utilisée pour vous répondre. Le message est transmis aux
        administrateurs actifs ; aucune adresse administrative n’est exposée sur la page publique.
      </p>
    </form>
  );
}
