import { z } from "zod";
import { phoneSchema } from "./common";

/** Client payment declaration — aligned with CreatePaymentDto (backend). */
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
      .refine((value) => !Number.isNaN(new Date(value).getTime()), {
        message: "Date invalide.",
      })
      .refine((value) => new Date(value).getTime() <= Date.now(), {
        message: "La date de l'opération ne peut pas être dans le futur.",
      }),
  })
  .superRefine((values, context) => {
    if (values.mode === "MOBILE_MONEY") {
      if (!values.operateur)
        context.addIssue({
          code: "custom",
          path: ["operateur"],
          message: "Choisissez l'opérateur indiqué.",
        });
      const phone = phoneSchema.safeParse(values.telephoneUtilise);
      if (!phone.success)
        context.addIssue({
          code: "custom",
          path: ["telephoneUtilise"],
          message:
            phone.error.issues[0]?.message ??
            "Saisissez un numéro de téléphone valide utilisé pour l'opération.",
        });
    }
    if (
      values.mode === "VIREMENT_BANCAIRE" &&
      (values.banqueOuCanal.trim().length < 2 || values.banqueOuCanal.trim().length > 140)
    )
      context.addIssue({
        code: "custom",
        path: ["banqueOuCanal"],
        message: "Précisez l'établissement ou le canal indiqué (2 à 140 caractères).",
      });
  });
export type PaymentDeclarationFormValues = z.infer<typeof paymentDeclarationSchema>;

/** Reason of an administrative decision (rejection / correction) — PaymentDecisionDto. */
export const decisionReasonSchema = z.object({
  motif: z
    .string()
    .min(5, "Le motif doit contenir au moins 5 caractères.")
    .max(1500, "Le motif doit contenir au plus 1 500 caractères."),
});
export type DecisionReasonFormValues = z.infer<typeof decisionReasonSchema>;
