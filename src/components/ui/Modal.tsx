import { type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Modale shadcn/ui (Radix Dialog) : focus piégé, Échap, clic extérieur,
 * retour du focus — gérés par Radix. API historique préservée
 * (`ouvert`, `titre`, `description`, `fermer`, `pied`, `largeur`).
 */
export function Modal({
  ouvert,
  titre,
  description,
  fermer,
  children,
  pied,
  largeur = "standard",
}: Readonly<{
  ouvert: boolean;
  titre: string;
  description?: string;
  fermer: () => void;
  children: ReactNode;
  pied?: ReactNode;
  largeur?: "standard" | "large";
}>) {
  return (
    <DialogPrimitive.Root
      open={ouvert}
      onOpenChange={(estOuvert) => {
        if (!estOuvert) fermer();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-black/55 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[95] flex max-h-[calc(100dvh-24px)] w-[calc(100vw-24px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-border bg-card text-card-foreground shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            largeur === "large" ? "max-w-3xl" : "max-w-xl",
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-[15px] font-extrabold text-foreground">
                {titre}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
                  {description}
                </DialogPrimitive.Description>
              ) : (
                <DialogPrimitive.Description className="sr-only">
                  {titre}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Fermer la fenêtre"
            >
              <X size={17} aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
          {pied && (
            <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-3.5">
              {pied}
            </footer>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
