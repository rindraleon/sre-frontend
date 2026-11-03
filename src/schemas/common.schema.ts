import { z } from "zod";
import { SRE_REGION } from "@/data";

export const emailSchema = z
  .string()
  .min(1, "L'adresse e-mail est requise.")
  .email("Adresse e-mail invalide.");

export const phoneSchema = z
  .string()
  .min(1, "Le numéro de téléphone est requis.")
  .regex(
    /^\+?[0-9\s()-]{7,40}$/,
    "Numéro de téléphone invalide (7 à 40 caractères, chiffres et + ( ) - espaces).",
  );

export const passwordSchema = z
  .string()
  .min(10, "Le mot de passe doit contenir au moins 10 caractères.")
  .max(128, "Le mot de passe doit contenir au plus 128 caractères.")
  .regex(/[A-Z]/, "Ajoutez au moins une majuscule.")
  .regex(/[a-z]/, "Ajoutez au moins une minuscule.")
  .regex(/[0-9]/, "Ajoutez au moins un chiffre.");

export const confirmationPasswordSchema = z.object({
  nouveauMotDePasse: passwordSchema,
  confirmation: z.string().min(1, "Confirmez le nouveau mot de passe."),
});

export function requiredTextSchema(
  min: number,
  max: number,
  label: string,
  messages: { min?: string; max?: string } = {},
) {
  return z
    .string()
    .trim()
    .min(min, messages.min ?? `${label} doit contenir au moins ${min} caractères.`)
    .max(max, messages.max ?? `${label} doit contenir au plus ${max} caractères.`);
}

export function optionalTextSchema(minIfProvided: number, max: number, label: string) {
  return z.string().refine(
    (value) => {
      const text = value.trim();
      return text.length === 0 || (text.length >= minIfProvided && text.length <= max);
    },
    {
      message:
        minIfProvided > 0
          ? `${label} doit contenir entre ${minIfProvided} et ${max} caractères (ou rester vide).`
          : `${label} doit contenir au plus ${max} caractères.`,
    },
  );
}

export const nifSchema = (messages: { min?: string; max?: string } = {}) =>
  requiredTextSchema(3, 40, "Le NIF", {
    min: messages.min ?? "Le NIF est obligatoire et doit contenir au moins 3 caractères.",
    max: messages.max ?? "Le NIF doit contenir au plus 40 caractères.",
  });

export const addressSchema = requiredTextSchema(3, 220, "L'adresse", {
  min: "L'adresse doit contenir au moins 3 caractères.",
  max: "L'adresse doit contenir au plus 220 caractères.",
});

export const citySchema = requiredTextSchema(2, 120, "La ville/commune", {
  min: "La ville/commune doit contenir au moins 2 caractères.",
  max: "La ville/commune doit contenir au plus 120 caractères.",
});

export const regionSchema = z.literal(SRE_REGION);

export const statSchema = optionalTextSchema(3, 40, "Le STAT");
