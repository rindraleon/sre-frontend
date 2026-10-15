import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CoreSpinLoader } from "./core-spin-loader";

/**
 * Bouton shadcn/ui (cva) — design SRE via les variables du thème.
 * L'API historique du kit est préservée : `variante`, `taille`, `chargement`.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[12.5px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-55 [&_svg]:shrink-0",
  {
    variants: {
      variante: {
        primaire: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        secondaire: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        contour:
          "border border-input bg-card text-foreground shadow-sm hover:bg-muted hover:text-foreground",
        danger: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        fantome: "text-foreground hover:bg-muted",
        clair: "bg-white/15 text-white hover:bg-white/25",
      },
      taille: {
        normal: "min-h-9 px-4 py-2",
        petit: "min-h-8 rounded-md px-3 text-xs",
      },
    },
    defaultVariants: { variante: "primaire", taille: "normal" },
  },
);

export type ButtonProps = Readonly<{
  children: ReactNode;
  /** Affiche le spinner, désactive le bouton et signale l'opération en cours. */
  chargement?: boolean;
}> &
  VariantProps<typeof buttonVariants> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variante = "primaire",
      taille = "normal",
      chargement = false,
      disabled = false,
      className = "",
      type = "button",
      ...reste
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variante, taille }), className)}
      disabled={disabled || chargement}
      aria-busy={chargement || undefined}
      {...reste}
    >
      {chargement && <CoreSpinLoader libelle="Traitement en cours" taille={14} compact />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
