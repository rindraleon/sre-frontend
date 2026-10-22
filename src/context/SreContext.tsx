import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { PlatformState } from "@/types";
import { SRE_REGION } from "@/utils/constants";

export type ToastType = "success" | "error" | "warning" | "info";
export interface ToastItem {
  id: string;
  message: string;
  description?: string;
  type: ToastType;
}
type SreStateUpdater = (state: PlatformState) => PlatformState;

interface SreContextValue {
  state: PlatformState;
  isInitialLoading: boolean;
  toasts: ToastItem[];
  updateState: (update: SreStateUpdater) => void;
  notify: (message: string, type?: ToastType, description?: string) => void;
  removeToast: (id: string) => void;
}

const Context = createContext<SreContextValue | null>(null);
let counterToastSre = 0;

export function createEmptyState(): PlatformState {
  return {
    version: 1,
    isAdministratorInitialized: false,
    users: [],
    taxpayers: [],
    taxTypes: [],
    obligations: [],
    payments: [],
    paymentDocuments: [],
    notifications: [],
    logsActivity: [],
    settings: { institution: `SRE · ${SRE_REGION}`, regions: [SRE_REGION] },
  };
}

export function SreProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [state, setState] = useState<PlatformState>(() => createEmptyState());
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, type: ToastType = "success", description?: string) => {
      const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${++counterToastSre}`;
      setToasts((current) => {
        if (current.some((toast) => toast.message === message && toast.type === type))
          return current;
        return [...current.slice(-3), { id, message, type, description }];
      });
      let duration = 4500;
      if (type === "error") duration = 8000;
      else if (type === "warning") duration = 6000;
      window.setTimeout(
        () => setToasts((current) => current.filter((toast) => toast.id !== id)),
        duration,
      );
    },
    [],
  );

  const updateState = useCallback((update: SreStateUpdater) => {
    setState((current) => update(current));
  }, []);

  const value = useMemo(
    (): SreContextValue => ({ state, isInitialLoading: false, toasts, updateState, notify, removeToast }),
    [state, toasts, updateState, notify, removeToast],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSre(): SreContextValue {
  const context = useContext(Context);
  if (!context) throw new Error("useSre doit être utilisé à l’intérieur de SreProvider.");
  return context;
}
