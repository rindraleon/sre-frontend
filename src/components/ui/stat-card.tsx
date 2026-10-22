import { type LucideIcon } from "lucide-react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

const COLORS: Record<string, string> = {
  blue: "bg-sky-100 text-sky-700",
  green: "bg-emerald-100 text-emerald-700",
  orange: "bg-amber-100 text-amber-700",
  violet: "bg-violet-100 text-violet-700",
  red: "bg-red-100 text-red-700",
};

/** Statistics card built on the shadcn/ui Card. */
export function StatCard({
  title,
  value,
  note,
  icon: Icon,
  color = "blue",
}: Readonly<{
  title: string;
  value: string | number;
  note?: string;
  icon: LucideIcon;
  color?: "blue" | "green" | "orange" | "violet" | "red";
}>) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span
        className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", COLORS[color])}
      >
        <Icon size={18} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <span className="block truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
        <strong className="block truncate text-lg font-extrabold text-foreground">{value}</strong>
        {note && <small className="block truncate text-muted-foreground">{note}</small>}
      </div>
    </Card>
  );
}
