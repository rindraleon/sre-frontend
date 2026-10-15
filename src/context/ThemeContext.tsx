import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "clair" | "sombre";

const cleTheme = "sre-theme";

/** Thème initial : préférence conservée, sinon préférence système, sinon clair. */
export function getInitialTheme(): Theme {
  try {
    const conserve = window.localStorage.getItem(cleTheme);
    if (conserve === "clair" || conserve === "sombre") return conserve;
  } catch {
    /* stockage indisponible : on retombe sur la préférence système */
  }
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "sombre" : "clair";
  } catch {
    return "clair";
  }
}

function appliquerTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === "sombre" ? "dark" : "light";
}

interface ContexteThemeSre {
  theme: Theme;
  basculerTheme: () => void;
  definirTheme: (theme: Theme) => void;
}

const Contexte = createContext<ContexteThemeSre | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, definirThemeEtat] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    appliquerTheme(theme);
    try {
      window.localStorage.setItem(cleTheme, theme);
    } catch {
      /* le thème reste appliqué pour la session en cours */
    }
  }, [theme]);

  const definirTheme = useCallback((nouveau: Theme) => definirThemeEtat(nouveau), []);
  const basculerTheme = useCallback(
    () => definirThemeEtat((courant) => (courant === "sombre" ? "clair" : "sombre")),
    [],
  );

  const valeur = useMemo(
    () => ({ theme, basculerTheme, definirTheme }),
    [theme, basculerTheme, definirTheme],
  );
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useTheme(): ContexteThemeSre {
  const contexte = useContext(Contexte);
  if (!contexte) throw new Error("useTheme doit être utilisé à l’intérieur de ThemeProvider.");
  return contexte;
}
