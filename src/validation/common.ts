import { z } from "zod";

/**
 * Règles partagées, alignées sur les DTO backend (source de vérité).
 * Voir sre-backend : profil-inscription.dto.ts, creer-contribuable.dto.ts, etc.
 * Ne jamais durcir/relâcher ici sans modifier le DTO correspondant.
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

/** Règle durcie validée : 10 caractères min., majuscule, minuscule et chiffre (= regex DTO backend). */
export const passwordSchema = z
  .string()
  .min(10, "Le mot de passe doit contenir au moins 10 caractères.")
  .max(128, "Le mot de passe doit contenir au plus 128 caractères.")
  .regex(/[A-Z]/, "Ajoutez au moins une majuscule.")
  .regex(/[a-z]/, "Ajoutez au moins une minuscule.")
  .regex(/[0-9]/, "Ajoutez au moins un chiffre.");

/** Champ texte facultatif : vide accepté, sinon longueur bornée (DTO @IsOptional + @Length). */
export function optionalTextSchema(minSiRenseigne: number, max: number, libelle: string) {
  return z.string().refine(
    (valeur) => {
      const texte = valeur.trim();
      return texte.length === 0 || (texte.length >= minSiRenseigne && texte.length <= max);
    },
    {
      message:
        minSiRenseigne > 0
          ? `${libelle} doit contenir entre ${minSiRenseigne} et ${max} caractères (ou rester vide).`
          : `${libelle} doit contenir au plus ${max} caractères.`,
    },
  );
}
