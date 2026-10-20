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

export function SreProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [etat, setEtat] = useState<PlatformState>(() => createEmptyState());
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const retirerToast = useCallback((id: string) => {
    setToasts((courants) => courants.filter((toast) => toast.id !== id));
  }, []);

  const notifier = useCallback(
    (message: string, type: ToastType = "succes", description?: string) => {
      const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${++compteurToastSre}`;
      setToasts((courants) => {
        if (courants.some((toast) => toast.message === message && toast.type === type))
          return courants;
        return [...courants.slice(-3), { id, message, type, description }];
      });
      let duree = 4500;
      if (type === "erreur") duree = 8000;
      else if (type === "avertissement") duree = 6000;
      window.setTimeout(
        () => setToasts((courants) => courants.filter((toast) => toast.id !== id)),
        duree,
      );
    },
    [],
  );

  const mettreAJourEtat = useCallback((miseAJour: MiseAJourSre) => {
    setEtat((courant) => miseAJour(courant));
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
