import { z } from "zod";

/** Création d'obligation par l'administration — CreerObligationDto. */
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

/** Création / modification d'un type d'impôt — CreerTypeImpotDto. */
export const taxTypeFormSchema = z
  .object({
    code: z
      .string()
      .min(2, "Le code doit contenir au moins 2 caractères.")
      .max(32, "Le code doit contenir au plus 32 caractères."),
    nom: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères.")
      .max(160, "Le nom doit contenir au plus 160 caractères."),
    description: z.string().max(2000, "La description doit contenir au plus 2 000 caractères."),
    categorie: z
      .string()
      .min(2, "La catégorie doit contenir au moins 2 caractères.")
      .max(100, "La catégorie doit contenir au plus 100 caractères."),
    contribuablesConcernes: z.enum(["TOUS", "PARTICULIER", "ENTREPRISE"], {
      message: "Choisissez les contribuables concernés.",
    }),
    periodicite: z.enum(["MENSUELLE", "TRIMESTRIELLE", "ANNUELLE", "PONCTUELLE"], {
      message: "Choisissez la périodicité.",
    }),
    regleEcheance: z.string().max(220, "La règle d'échéance doit contenir au plus 220 caractères."),
    modeMontant: z.enum(["FIXE", "CALCULE", "MANUEL"], {
      message: "Choisissez le mode de montant.",
    }),
    montantReference: z
      .number({ error: "Saisissez un montant valide." })
      .int("Le montant doit être un nombre entier.")
      .min(0, "Le montant ne peut pas être négatif.")
      .max(999_999_999_999_999, "Le montant dépasse le maximum autorisé.")
      .nullable(),
    champsComplementairesTexte: z.string(),
  })
  .superRefine((valeurs, contexte) => {
    // Règle métier déjà appliquée par l'ancienne interface (le DTO l'autorise à null).
    if (valeurs.modeMontant === "FIXE" && valeurs.montantReference == null)
      contexte.addIssue({
        code: "custom",
        path: ["montantReference"],
        message: "Indiquez le montant de référence confirmé pour un mode fixe.",
      });
  });
export type TaxTypeFormValues = z.infer<typeof taxTypeFormSchema>;
