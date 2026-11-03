import { STORAGE_KEYS } from "@/config";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "clair" | "sombre";

const themeKey = STORAGE_KEYS.theme;

function readPersistedTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(themeKey);
    return stored === "clair" || stored === "sombre" ? stored : null;
  } catch (cause) {
    console.warn("Préférence de thème illisible.", cause);
    return null;
  }
}

export function getInitialTheme(): Theme {
  const stored = readPersistedTheme();
  if (stored) return stored;
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "sombre" : "clair";
  } catch (cause) {
    console.warn("Préférence système de thème indisponible.", cause);
    return "clair";
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "sombre");
  document.documentElement.style.colorScheme = theme === "sombre" ? "dark" : "light";
}

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const Context = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());
  const [explicitPreference, setExplicitPreference] = useState(() => readPersistedTheme() !== null);

  useEffect(() => {
    applyTheme(theme);
    if (!explicitPreference) return;
    try {
      window.localStorage.setItem(themeKey, theme);
    } catch (cause) {
      console.warn("Préférence de thème non enregistrée.", cause);
    }
  }, [theme, explicitPreference]);

  useEffect(() => {
    if (explicitPreference) return;
    const requestMedia = window.matchMedia("(prefers-color-scheme: dark)");
    const followSystemPreference = (event: MediaQueryListEvent) => {
      setThemeState(event.matches ? "sombre" : "clair");
    };
    requestMedia.addEventListener("change", followSystemPreference);
    return () => requestMedia.removeEventListener("change", followSystemPreference);
  }, [explicitPreference]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setExplicitPreference(true);
    setThemeState(nextTheme);
  }, []);
  const toggleTheme = useCallback(() => {
    setExplicitPreference(true);
    setThemeState((current) => (current === "sombre" ? "clair" : "sombre"));
  }, []);

  const value = useMemo(
    (): ThemeContextValue => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(Context);
  if (!context) throw new Error("useTheme doit être utilisé à l’intérieur de ThemeProvider.");
  return context;
}
