import { z } from "zod";
import { emailSchema } from "./common.schema";

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
