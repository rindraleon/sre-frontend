import { type LucideIcon } from "lucide-react";
import { Card } from "./Card";
import { cn } from "@/lib/utils";

const COULEURS: Record<string, string> = {
  bleu: "bg-sky-100 text-sky-700",
  vert: "bg-emerald-100 text-emerald-700",
  orange: "bg-amber-100 text-amber-700",
  violet: "bg-violet-100 text-violet-700",
  rouge: "bg-red-100 text-red-700",
};

/** Carte statistique sur Card shadcn/ui. */
export function StatCard({
  titre,
  valeur,
  note,
  icone: Icone,
  couleur = "bleu",
}: Readonly<{
  titre: string;
  valeur: string | number;
  note?: string;
  icone: LucideIcon;
  couleur?: "bleu" | "vert" | "orange" | "violet" | "rouge";
}>) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span
        className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", COULEURS[couleur])}
      >
        <Icone size={18} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <span className="block truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {titre}
        </span>
        <strong className="block truncate text-lg font-extrabold text-foreground">{valeur}</strong>
        {note && <small className="block truncate text-muted-foreground">{note}</small>}
      </div>
    </Card>
  );
}
