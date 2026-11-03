import { z } from "zod";
import { phoneSchema } from "./common.schema";

export const MONTANT_MINIMUM = 1_000;
export const MONTANT_MAXIMUM = 1_000_000_000_000;

const periodPatterns: Record<string, { regex: RegExp; message: string }> = {
  MENSUELLE: {
    regex: /^\d{4}-(0[1-9]|1[0-2])$/,
    message: "Période mensuelle attendue au format AAAA-MM (ex. 2026-03).",
  },
  TRIMESTRIELLE: {
    regex: /^\d{4}-[TtQq][1-4]$/,
    message: "Période trimestrielle attendue au format AAAA-T1 à AAAA-T4.",
  },
  ANNUELLE: {
    regex: /^\d{4}$/,
    message: "Période annuelle attendue au format AAAA (ex. 2026).",
  },
};

export const paymentDeclarationSchema = z
  .object({
    typeImpotId: z.string().min(1, "Sélectionnez la nature de l'impôt."),
    montant: z
      .string()
      .min(1, "Indiquez le montant à payer.")
      .refine((value) => /^\d+$/.test(value.replaceAll(" ", "")), {
        message: "Le montant doit être un nombre entier d'ariary.",
      })
      .refine((value) => Number(value.replaceAll(" ", "")) >= MONTANT_MINIMUM, {
        message: `Le montant minimum est de ${MONTANT_MINIMUM} MGA.`,
      })
      .refine((value) => Number(value.replaceAll(" ", "")) <= MONTANT_MAXIMUM, {
        message: "Le montant dépasse le plafond autorisé.",
      }),
    periode: z.string().max(40, "La période contient au plus 40 caractères."),
    mode: z.enum(["MOBILE_MONEY", "VIREMENT_BANCAIRE"], {
      message: "Choisissez le canal utilisé pour l'opération.",
    }),
    operateur: z
      .enum(["MVOLA", "ORANGE_MONEY", "AIRTEL_MONEY"], {
        message: "Choisissez l'opérateur indiqué.",
      })
      .optional(),
    telephoneUtilise: z.string(),
    banqueOuCanal: z.string(),
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
      .refine(
        (value) =>
          new Date(value).getTime() <=
          new Date(new Date().toDateString()).getTime() + 24 * 60 * 60 * 1000,
        { message: "La date de l'opération ne peut pas être dans le futur." },
      ),
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
            phone.error.issues[0]?.message ?? "Saisissez le numéro utilisé pour l'opération.",
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

export function validateFiscalPeriod(
  periodicite: string | undefined,
  periode: string,
): string | null {
  const rule = periodicite ? periodPatterns[periodicite] : undefined;
  if (!rule) return null;
  if (!periode.trim()) return "Indiquez la période fiscale concernée.";
  return rule.regex.test(periode.trim()) ? null : rule.message;
}

export function formatAmountInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("fr-FR").format(Number(digits));
}

export function fiscalPeriodHint(periodicite: string | undefined): string {
  switch (periodicite) {
    case "MENSUELLE":
      return "Format AAAA-MM (ex. 2026-03).";
    case "TRIMESTRIELLE":
      return "Format AAAA-T1 à AAAA-T4 (ex. 2026-T1).";
    case "ANNUELLE":
      return "Format AAAA (ex. 2026).";
    default:
      return "Facultatif pour un impôt ponctuel : la date de l'opération est utilisée.";
  }
}

export const decisionReasonSchema = z.object({
  motif: z
    .string()
    .min(5, "Le motif doit contenir au moins 5 caractères.")
    .max(1500, "Le motif doit contenir au plus 1 500 caractères."),
});
export type DecisionReasonFormValues = z.infer<typeof decisionReasonSchema>;
