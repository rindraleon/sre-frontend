import { z } from "zod";
import {
  addressSchema,
  citySchema,
  emailSchema,
  nifSchema,
  optionalTextSchema,
  phoneSchema,
  regionSchema,
  statSchema,
} from "./common.schema";

export const clientProfileSchema = z.object({
  nif: nifSchema(),
  nomCommercial: optionalTextSchema(1, 180, "Le nom commercial"),
  adresse: addressSchema,
  ville: citySchema,
  telephone: phoneSchema,
});
export type ClientProfileFormValues = z.infer<typeof clientProfileSchema>;

export const taxpayerFormSchema = z
  .object({
    type: z.enum(["PARTICULIER", "ENTREPRISE"]),
    nom: z.string().max(120, "Le nom doit contenir au plus 120 caractères."),
    prenom: optionalTextSchema(1, 120, "Le prénom"),
    raisonSociale: optionalTextSchema(1, 180, "La raison sociale"),
    nomCommercial: optionalTextSchema(1, 180, "Le nom commercial"),
    nif: nifSchema(),
    stat: statSchema,
    representantLegal: optionalTextSchema(1, 180, "Le représentant légal"),
    nomContact: optionalTextSchema(1, 120, "Le nom du contact"),
    prenomContact: optionalTextSchema(1, 120, "Le prénom du contact"),
    fonctionContact: optionalTextSchema(1, 120, "La fonction du contact"),
    adresse: addressSchema,
    region: regionSchema,
    ville: citySchema,
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
