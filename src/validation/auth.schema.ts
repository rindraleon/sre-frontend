import { z } from "zod";
import { SRE_REGION } from "@/utils/constants";
import { emailSchema, passwordSchema, phoneSchema, optionalTextSchema } from "./common";

export const loginSchema = z.object({
  courriel: emailSchema,
  motDePasse: z.string().min(1, "Saisissez votre mot de passe."),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Inscription. Deux régimes (DTO InscriptionDto + ProfilInscriptionDto) :
 * premier administrateur (nom + e-mail + mot de passe) ou contribuable (profil complet).
 */
export function createRegistrationSchema(premierAdministrateur: boolean) {
  return z
    .object({
      type: z.enum(["PARTICULIER", "ENTREPRISE"]),
      nom: z.string().max(120, "Le nom doit contenir au plus 120 caractères."),
      prenom: optionalTextSchema(1, 120, "Le prénom"),
      raisonSociale: optionalTextSchema(1, 180, "La raison sociale"),
      nomCommercial: optionalTextSchema(1, 180, "Le nom commercial"),
      nif: optionalTextSchema(3, 40, "Le NIF"),
      stat: optionalTextSchema(3, 40, "Le STAT"),
      representantLegal: optionalTextSchema(1, 180, "Le représentant légal"),
      nomContact: optionalTextSchema(1, 120, "Le nom du contact"),
      prenomContact: optionalTextSchema(1, 120, "Le prénom du contact"),
      fonctionContact: optionalTextSchema(1, 120, "La fonction du contact"),
      adresse: z.string().max(220, "L'adresse doit contenir au plus 220 caractères."),
      region: z.string(),
      ville: z.string().max(120, "La ville/commune doit contenir au plus 120 caractères."),
      courriel: emailSchema,
      telephone: z.string(),
      motDePasse: passwordSchema,
      confirmation: z.string().min(1, "Confirmez le mot de passe."),
    })
    .superRefine((valeurs, contexte) => {
      if (premierAdministrateur) {
        if (valeurs.nom.trim().length < 2)
          contexte.addIssue({
            code: "custom",
            path: ["nom"],
            message: "Le nom doit contenir au moins 2 caractères.",
          });
        return;
      }
      if (valeurs.type === "PARTICULIER" && !valeurs.nom.trim())
        contexte.addIssue({ code: "custom", path: ["nom"], message: "Renseignez votre nom." });
      if (valeurs.type === "ENTREPRISE" && !valeurs.raisonSociale.trim())
        contexte.addIssue({
          code: "custom",
          path: ["raisonSociale"],
          message: "La raison sociale est requise pour une entreprise.",
        });
      if (valeurs.adresse.trim().length < 3)
        contexte.addIssue({
          code: "custom",
          path: ["adresse"],
          message: "L'adresse doit contenir au moins 3 caractères.",
        });
      if (valeurs.ville.trim().length < 2)
        contexte.addIssue({
          code: "custom",
          path: ["ville"],
          message: "La ville/commune doit contenir au moins 2 caractères.",
        });
      if (valeurs.region !== SRE_REGION)
        contexte.addIssue({
          code: "custom",
          path: ["region"],
          message: `La région doit être « ${SRE_REGION} ».`,
        });
      const telephone = phoneSchema.safeParse(valeurs.telephone);
      if (!telephone.success)
        contexte.addIssue({
          code: "custom",
          path: ["telephone"],
          message: telephone.error.issues[0]?.message ?? "Numéro de téléphone invalide.",
        });
    })
    .refine((valeurs) => valeurs.motDePasse === valeurs.confirmation, {
      message: "Les mots de passe ne correspondent pas.",
      path: ["confirmation"],
    });
}
export type RegistrationFormValues = z.infer<ReturnType<typeof createRegistrationSchema>>;

/** Bloc « nouveau mot de passe + confirmation » partagé par les schémas d'authentification. */
const confirmationMotDePasseSchema = z.object({
  nouveauMotDePasse: passwordSchema,
  confirmation: z.string().min(1, "Confirmez le nouveau mot de passe."),
});

function revaliderConfirmation<T extends { nouveauMotDePasse: string; confirmation: string }>(
  schema: z.ZodType<T>,
) {
  return schema.refine(
    (valeurs) => valeurs.nouveauMotDePasse === valeurs.confirmation,
    {
      message: "Les deux nouveaux mots de passe ne correspondent pas.",
      path: ["confirmation"],
    },
  );
}

export const passwordChangeSchema = revaliderConfirmation(
  confirmationMotDePasseSchema.extend({
    motDePasseActuel: z.string().min(1, "Saisissez votre mot de passe actuel."),
  }),
)
  .refine((valeurs) => valeurs.nouveauMotDePasse !== valeurs.motDePasseActuel, {
    message: "Le nouveau mot de passe doit être différent du mot de passe actuel.",
    path: ["nouveauMotDePasse"],
  });
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

/** Bloc profil de la configuration initiale / de l'activation (validations DTO). */
const profilConfigurationSchema = z.object({
  adresse: z
    .string()
    .trim()
    .min(3, "L'adresse doit contenir au moins 3 caractères.")
    .max(220, "L'adresse doit contenir au plus 220 caractères."),
  ville: z
    .string()
    .trim()
    .min(2, "La ville/commune doit contenir au moins 2 caractères.")
    .max(120, "La ville/commune doit contenir au plus 120 caractères."),
  telephone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s()-]{7,40}$/, "Numéro de téléphone invalide (7 à 40 caractères)."),
  nomCommercial: z
    .string()
    .trim()
    .max(180, "Le nom commercial doit contenir au plus 180 caractères.")
    .optional()
    .or(z.literal("")),
});

/** Configuration initiale (première connexion avec le mot de passe provisoire). */
export const configurationInitialeSchema = revaliderConfirmation(
  confirmationMotDePasseSchema
    .extend({
      motDePasseActuel: z.string().min(1, "Saisissez le mot de passe provisoire."),
    })
    .merge(profilConfigurationSchema),
)
  .refine((valeurs) => valeurs.nouveauMotDePasse !== valeurs.motDePasseActuel, {
    message: "Le nouveau mot de passe doit être différent du mot de passe provisoire.",
    path: ["nouveauMotDePasse"],
  });
export type ConfigurationInitialeFormValues = z.infer<typeof configurationInitialeSchema>;

/** Activation par lien sécurisé à usage unique (première connexion sans STAT). */
export const activationSchema = revaliderConfirmation(
  confirmationMotDePasseSchema
    .extend({
      jeton: z.string().min(1, "Jeton d'activation absent."),
    })
    .merge(profilConfigurationSchema),
);
export type ActivationFormValues = z.infer<typeof activationSchema>;

/** Mot de passe oublié : demande de lien sécurisé (réponse générique). */
export const motDePasseOublieSchema = z.object({
  courriel: emailSchema,
});
export type MotDePasseOublieFormValues = z.infer<typeof motDePasseOublieSchema>;

/** Réinitialisation via le jeton à usage unique reçu par courriel. */
export const reinitialisationSchema = revaliderConfirmation(
  confirmationMotDePasseSchema.extend({
    jeton: z.string().min(1, "Jeton de réinitialisation absent."),
  }),
);
export type ReinitialisationFormValues = z.infer<typeof reinitialisationSchema>;

/** Formulaire public de contact (limites alignées sur PublicContactDto). */
export const publicContactSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(120, "Le nom doit contenir au plus 120 caractères."),
  courriel: emailSchema.max(254, "Adresse e-mail trop longue."),
  sujet: z
    .string()
    .trim()
    .min(3, "Le sujet doit contenir au moins 3 caractères.")
    .max(140, "Le sujet doit contenir au plus 140 caractères."),
  message: z
    .string()
    .trim()
    .min(10, "Le message doit contenir au moins 10 caractères.")
    .max(4000, "Le message doit contenir au plus 4 000 caractères."),
  siteWeb: z.string().max(200).optional().or(z.literal("")),
});
export type PublicContactFormValues = z.infer<typeof publicContactSchema>;
