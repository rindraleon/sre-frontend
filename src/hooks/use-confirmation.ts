import { useState } from "react";

/**
 * État réutilisable d'une boîte de confirmation (ConfirmDialog) : cible, chargement,
 * erreur et exécution sécurisée de l'action (fermeture seulement en cas de succès).
 */
export function useConfirmation<T>() {
  const [cible, definirCible] = useState<T | null>(null);
  const [enCours, definirEnCours] = useState(false);
  const [erreur, definirErreur] = useState("");

  return {
    cible,
    enCours,
    erreur,
    ouvrir: (valeur: T) => {
      definirCible(valeur);
      definirErreur("");
    },
    fermer: () => {
      definirCible(null);
      definirErreur("");
    },
    executer: async (
      action: (valeur: T) => Promise<void>,
      messageRepli = "Le serveur n’a pas effectué l’action. Réessayez.",
    ) => {
      if (!cible) return;
      definirEnCours(true);
      definirErreur("");
      try {
        await action(cible);
        definirCible(null);
      } catch (cause) {
        definirErreur(cause instanceof Error ? cause.message : messageRepli);
      } finally {
        definirEnCours(false);
      }
    },
  };
}
