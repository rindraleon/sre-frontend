import { z } from "zod";
import {
  addressSchema,
  citySchema,
  confirmationPasswordSchema,
  emailSchema,
  nifSchema,
  optionalTextSchema,
  passwordSchema,
  phoneSchema,
  regionSchema,
  statSchema,
} from "./common.schema";

export const loginSchema = z.object({
  courriel: emailSchema,
  motDePasse: z.string().min(1, "Saisissez votre mot de passe."),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

const identityFieldsSchema = z.object({
  nom: z.string().max(120, "Le nom doit contenir au plus 120 caractères."),
  prenom: optionalTextSchema(1, 120, "Le prénom"),
  raisonSociale: optionalTextSchema(1, 180, "La raison sociale"),
  nomCommercial: optionalTextSchema(1, 180, "Le nom commercial"),
  nif: z.string().trim().max(40, "Le NIF doit contenir au plus 40 caractères."),
  stat: statSchema,
  representantLegal: optionalTextSchema(1, 180, "Le représentant légal"),
  nomContact: optionalTextSchema(1, 120, "Le nom du contact"),
  prenomContact: optionalTextSchema(1, 120, "Le prénom du contact"),
  fonctionContact: optionalTextSchema(1, 120, "La fonction du contact"),
  adresse: z.string().max(220, "L'adresse doit contenir au plus 220 caractères."),
  ville: z.string().max(120, "La ville/commune doit contenir au plus 120 caractères."),
});

export function createRegistrationSchema(isFirstAdministrator: boolean) {
  const base = identityFieldsSchema.extend({
    type: z.enum(["PARTICULIER", "ENTREPRISE"]),
    region: z.string(),
    courriel: emailSchema,
    telephone: z.string(),
    motDePasse: passwordSchema,
    confirmation: z.string().min(1, "Confirmez le mot de passe."),
  });

  return base
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
      const nif = nifSchema().safeParse(values.nif);
      if (!nif.success)
        context.addIssue({
          code: "custom",
          path: ["nif"],
          message: nif.error.issues[0]?.message ?? "Le NIF est invalide.",
        });
      const address = addressSchema.safeParse(values.adresse);
      if (!address.success)
        context.addIssue({
          code: "custom",
          path: ["adresse"],
          message: address.error.issues[0]?.message ?? "L'adresse est invalide.",
        });
      const city = citySchema.safeParse(values.ville);
      if (!city.success)
        context.addIssue({
          code: "custom",
          path: ["ville"],
          message: city.error.issues[0]?.message ?? "La ville/commune est invalide.",
        });
      const region = regionSchema.safeParse(values.region);
      if (!region.success)
        context.addIssue({
          code: "custom",
          path: ["region"],
          message: region.error.issues[0]?.message ?? "La région de rattachement est invalide.",
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

function withPasswordConfirmation<T extends { nouveauMotDePasse: string; confirmation: string }>(
  schema: z.ZodType<T>,
  message = "Les deux nouveaux mots de passe ne correspondent pas.",
) {
  return schema.refine((values) => values.nouveauMotDePasse === values.confirmation, {
    message,
    path: ["confirmation"],
  });
}

export const passwordChangeSchema = withPasswordConfirmation(
  confirmationPasswordSchema.extend({
    motDePasseActuel: z.string().min(1, "Saisissez votre mot de passe actuel."),
  }),
).refine((values) => values.nouveauMotDePasse !== values.motDePasseActuel, {
  message: "Le nouveau mot de passe doit être différent du mot de passe actuel.",
  path: ["nouveauMotDePasse"],
});
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

const setupProfileSchema = z.object({
  adresse: addressSchema,
  ville: citySchema,
  telephone: phoneSchema,
  nomCommercial: z
    .string()
    .trim()
    .max(180, "Le nom commercial doit contenir au plus 180 caractères.")
    .optional()
    .or(z.literal("")),
});

export const initialSetupSchema = withPasswordConfirmation(
  confirmationPasswordSchema
    .extend({ motDePasseActuel: z.string().min(1, "Saisissez le mot de passe provisoire.") })
    .merge(setupProfileSchema),
).refine((values) => values.nouveauMotDePasse !== values.motDePasseActuel, {
  message: "Le nouveau mot de passe doit être différent du mot de passe provisoire.",
  path: ["nouveauMotDePasse"],
});
export type InitialSetupFormValues = z.infer<typeof initialSetupSchema>;

export const activationSchema = withPasswordConfirmation(
  confirmationPasswordSchema
    .extend({ jeton: z.string().min(1, "Jeton d'activation absent.") })
    .merge(setupProfileSchema),
);
export type ActivationFormValues = z.infer<typeof activationSchema>;

export const forgotPasswordSchema = z.object({ courriel: emailSchema });
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetSchema = withPasswordConfirmation(
  confirmationPasswordSchema.extend({
    jeton: z.string().min(1, "Jeton de réinitialisation absent."),
  }),
);
export type PasswordResetFormValues = z.infer<typeof resetSchema>;
