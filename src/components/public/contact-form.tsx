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

const VALEURS_VIDES: PublicContactFormValues = {
  nom: "",
  courriel: "",
  sujet: "",
  message: "",
  siteWeb: "",
};

/** Formulaire public de contact : une seule colonne, sans défilement interne. */
export function PublicContactForm() {
  const [confirmation, setConfirmation] = useState<ConfirmationContact | null>(null);
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    erreur,
    traiterEchec,
    reinitialiserFormulaire,
  } = useApiForm<PublicContactFormValues>({
    schema: publicContactSchema,
    valeursInitiales: VALEURS_VIDES,
    messageRepli: "Impossible de transmettre votre message. Réessayez plus tard.",
  });

  const soumettre = handleSubmit(async (valeurs) => {
    setConfirmation(null);
    try {
      const resultat = await callApi<ConfirmationContact>("contact", {
        method: "POST",
        body: {
          nom: valeurs.nom.trim(),
          courriel: valeurs.courriel.trim().toLowerCase(),
          sujet: valeurs.sujet.trim(),
          message: valeurs.message.trim(),
          siteWeb: valeurs.siteWeb ?? "",
        },
      });
      setConfirmation(resultat);
    } catch (cause) {
      traiterEchec(cause);
    }
  });

  if (confirmation) {
    return (
      <div
        className={`contact-confirmation-sre ${confirmation.statut === "CAPTURE" ? "contact-confirmation-sre--test" : ""}`}
        role="status"
        aria-live="polite"
      >
        <span className="contact-confirmation-sre__icone">
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
          className="lien-contact-sre"
          onClick={() => {
            setConfirmation(null);
            reinitialiserFormulaire(VALEURS_VIDES);
          }}
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form className="formulaire-contact-sre" onSubmit={soumettre} noValidate>
      <div className="contact-formulaire-entete-sre">
        <span className="contact-formulaire-entete-sre__icone">
          <Send size={17} aria-hidden="true" />
        </span>
        <div>
          <strong>Écrire à l’administration</strong>
          <small>Les champs marqués * sont obligatoires.</small>
        </div>
      </div>

      <FormField libelle="Nom" erreur={errors.nom} requis>
        {(proprietes) => (
          <span className="champ-sre champ-sre--icone">
            <UserRound size={16} aria-hidden="true" />
            <input
              {...proprietes}
              type="text"
              autoComplete="name"
              maxLength={120}
              placeholder="Votre nom"
              {...register("nom")}
            />
          </span>
        )}
      </FormField>

      <FormField libelle="Adresse e-mail" erreur={errors.courriel} requis>
        {(proprietes) => (
          <span className="champ-sre champ-sre--icone">
            <Mail size={16} aria-hidden="true" />
            <input
              {...proprietes}
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

      <FormField libelle="Sujet" erreur={errors.sujet} requis>
        {(proprietes) => (
          <input
            {...proprietes}
            className="champ-simple-sre"
            type="text"
            maxLength={140}
            placeholder="Objet de votre demande"
            {...register("sujet")}
          />
        )}
      </FormField>

      <FormField
        libelle="Votre message"
        erreur={errors.message}
        aide="N’incluez pas de mot de passe ni de données bancaires."
        requis
      >
        {(proprietes) => (
          <textarea
            {...proprietes}
            className="champ-simple-sre champ-texte-sre"
            rows={4}
            maxLength={4000}
            placeholder="Expliquez votre demande…"
            {...register("message")}
          />
        )}
      </FormField>

      {/* Honeypot anti-robot masqué visuellement et ignoré par le clavier. */}
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

      <FormError message={erreur} />
      {!isApiConfigured && (
        <output className="contact-avertissement-sre">
          Le service de contact n’est pas disponible pour le moment. Réessayez plus tard.
        </output>
      )}
      <SubmitButton
        enCours={isSubmitting}
        libelleEnCours="Transmission…"
        disabled={!isApiConfigured}
      >
        Transmettre le message <ArrowRight size={16} />
      </SubmitButton>
      <p className="contact-confidentialite-sre">
        Votre adresse e-mail sera utilisée pour vous répondre. Le message est transmis aux
        administrateurs actifs ; aucune adresse administrative n’est exposée sur la page publique.
      </p>
    </form>
  );
}
