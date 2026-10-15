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

export const passwordChangeSchema = z
  .object({
    motDePasseActuel: z.string().min(1, "Saisissez votre mot de passe actuel."),
    nouveauMotDePasse: passwordSchema,
    confirmation: z.string().min(1, "Confirmez le nouveau mot de passe."),
  })
  .refine((valeurs) => valeurs.nouveauMotDePasse === valeurs.confirmation, {
    message: "Les deux nouveaux mots de passe ne correspondent pas.",
    path: ["confirmation"],
  })
  .refine((valeurs) => valeurs.nouveauMotDePasse !== valeurs.motDePasseActuel, {
    message: "Le nouveau mot de passe doit être différent du mot de passe actuel.",
    path: ["nouveauMotDePasse"],
  });
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;
