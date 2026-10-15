import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { PlatformState } from "@/types";
import { SRE_REGION } from "@/utils/constants";

export type ToastType = "succes" | "erreur" | "avertissement" | "info";
export interface ToastItem {
  id: string;
  message: string;
  description?: string;
  type: ToastType;
}
type MiseAJourSre = (etat: PlatformState) => PlatformState;

interface SreContextValue {
  etat: PlatformState;
  chargementInitial: boolean;
  toasts: ToastItem[];
  mettreAJourEtat: (miseAJour: MiseAJourSre) => void;
  notifier: (message: string, type?: ToastType, description?: string) => void;
  retirerToast: (id: string) => void;
}

const Contexte = createContext<SreContextValue | null>(null);
let compteurToastSre = 0;

export function createEmptyState(): PlatformState {
  return {
    version: 1,
    administrateurInitialise: false,
    utilisateurs: [],
    contribuables: [],
    typesImpots: [],
    obligations: [],
    paiements: [],
    documentsPaiement: [],
    notifications: [],
    journauxActivite: [],
    parametres: { institution: `SRE · ${SRE_REGION}`, regions: [SRE_REGION] },
  };
}

export function SreProvider({ children }: { children: React.ReactNode }) {
  const [etat, definirEtat] = useState<PlatformState>(() => createEmptyState());
  const [toasts, definirToasts] = useState<ToastItem[]>([]);

  const retirerToast = useCallback((id: string) => {
    definirToasts((courants) => courants.filter((toast) => toast.id !== id));
  }, []);

  const notifier = useCallback(
    (message: string, type: ToastType = "succes", description?: string) => {
      const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${++compteurToastSre}`;
      definirToasts((courants) => {
        // Déduplication : un même message du même type n'est jamais empilé deux fois.
        if (courants.some((toast) => toast.message === message && toast.type === type))
          return courants;
        return [...courants.slice(-3), { id, message, type, description }];
      });
      // Les erreurs restent plus longtemps pour être lues (et ferment manuellement).
      const duree = type === "erreur" ? 8000 : type === "avertissement" ? 6000 : 4500;
      window.setTimeout(
        () => definirToasts((courants) => courants.filter((toast) => toast.id !== id)),
        duree,
      );
    },
    [],
  );

  const mettreAJourEtat = useCallback((miseAJour: MiseAJourSre) => {
    definirEtat((courant) => miseAJour(courant));
  }, []);

  const valeur = useMemo(
    () => ({ etat, chargementInitial: false, toasts, mettreAJourEtat, notifier, retirerToast }),
    [etat, toasts, mettreAJourEtat, notifier, retirerToast],
  );
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useSre(): SreContextValue {
  const contexte = useContext(Contexte);
  if (!contexte) throw new Error("useSre doit être utilisé à l’intérieur de SreProvider.");
  return contexte;
}
