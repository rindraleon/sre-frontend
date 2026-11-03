import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui";
import {
  DATA_TABLE_BULK_CLASS,
  DATA_TABLE_COUNT_CLASS,
  DATA_TABLE_FILTERS_CLASS,
  DATA_TABLE_PRIMARY_CLASS,
  DATA_TABLE_SEARCH_CLASS,
  DATA_TABLE_TOOLBAR_CLASS,
} from "@/components/ui";
import { DataTableColumnMenu } from "./data-table-column-menu";
import type { Table } from "@tanstack/react-table";

export function DataTableToolbar<TData>({
  table,
  search,
  searchPlaceholder,
  filteredCount,
  onSearchChange,
  toolbarActions,
  bulkActions,
  selectedRows,
  columnToggle,
  actionPrimary,
}: Readonly<{
  table: Table<TData>;
  search: string;
  searchPlaceholder?: string;
  filteredCount: number;
  onSearchChange: (value: string) => void;
  toolbarActions?: ReactNode;
  bulkActions?: (rows: TData[]) => ReactNode;
  selectedRows: TData[];
  columnToggle: boolean;
  actionPrimary?: ReactNode;
}>) {
  return (
    <div className={DATA_TABLE_TOOLBAR_CLASS}>
      {searchPlaceholder && (
        <label className={DATA_TABLE_SEARCH_CLASS}>
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            role="searchbox"
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-8 min-w-0 border-0 bg-transparent px-0 shadow-none ring-0 focus-visible:ring-0"
          />
        </label>
      )}
      <span className={DATA_TABLE_COUNT_CLASS} aria-live="polite">
        {filteredCount.toLocaleString("fr-FR")} résultat{filteredCount === 1 ? "" : "s"}
      </span>
      {toolbarActions && <div className={DATA_TABLE_FILTERS_CLASS}>{toolbarActions}</div>}
      {selectedRows.length > 0 && (
        <div className={DATA_TABLE_BULK_CLASS} aria-live="polite">
          <span>
            {selectedRows.length} sélectionné{selectedRows.length === 1 ? "" : "s"}
          </span>
          {bulkActions?.(selectedRows)}
        </div>
      )}
      {columnToggle && <DataTableColumnMenu table={table} />}
      {actionPrimary && <div className={DATA_TABLE_PRIMARY_CLASS}>{actionPrimary}</div>}
    </div>
  );
}
