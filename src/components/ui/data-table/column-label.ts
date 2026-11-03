import type { Column, ColumnDef } from "@tanstack/react-table";

export function columnLabel<TData>(column: {
  id: string;
  columnDef: ColumnDef<TData, unknown>;
}): string {
  const header = column.columnDef.header;
  return column.columnDef.meta?.label ?? (typeof header === "string" ? header : column.id);
}

export type { Column };
