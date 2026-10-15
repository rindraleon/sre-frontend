import { type ReactNode } from "react";
import { Card } from "./Card";

/** État vide sur Card shadcn/ui (bordure en pointillés). */
export function EmptyState({
  titre,
  description,
  action,
}: Readonly<{ titre: string; description: string; action?: ReactNode }>) {
  return (
    <Card className="flex flex-col items-center gap-2 border-dashed px-6 py-10 text-center shadow-none">
      <div
        aria-hidden="true"
        className="grid h-11 w-11 place-items-center rounded-full bg-muted text-lg text-muted-foreground"
      >
        ⌕
      </div>
      <strong className="text-sm font-bold text-foreground">{titre}</strong>
      <p className="max-w-md text-[12.5px] leading-relaxed text-muted-foreground">{description}</p>
      {action}
    </Card>
  );
}
