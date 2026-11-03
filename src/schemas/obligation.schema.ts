import { z } from "zod";

export const obligationFormSchema = z.object({
  contribuableId: z.string().min(1, "Sélectionnez un contribuable."),
  typeImpotId: z.string().min(1, "Sélectionnez un type d'impôt actif."),
  periode: z
    .string()
    .min(1, "Renseignez la période validée.")
    .max(80, "La période doit contenir au plus 80 caractères."),
  montant: z
    .number({ error: "Saisissez un montant valide." })
    .int("Le montant doit être un nombre entier.")
    .min(1, "Le montant doit être supérieur à 0.")
    .max(999_999_999_999_999, "Le montant dépasse le maximum autorisé."),
  echeance: z.string().min(1, "Renseignez la date d'échéance validée."),
});
export type ObligationFormValues = z.infer<typeof obligationFormSchema>;
