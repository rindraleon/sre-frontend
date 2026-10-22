import { z } from "zod";
import { SRE_REGION } from "@/utils/constants";
import { emailSchema, phoneSchema, optionalTextSchema } from "./common";

/** Contact details editable by the client — UpdateTaxpayerProfileDto. */
export const clientProfileSchema = z.object({
  nomCommercial: optionalTextSchema(1, 180, "Le nom commercial"),
  adresse: z
    .string()
    .min(3, "L'adresse doit contenir au moins 3 caractères.")
    .max(220, "L'adresse doit contenir au plus 220 caractères."),
  ville: z
    .string()
    .min(2, "La ville/commune doit contenir au moins 2 caractères.")
    .max(120, "La ville/commune doit contenir au plus 120 caractères."),
  telephone: phoneSchema,
});
export type ClientProfileFormValues = z.infer<typeof clientProfileSchema>;

/** Taxpayer profile creation by the administration — CreateTaxpayerDto. */
export const taxpayerFormSchema = z
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
    adresse: z
      .string()
      .min(3, "L'adresse doit contenir au moins 3 caractères.")
      .max(220, "L'adresse doit contenir au plus 220 caractères."),
    region: z.literal(SRE_REGION),
    ville: z
      .string()
      .min(2, "La ville/commune doit contenir au moins 2 caractères.")
      .max(120, "La ville/commune doit contenir au plus 120 caractères."),
    courriel: emailSchema,
    telephone: phoneSchema,
  })
  .superRefine((values, context) => {
    if (values.type === "PARTICULIER" && !values.nom.trim())
      context.addIssue({ code: "custom", path: ["nom"], message: "Le nom est requis." });
    if (values.type === "ENTREPRISE" && !values.raisonSociale.trim())
      context.addIssue({
        code: "custom",
        path: ["raisonSociale"],
        message: "La raison sociale est requise.",
      });
  });
export type TaxpayerFormValues = z.infer<typeof taxpayerFormSchema>;
