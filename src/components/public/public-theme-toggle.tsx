import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function PublicThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "sombre";
  return (
    <button
      type="button"
      className="public-theme-toggle-sre"
      onClick={toggleTheme}
      aria-label={isDark ? "Activer le thème clair" : "Activer le thème sombre"}
      title={isDark ? "Thème clair" : "Thème sombre"}
    >
      {isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
    </button>
  );
}
