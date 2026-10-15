export { cn } from "@/lib/utils";

/** Compatibilité avec l'ancien utilitaire du kit (préférer `cn`). */
export function mergeClasses(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
