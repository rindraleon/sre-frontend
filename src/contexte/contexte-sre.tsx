import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { EtatPlateformeSre } from "@/types/sre";
import { REGION_SRE } from "@/utilitaires/constantes-sre";

export type TypeToastSre = "succes" | "erreur" | "avertissement" | "info";
export interface ToastSre {
  id: string;
  message: string;
  type: TypeToastSre;
}
type MiseAJourSre = (etat: EtatPlateformeSre) => EtatPlateformeSre;

interface ContexteSre {
  etat: EtatPlateformeSre;
  chargementInitial: boolean;
  toasts: ToastSre[];
  mettreAJourEtat: (miseAJour: MiseAJourSre) => void;
  notifier: (message: string, type?: TypeToastSre) => void;
}

const Contexte = createContext<ContexteSre | null>(null);
let compteurToastSre = 0;

export function creerEtatVideSre(): EtatPlateformeSre {
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
    parametres: { institution: `SRE · ${REGION_SRE}`, regions: [REGION_SRE] },
  };
}

export function FournisseurSre({ children }: { children: React.ReactNode }) {
  const [etat, definirEtat] = useState<EtatPlateformeSre>(() => creerEtatVideSre());
  const [toasts, definirToasts] = useState<ToastSre[]>([]);

  const notifier = useCallback((message: string, type: TypeToastSre = "succes") => {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${++compteurToastSre}`;
    definirToasts((courants) => [...courants, { id, message, type }]);
    window.setTimeout(
      () => definirToasts((courants) => courants.filter((toast) => toast.id !== id)),
      4500,
    );
  }, []);

  const mettreAJourEtat = useCallback((miseAJour: MiseAJourSre) => {
    definirEtat((courant) => miseAJour(courant));
  }, []);

  const valeur = useMemo(
    () => ({ etat, chargementInitial: false, toasts, mettreAJourEtat, notifier }),
    [etat, toasts, mettreAJourEtat, notifier],
  );
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function utiliserSre(): ContexteSre {
  const contexte = useContext(Contexte);
  if (!contexte) throw new Error("utiliserSre doit être utilisé à l’intérieur de FournisseurSre.");
  return contexte;
}
