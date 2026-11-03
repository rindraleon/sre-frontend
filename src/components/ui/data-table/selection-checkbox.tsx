import type { MouseEventHandler } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import type { CellContext } from "@tanstack/react-table";
import { cn } from "@/utils";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SelectionCheckbox({
  checked,
  onCheckedChange,
  label,
  onClick,
}: Readonly<{
  checked: boolean | "indeterminate";
  onCheckedChange: (checked: boolean) => void;
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}>) {
  return (
    <CheckboxPrimitive.Root
      aria-label={label}
      checked={checked}
      onCheckedChange={(value) => onCheckedChange(value === true)}
      onClick={onClick}
      className={cn(
        "peer grid size-4 shrink-0 cursor-pointer place-items-center rounded-[5px] bg-card ring-1 ring-inset ring-input transition-colors",
        "hover:ring-foreground/35 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        FOCUS,
      )}
    >
      <CheckboxPrimitive.Indicator className="grid place-items-center">
        {checked === "indeterminate" ? (
          <Minus className="size-3" strokeWidth={3} aria-hidden />
        ) : (
          <Check className="size-3" strokeWidth={3} aria-hidden />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export function renderSelectionCell<TData>({ row }: CellContext<TData, unknown>) {
  return (
    <SelectionCheckbox
      label={`Sélectionner la ligne ${row.id}`}
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(value)}
      onClick={(event) => event.stopPropagation()}
    />
  );
}
