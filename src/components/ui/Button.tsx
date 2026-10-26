import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CoreSpinLoader } from "./core-spin-loader";

/** shadcn/ui button (cva). */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[12.5px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-55 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-input bg-card text-foreground shadow-sm hover:bg-muted hover:text-foreground",
        danger: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        ghost: "text-foreground hover:bg-muted",
        light: "bg-white/15 text-white hover:bg-white/25",
      },
      size: {
        normal: "min-h-9 px-4 py-2",
        small: "min-h-8 rounded-md px-3 text-xs",
      },
    },
    defaultVariants: { variant: "primary", size: "normal" },
  },
);

export type ButtonProps = Readonly<{
  children: ReactNode;
  /** Shows the spinner, disables the button and signals the running operation. */
  loading?: boolean;
}> &
  VariantProps<typeof buttonVariants> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "normal",
      loading = false,
      disabled = false,
      className = "",
      type = "button",
      ...rest
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <CoreSpinLoader label="Traitement en cours" size={14} compact />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
