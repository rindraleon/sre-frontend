import { useState } from "react";

export function useConfirmation<T>() {
  const [target, setTarget] = useState<T | null>(null);
  const [inProgress, setInProgress] = useState(false);
  const [error, setError] = useState("");

  return {
    target,
    inProgress,
    error,
    open: (value: T) => {
      setTarget(value);
      setError("");
    },
    close: () => {
      setTarget(null);
      setError("");
    },
    execute: async (
      action: (value: T) => Promise<void>,
      fallbackMessage = "Le serveur n’a pas effectué l’action. Réessayez.",
    ) => {
      if (!target) return;
      setInProgress(true);
      setError("");
      try {
        await action(target);
        setTarget(null);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : fallbackMessage);
      } finally {
        setInProgress(false);
      }
    },
  };
}
