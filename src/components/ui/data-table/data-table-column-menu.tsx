import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, Columns3 } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import { cn } from "@/utils";
import { Button } from "@/components/ui";

const SQUIRCLE = "[corner-shape:squircle]";

export function DataTableColumnMenu<TData>({ table }: Readonly<{ table: Table<TData> }>) {
  return (
    <MenuPrimitive.Root>
      <MenuPrimitive.Trigger asChild>
        <Button variant="outline" size="small" className="ml-auto">
          <Columns3 aria-hidden /> Colonnes
        </Button>
      </MenuPrimitive.Trigger>
      <MenuPrimitive.Portal>
        <MenuPrimitive.Content
          align="end"
          sideOffset={6}
          collisionPadding={8}
          className={cn(
            "z-[60] min-w-[190px] overflow-hidden rounded-[12px] bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-border",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            SQUIRCLE,
          )}
        >
          <MenuPrimitive.Label className="px-2.5 pt-2 pb-1 text-[10.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Afficher les colonnes
          </MenuPrimitive.Label>
          {table
            .getAllLeafColumns()
            .filter((column) => column.id !== "__select" && column.getCanHide())
            .map((column) => (
              <MenuPrimitive.CheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(value === true)}
                onSelect={(event) => event.preventDefault()}
                className="relative flex cursor-pointer items-center gap-2 rounded-[8px] py-1.5 pr-2.5 pl-8 text-[12.5px] outline-none select-none data-[highlighted]:bg-accent"
              >
                <span className="absolute left-2.5 grid size-4 place-items-center">
                  <MenuPrimitive.ItemIndicator>
                    <Check className="size-3.5" aria-hidden />
                  </MenuPrimitive.ItemIndicator>
                </span>
                {column.columnDef.meta?.label ??
                  (typeof column.columnDef.header === "string"
                    ? column.columnDef.header
                    : column.id)}
              </MenuPrimitive.CheckboxItem>
            ))}
        </MenuPrimitive.Content>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  );
}
