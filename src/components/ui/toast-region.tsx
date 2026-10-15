import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { useSre } from "@/context/SreContext";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  succes: "border-emerald-300 bg-emerald-50 text-emerald-900",
  erreur: "border-red-300 bg-red-50 text-red-900",
  avertissement: "border-amber-300 bg-amber-50 text-amber-900",
  info: "border-sky-300 bg-sky-50 text-sky-900",
};

/**
 * Toasts shadcn/ui (Radix Toast) alimentés par le contexte existant :
 * fermeture manuelle, aucun toast par frappe, succès lié au résultat réel.
 */
export function ToastRegion() {
  const { toasts, retirerToast } = useSre();
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map((toast) => (
        <ToastPrimitive.Root
          key={toast.id}
          duration={6500}
          onOpenChange={(ouvert) => {
            if (!ouvert) retirerToast(toast.id);
          }}
          className={cn(
            "pointer-events-auto flex items-start gap-2.5 rounded-lg border px-3.5 py-3 shadow-lg data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2",
            STYLES[toast.type] ?? STYLES.info,
          )}
          role={toast.type === "erreur" ? "alert" : undefined}
        >
          <span
            aria-hidden="true"
            className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-current/10 text-[11px] font-black"
          >
            {toast.type === "succes" ? "✓" : toast.type === "erreur" ? "!" : "i"}
          </span>
          <div className="min-w-0 flex-1">
            <ToastPrimitive.Title className="text-[12.5px] font-bold leading-snug">
              {toast.message}
            </ToastPrimitive.Title>
            {toast.description && (
              <ToastPrimitive.Description className="mt-0.5 text-xs leading-relaxed opacity-80">
                {toast.description}
              </ToastPrimitive.Description>
            )}
          </div>
          <ToastPrimitive.Close
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Fermer la notification"
          >
            <X size={14} aria-hidden="true" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="pointer-events-none fixed right-3 top-3 z-[200] flex w-[min(360px,calc(100vw-24px))] flex-col gap-2 outline-none" />
    </ToastPrimitive.Provider>
  );
}
