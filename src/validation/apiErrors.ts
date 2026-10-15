import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { ApiError } from "@/services/api";

/**
 * Projette les erreurs par champ renvoyées par l'API ({ errors: { "profil.telephone": [...] } })
 * sur les champs du formulaire via setError(). Les champs imbriqués sont ramenés à leur
 * dernier segment (`profil.telephone` -> `telephone`), ce qui correspond aux noms des
 * formulaires du portail. Renvoie les messages non rattachables à un champ connu,
 * à afficher en erreur globale du formulaire.
 */
export function applyApiErrors<T extends FieldValues>(
  formulaire: UseFormReturn<T, any, any>,
  cause: unknown,
): string[] {
  if (!(cause instanceof ApiError) || !cause.erreurs) return [];
  const champsConnus = new Set(Object.keys(formulaire.getValues()));
  const messagesGlobaux: string[] = [];
  for (const [chemin, messages] of Object.entries(cause.erreurs)) {
    const champ = chemin.split(".").pop() ?? chemin;
    for (const message of messages) {
      if (champsConnus.has(champ)) {
        formulaire.setError(champ as Path<T>, { type: "server", message });
      } else {
        messagesGlobaux.push(message);
      }
    }
  }
  return messagesGlobaux;
}

/** Message global à afficher quand aucune erreur par champ n'a pu être appliquée. */
export function apiErrorMessage(cause: unknown, repli: string): string {
  return cause instanceof Error ? cause.message : repli;
}
