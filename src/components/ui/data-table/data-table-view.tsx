import { flexRender, type Table } from "@tanstack/react-table";
import { cn } from "@/utils";
import { DataTableHeader } from "./data-table-header";
import { TABLE_CARDS_CLASS } from "@/components/ui";

export function DataTableView<TData>({
  table,
  label,
  density,
  onRowClick,
}: Readonly<{
  table: Table<TData>;
  label: string;
  density: "compact" | "comfortable";
  onRowClick?: (row: TData) => void;
}>) {
  const rows = table.getRowModel().rows;
  return (
    <div className={cn(TABLE_CARDS_CLASS, "rounded-[14px] bg-card ring-1 ring-border")}>
      <table aria-label={label} className="w-full border-collapse text-[13px]">
        <DataTableHeader headerGroups={table.getHeaderGroups()} />
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              data-state={row.getIsSelected() ? "selected" : undefined}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              className={cn(
                "border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/50 data-[state=selected]:bg-accent/70",
                onRowClick && "cursor-pointer",
              )}
            >
              {row.getVisibleCells().map((cell) => {
                if (cell.column.id === "__globalSearch") return null;
                const align = cell.column.columnDef.meta?.align ?? "left";
                let fallbackLabel = cell.column.id;
                if (typeof cell.column.columnDef.header === "string") {
                  fallbackLabel = cell.column.columnDef.header;
                } else if (cell.column.id === "__select") {
                  fallbackLabel = "Sélection";
                }
                return (
                  <td
                    key={cell.id}
                    data-label={cell.column.columnDef.meta?.label ?? fallbackLabel}
                    className={cn(
                      density === "compact" ? "px-3 py-1.5" : "px-3 py-2.5",
                      "align-middle text-foreground",
                      align === "right"
                        ? "text-right tabular-nums"
                        : align === "center"
                          ? "text-center"
                          : "",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
