import { z } from "zod";
import { phoneSchema } from "./common";

/** Déclaration de paiement client — aligné sur CreerPaiementDto (backend). */
export const paymentDeclarationSchema = z
  .object({
    obligationId: z.string().min(1, "Sélectionnez une obligation disponible pour votre compte."),
    mode: z.enum(["MOBILE_MONEY", "VIREMENT_BANCAIRE"], {
      message: "Choisissez le canal de l'opération déclarée.",
    }),
    operateur: z
      .enum(["MVOLA", "ORANGE_MONEY", "AIRTEL_MONEY"], {
        message: "Choisissez l'opérateur indiqué.",
      })
      .optional(),
    telephoneUtilise: z.string(),
    banqueOuCanal: z.string(),
    titulairePayeur: z.string().max(180, "Le titulaire doit contenir au plus 180 caractères."),
    referenceTransaction: z
      .string()
      .min(3, "La référence doit contenir au moins 3 caractères.")
      .max(128, "La référence doit contenir au plus 128 caractères."),
    dateTransaction: z
      .string()
      .min(1, "Indiquez la date de l'opération.")
      .refine((valeur) => !Number.isNaN(new Date(valeur).getTime()), {
        message: "Date invalide.",
      })
      .refine((valeur) => new Date(valeur).getTime() <= Date.now(), {
        message: "La date de l'opération ne peut pas être dans le futur.",
      }),
  })
  .superRefine((valeurs, contexte) => {
    if (valeurs.mode === "MOBILE_MONEY") {
      if (!valeurs.operateur)
        contexte.addIssue({
          code: "custom",
          path: ["operateur"],
          message: "Choisissez l'opérateur indiqué.",
        });
      const telephone = phoneSchema.safeParse(valeurs.telephoneUtilise);
      if (!telephone.success)
        contexte.addIssue({
          code: "custom",
          path: ["telephoneUtilise"],
          message:
            telephone.error.issues[0]?.message ??
            "Saisissez un numéro de téléphone valide utilisé pour l'opération.",
        });
    }
    if (
      valeurs.mode === "VIREMENT_BANCAIRE" &&
      (valeurs.banqueOuCanal.trim().length < 2 || valeurs.banqueOuCanal.trim().length > 140)
    )
      contexte.addIssue({
        code: "custom",
        path: ["banqueOuCanal"],
        message: "Précisez l'établissement ou le canal indiqué (2 à 140 caractères).",
      });
  });
export type PaymentDeclarationFormValues = z.infer<typeof paymentDeclarationSchema>;

/** Motif d'une décision administrative (rejet / correction) — DecisionPaiementDto. */
export const decisionReasonSchema = z.object({
  motif: z
    .string()
    .min(5, "Le motif doit contenir au moins 5 caractères.")
    .max(1500, "Le motif doit contenir au plus 1 500 caractères."),
});
export type DecisionReasonFormValues = z.infer<typeof decisionReasonSchema>;
