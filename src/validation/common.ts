import { z } from "zod";

/**
 * Shared rules, aligned with the backend DTOs (source of truth).
 * See sre-backend: registration.dto.ts, create-taxpayer.dto.ts, etc.
 * Never tighten/relax here without changing the corresponding DTO.
 */
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

/** Validated hardened rule: min. 10 characters, uppercase, lowercase and digit (= backend DTO regex). */
export const passwordSchema = z
  .string()
  .min(10, "Le mot de passe doit contenir au moins 10 caractères.")
  .max(128, "Le mot de passe doit contenir au plus 128 caractères.")
  .regex(/[A-Z]/, "Ajoutez au moins une majuscule.")
  .regex(/[a-z]/, "Ajoutez au moins une minuscule.")
  .regex(/[0-9]/, "Ajoutez au moins un chiffre.");

/** Optional text field: empty accepted, otherwise bounded length (DTO @IsOptional + @Length). */
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
