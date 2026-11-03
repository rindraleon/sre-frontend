import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";

export interface TableColumn<T> {
  id: string;
  title: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
}

export function toTanstackColumns<T>(columns: TableColumn<T>[]): ColumnDef<T, unknown>[] {
  return columns.map((column) => ({
    id: column.id,
    header: column.title,
    accessorFn: (row) => column.sortValue?.(row) ?? "",
    cell: ({ row }) => column.render(row.original),
    enableSorting: Boolean(column.sortValue),
    enableGlobalFilter: false,
    meta: {
      label: column.title,
      ...(column.className?.includes("text-right") ? { align: "right" as const } : {}),
      ...(column.className?.includes("text-center") ? { align: "center" as const } : {}),
    },
  }));
}
