import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "clair" | "sombre";

const cleTheme = "sre-theme";

function lireThemePersistant(): Theme | null {
  try {
    const conserve = window.localStorage.getItem(cleTheme);
    return conserve === "clair" || conserve === "sombre" ? conserve : null;
  } catch {
    return null;
  }
}

/** Thème initial : préférence explicite, sinon préférence système, sinon clair. */
export function getInitialTheme(): Theme {
  const conserve = lireThemePersistant();
  if (conserve) return conserve;
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "sombre" : "clair";
  } catch {
    return "clair";
  }
}

function appliquerTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "sombre");
  document.documentElement.style.colorScheme = theme === "sombre" ? "dark" : "light";
}

interface ContexteThemeSre {
  theme: Theme;
  basculerTheme: () => void;
  definirTheme: (theme: Theme) => void;
}

const Contexte = createContext<ContexteThemeSre | null>(null);

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const [preferenceExplicite, setPreferenceExplicite] = useState(
    () => lireThemePersistant() !== null,
  );

  useEffect(() => {
    appliquerTheme(theme);
    if (!preferenceExplicite) return;
    try {
      window.localStorage.setItem(cleTheme, theme);
    } catch {
      /* le thème reste appliqué pour la session en cours */
    }
  }, [theme, preferenceExplicite]);

  useEffect(() => {
    if (preferenceExplicite) return;
    const requeteMedia = window.matchMedia("(prefers-color-scheme: dark)");
    const suivrePreferenceSysteme = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? "sombre" : "clair");
    };
    requeteMedia.addEventListener("change", suivrePreferenceSysteme);
    return () => requeteMedia.removeEventListener("change", suivrePreferenceSysteme);
  }, [preferenceExplicite]);

  const definirTheme = useCallback((nouveau: Theme) => {
    setPreferenceExplicite(true);
    setTheme(nouveau);
  }, []);
  const basculerTheme = useCallback(() => {
    setPreferenceExplicite(true);
    setTheme((courant) => (courant === "sombre" ? "clair" : "sombre"));
  }, []);

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
