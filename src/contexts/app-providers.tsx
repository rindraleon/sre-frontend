import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { SreProvider } from "@/contexts/sre-context";
import { ThemeProvider } from "@/contexts/theme-context";

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ThemeProvider>
      <SreProvider>
        <AuthProvider>{children}</AuthProvider>
      </SreProvider>
    </ThemeProvider>
  );
}
