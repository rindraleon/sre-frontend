import { useState } from "react";
import { ArrowRight, CheckCircle2, Mail, Send, UserRound } from "lucide-react";
import {
  FormError,
  FormField,
  SubmitButton,
  FIELD_INPUT_CLASS,
  FIELD_TEXTAREA_CLASS,
  PUBLIC_CONTACT_CONFIRMATION_CLASS,
  PUBLIC_CONTACT_CONFIRMATION_ICON_CLASS,
  PUBLIC_CONTACT_CONFIRMATION_ICON_TEST_CLASS,
  PUBLIC_CONTACT_FORM_CLASS,
  PUBLIC_CONTACT_FORM_HEADER_CLASS,
  PUBLIC_CONTACT_FORM_HEADER_ICON_CLASS,
  PUBLIC_CONTACT_HONEYPOT_CLASS,
  PUBLIC_CONTACT_ICON_CLASS,
  PUBLIC_CONTACT_LINK_CLASS,
  PUBLIC_CONTACT_PRIVACY_CLASS,
  PUBLIC_CONTACT_WARNING_CLASS,
} from "@/components";
import { cn } from "@/utils";
import { useApiForm } from "@/hooks";
import { isApiConfigured } from "@/services/api";
import { publicContactSchema, type PublicContactFormValues } from "@/schemas";
import { submitPublicContactApi } from "@/services/contact-messages";
import type { PublicContactSubmissionResponse } from "@/types";
import { formatDate } from "@/utils";

const EMPTY_VALUES: PublicContactFormValues = {
  nom: "",
  courriel: "",
  sujet: "",
  message: "",
  siteWeb: "",
};

export function PublicContactForm() {
  const [confirmation, setConfirmation] = useState<PublicContactSubmissionResponse | null>(null);
  const { register, handleSubmit, errors, isSubmitting, error, handleFailure, resetForm } =
    useApiForm<PublicContactFormValues>({
      schema: publicContactSchema,
      initialValues: EMPTY_VALUES,
      fallbackMessage: "Impossible de transmettre votre message. Réessayez plus tard.",
    });

  const onSubmit = handleSubmit(async (values) => {
    setConfirmation(null);
    try {
      const result = await submitPublicContactApi({
        nom: values.nom.trim(),
        courriel: values.courriel.trim().toLowerCase(),
        sujet: values.sujet.trim(),
        message: values.message.trim(),
        siteWeb: values.siteWeb ?? "",
      });
      setConfirmation(result);
    } catch (cause) {
      handleFailure(cause);
    }
  });

  if (confirmation) {
    const ackSent =
      confirmation.accuseReception?.statut === "ENVOYE" || confirmation.statut === "CAPTURE";

    return (
      <div className={PUBLIC_CONTACT_CONFIRMATION_CLASS} role="status" aria-live="polite">
        <span
          className={cn(
            PUBLIC_CONTACT_CONFIRMATION_ICON_CLASS,
            confirmation.statut === "CAPTURE" && PUBLIC_CONTACT_CONFIRMATION_ICON_TEST_CLASS,
          )}
        >
          <CheckCircle2 size={22} aria-hidden="true" />
        </span>
        <strong>
          {confirmation.statut === "CAPTURE"
            ? "Message reçu en mode test"
            : "Message transmis à l’administration"}
        </strong>
        <p>{confirmation.message}</p>
        {confirmation.reference && (
          <div className="mt-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 space-y-1">
            <div>
              <strong>Référence de suivi :</strong>{" "}
              <span className="font-mono font-semibold">{confirmation.reference}</span>
            </div>
            {confirmation.dateSoumission && (
              <div>
                <strong>Date d’enregistrement :</strong>{" "}
                {formatDate(confirmation.dateSoumission, true)}
              </div>
            )}
            {confirmation.accuseReception?.destinataire && (
              <div>
                <strong>Accusé de réception :</strong>{" "}
                {ackSent
                  ? `Envoyé par e-mail à ${confirmation.accuseReception.destinataire}`
                  : confirmation.accuseReception.statut === "NON_CONFIGURE"
                    ? "Demande enregistrée dans le portail (envoi e-mail externe non configuré)"
                    : "Demande enregistrée en base ; l'envoi de l'accusé par e-mail sera relancé par l'administration"}
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          className={PUBLIC_CONTACT_LINK_CLASS}
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
    <form className={PUBLIC_CONTACT_FORM_CLASS} onSubmit={onSubmit} noValidate>
      <div className={PUBLIC_CONTACT_FORM_HEADER_CLASS}>
        <span className={cn(PUBLIC_CONTACT_ICON_CLASS, PUBLIC_CONTACT_FORM_HEADER_ICON_CLASS)}>
          <Send size={17} aria-hidden="true" />
        </span>
        <div>
          <strong>Écrire à l’administration</strong>
          <small>Les champs marqués * sont obligatoires.</small>
        </div>
      </div>

      <FormField label="Nom" error={errors.nom} required>
        {(props) => (
          <span className="flex min-h-[39px] items-center gap-2 rounded-[7px] border border-pub-border bg-pub-surface px-[10px] text-pub-muted [&_input]:min-h-[35px] [&_input]:border-0 [&_input]:bg-transparent [&_input]:p-0 [&_input]:outline-none [&_input]:shadow-none">
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
          <span className="flex min-h-[39px] items-center gap-2 rounded-[7px] border border-pub-border bg-pub-surface px-[10px] text-pub-muted [&_input]:min-h-[35px] [&_input]:border-0 [&_input]:bg-transparent [&_input]:p-0 [&_input]:outline-none [&_input]:shadow-none">
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
            className={FIELD_INPUT_CLASS}
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
            className={FIELD_TEXTAREA_CLASS}
            rows={4}
            maxLength={4000}
            placeholder="Expliquez votre demande…"
            {...register("message")}
          />
        )}
      </FormField>

      <div className={PUBLIC_CONTACT_HONEYPOT_CLASS} aria-hidden="true">
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
        <output className={PUBLIC_CONTACT_WARNING_CLASS}>
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
      <p className={PUBLIC_CONTACT_PRIVACY_CLASS}>
        Votre adresse e-mail sera utilisée pour vous répondre et vous adresser un accusé de
        réception automatique. Le message est transmis aux administrateurs actifs ; aucune adresse
        administrative n’est exposée sur la page publique.
      </p>
    </form>
  );
}
