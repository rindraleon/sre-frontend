import { z } from "zod";
import { SRE_REGION } from "@/utils/constants";
import { emailSchema, passwordSchema, phoneSchema, optionalTextSchema } from "./common";

export const loginSchema = z.object({
  courriel: emailSchema,
  motDePasse: z.string().min(1, "Saisissez votre mot de passe."),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

/** Registration. */
export function createRegistrationSchema(isFirstAdministrator: boolean) {
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
    .superRefine((values, context) => {
      if (isFirstAdministrator) {
        if (values.nom.trim().length < 2)
          context.addIssue({
            code: "custom",
            path: ["nom"],
            message: "Le nom doit contenir au moins 2 caractères.",
          });
        return;
      }
      if (values.type === "PARTICULIER" && !values.nom.trim())
        context.addIssue({ code: "custom", path: ["nom"], message: "Renseignez votre nom." });
      if (values.type === "ENTREPRISE" && !values.raisonSociale.trim())
        context.addIssue({
          code: "custom",
          path: ["raisonSociale"],
          message: "La raison sociale est requise pour une entreprise.",
        });
      if (values.adresse.trim().length < 3)
        context.addIssue({
          code: "custom",
          path: ["adresse"],
          message: "L'adresse doit contenir au moins 3 caractères.",
        });
      if (values.ville.trim().length < 2)
        context.addIssue({
          code: "custom",
          path: ["ville"],
          message: "La ville/commune doit contenir au moins 2 caractères.",
        });
      if (values.region !== SRE_REGION)
        context.addIssue({
          code: "custom",
          path: ["region"],
          message: `La région doit être « ${SRE_REGION} ».`,
        });
      const phone = phoneSchema.safeParse(values.telephone);
      if (!phone.success)
        context.addIssue({
          code: "custom",
          path: ["telephone"],
          message: phone.error.issues[0]?.message ?? "Numéro de téléphone invalide.",
        });
    })
    .refine((values) => values.motDePasse === values.confirmation, {
      message: "Les mots de passe ne correspondent pas.",
      path: ["confirmation"],
    });
}
export type RegistrationFormValues = z.infer<ReturnType<typeof createRegistrationSchema>>;

/** "New password + confirmation" block shared by the authentication schemas. */
const confirmationPasswordSchema = z.object({
  nouveauMotDePasse: passwordSchema,
  confirmation: z.string().min(1, "Confirmez le nouveau mot de passe."),
});

function revalidateConfirmation<T extends { nouveauMotDePasse: string; confirmation: string }>(
  schema: z.ZodType<T>,
) {
  return schema.refine(
    (values) => values.nouveauMotDePasse === values.confirmation,
    {
      message: "Les deux nouveaux mots de passe ne correspondent pas.",
      path: ["confirmation"],
    },
  );
}

export const passwordChangeSchema = revalidateConfirmation(
  confirmationPasswordSchema.extend({
    motDePasseActuel: z.string().min(1, "Saisissez votre mot de passe actuel."),
  }),
)
  .refine((values) => values.nouveauMotDePasse !== values.motDePasseActuel, {
    message: "Le nouveau mot de passe doit être différent du mot de passe actuel.",
    path: ["nouveauMotDePasse"],
  });
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

/** Profile block of the initial setup / activation (DTO validations). */
const setupProfileSchema = z.object({
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

/** Initial setup (first sign-in with the provisional password). */
export const initialSetupSchema = revalidateConfirmation(
  confirmationPasswordSchema
    .extend({
      motDePasseActuel: z.string().min(1, "Saisissez le mot de passe provisoire."),
    })
    .merge(setupProfileSchema),
)
  .refine((values) => values.nouveauMotDePasse !== values.motDePasseActuel, {
    message: "Le nouveau mot de passe doit être différent du mot de passe provisoire.",
    path: ["nouveauMotDePasse"],
  });
export type InitialSetupFormValues = z.infer<typeof initialSetupSchema>;

/** Activation through a secure single-use link (first sign-in without STAT). */
export const activationSchema = revalidateConfirmation(
  confirmationPasswordSchema
    .extend({
      jeton: z.string().min(1, "Jeton d'activation absent."),
    })
    .merge(setupProfileSchema),
);
export type ActivationFormValues = z.infer<typeof activationSchema>;

/** Forgot password: secure-link request (generic response). */
export const forgotPasswordSchema = z.object({
  courriel: emailSchema,
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/** Reset through the single-use token received by e-mail. */
export const resetSchema = revalidateConfirmation(
  confirmationPasswordSchema.extend({
    jeton: z.string().min(1, "Jeton de réinitialisation absent."),
  }),
);
export type PasswordResetFormValues = z.infer<typeof resetSchema>;

/** Public contact form (limits aligned with PublicContactDto). */
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
