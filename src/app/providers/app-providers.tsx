import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { SreProvider } from "@/context/SreContext";
import { ThemeProvider } from "@/context/ThemeContext";

/** Composition des fournisseurs globaux; BrowserRouter reste au point d'entrée. */
export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ThemeProvider>
      <SreProvider>
        <AuthProvider>{children}</AuthProvider>
      </SreProvider>
    </ThemeProvider>
  );
}
