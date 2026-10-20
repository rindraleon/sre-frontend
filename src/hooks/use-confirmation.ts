import { useState } from "react";

export function useConfirmation<T>() {
  const [cible, setCible] = useState<T | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  return {
    cible,
    enCours,
    erreur,
    ouvrir: (valeur: T) => {
      setCible(valeur);
      setErreur("");
    },
    fermer: () => {
      setCible(null);
      setErreur("");
    },
    executer: async (
      action: (valeur: T) => Promise<void>,
      messageRepli = "Le serveur n’a pas effectué l’action. Réessayez.",
    ) => {
      if (!cible) return;
      setEnCours(true);
      setErreur("");
      try {
        await action(cible);
        setCible(null);
      } catch (cause) {
        setErreur(cause instanceof Error ? cause.message : messageRepli);
      } finally {
        setEnCours(false);
      }
    },
  };
}
