import * as React from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Updater,
  type VisibilityState,
} from "@tanstack/react-table";
import { cn } from "@/utils";
import { EmptyState } from "@/components/ui";
import { DATA_TABLE_EMPTY_CLASS } from "@/components/ui";
import { SelectionCheckbox, renderSelectionCell } from "./selection-checkbox";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTableMobileControls } from "./data-table-mobile-controls";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableView } from "./data-table-view";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "right" | "center";
    width?: number;
    label?: string;
  }
}

export interface DataTableBulkActionsProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  searchPlaceholder?: string;
  selectable?: boolean;
  bulkActions?: (rows: TData[]) => React.ReactNode;
  onSelectionChange?: (rows: TData[]) => void;
  pageSize?: number;
  columnToggle?: boolean;
  getRowId?: (row: TData, index: number) => string;
  onRowClick?: (row: TData) => void;
  density?: "compact" | "comfortable";
  empty?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  label?: string;
  className?: string;
  toolbarActions?: React.ReactNode;
  actionPrimary?: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  getSearchText?: (row: TData) => string;
  page?: number;
  onPageChange?: (page: number) => void;
  rowsPerPage?: number;
  onRowsPerPageChange?: (pageSize: number) => void;
  selectedRowIds?: ReadonlySet<string>;
  onSelectedRowIdsChange?: (ids: string[]) => void;
}

function searchText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(searchText).join(" ");
  if (typeof value === "object") return Object.values(value).map(searchText).join(" ");
  return "";
}

export function DataTableBulkActions<TData>({
  data,
  columns: userColumns,
  searchPlaceholder,
  selectable = false,
  bulkActions,
  onSelectionChange,
  pageSize = 5,
  columnToggle = false,
  getRowId,
  onRowClick,
  density = "comfortable",
  empty,
  emptyTitle,
  emptyDescription,
  label = "Table",
  className,
  toolbarActions,
  actionPrimary,
  searchValue,
  onSearchChange,
  getSearchText,
  page,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  selectedRowIds,
  onSelectedRowIdsChange,
}: Readonly<DataTableBulkActionsProps<TData>>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [internalSearch, setInternalSearch] = React.useState("");
  const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({});
  const [visibility, setVisibility] = React.useState<VisibilityState>({ __globalSearch: false });
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const search = searchValue ?? internalSearch;
  const pagination: PaginationState =
    page !== undefined
      ? { pageIndex: Math.max(0, page - 1), pageSize: rowsPerPage ?? internalPagination.pageSize }
      : internalPagination;
  const rowSelection: RowSelectionState =
    selectedRowIds !== undefined
      ? Object.fromEntries(Array.from(selectedRowIds, (id) => [id, true]))
      : internalRowSelection;

  const handleSearchChange = React.useCallback(
    (updater: Updater<unknown>) => {
      const value = typeof updater === "function" ? updater(search) : updater;
      const next = String(value ?? "");
      if (searchValue === undefined) setInternalSearch(next);
      onSearchChange?.(next);
      if (page !== undefined) onPageChange?.(1);
      else setInternalPagination((current) => ({ ...current, pageIndex: 0 }));
    },
    [search, searchValue, onSearchChange, page, onPageChange],
  );

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    if (page !== undefined) onPageChange?.(next.pageIndex + 1);
    else setInternalPagination(next);
    if (rowsPerPage !== undefined) onRowsPerPageChange?.(next.pageSize);
    else if (page !== undefined)
      setInternalPagination((current) => ({ ...current, pageSize: next.pageSize }));
  };

  const handleSelectionChange: OnChangeFn<RowSelectionState> = (updater) => {
    const next = typeof updater === "function" ? updater(rowSelection) : updater;
    if (selectedRowIds !== undefined) {
      onSelectedRowIdsChange?.(Object.keys(next).filter((id) => next[id]));
    } else setInternalRowSelection(next);
  };

  const columns = React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    const withoutSearch = userColumns.filter((column) => column.id !== "__globalSearch");
    const withSearch =
      !searchPlaceholder && searchValue === undefined && !onSearchChange
        ? withoutSearch
        : [
            ...withoutSearch,
            {
              id: "__globalSearch",
              header: "",
              accessorFn: (row: TData) => getSearchText?.(row) ?? searchText(row),
              enableSorting: false,
              enableHiding: false,
              meta: { label: "Recherche" },
            } satisfies ColumnDef<TData, unknown>,
          ];
    if (!selectable) return withSearch;
    const select: ColumnDef<TData, unknown> = {
      id: "__select",
      enableSorting: false,
      enableHiding: false,
      meta: { width: 44, label: "Sélection" },
      header: ({ table }) => (
        <SelectionCheckbox
          label="Sélectionner toutes les lignes de cette page"
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(value)}
        />
      ),
      cell: renderSelectionCell,
    };
    return [select, ...withSearch];
  }, [userColumns, searchPlaceholder, searchValue, onSearchChange, getSearchText, selectable]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: search,
      rowSelection,
      columnVisibility: visibility,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: handleSearchChange,
    onRowSelectionChange: handleSelectionChange,
    onColumnVisibilityChange: setVisibility,
    onPaginationChange: handlePaginationChange,
    getRowId,
    enableRowSelection: selectable,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(pageSize > 0 ? { getPaginationRowModel: getPaginationRowModel() } : {}),
  });

  const rows = table.getRowModel().rows;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
  const selectedKey = Object.keys(rowSelection)
    .filter((id) => rowSelection[id])
    .sort((a, b) => a.localeCompare(b))
    .join(",");
  const sortableColumns = table.getAllLeafColumns().filter((column) => column.getCanSort());

  React.useEffect(() => {
    onSelectionChange?.(selectedRows);
  }, [selectedKey]);

  const resetToFirstPage = () => {
    if (page !== undefined) onPageChange?.(1);
    else setInternalPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  const showToolbar =
    Boolean(searchPlaceholder || toolbarActions || actionPrimary || columnToggle) ||
    selectedRows.length > 0;

  return (
    <div className={cn("grid min-w-0 gap-3", className)}>
      {showToolbar && (
        <DataTableToolbar
          table={table}
          search={search}
          searchPlaceholder={searchPlaceholder}
          filteredCount={filteredCount}
          onSearchChange={handleSearchChange}
          toolbarActions={toolbarActions}
          bulkActions={bulkActions}
          selectedRows={selectedRows}
          columnToggle={columnToggle}
          actionPrimary={actionPrimary}
        />
      )}

      {rows.length > 0 && (selectable || sortableColumns.length > 0) && (
        <DataTableMobileControls
          table={table}
          selectable={selectable}
          sortableColumns={sortableColumns}
          sorting={sorting}
          onSortingChange={setSorting}
          onPageReset={resetToFirstPage}
        />
      )}

      {rows.length === 0 ? (
        <div className={DATA_TABLE_EMPTY_CLASS}>
          {empty ?? (
            <EmptyState
              title={emptyTitle ?? (search ? "Aucun résultat" : "Aucune donnée")}
              description={
                emptyDescription ??
                (search
                  ? `Aucune ligne ne correspond à « ${search} ».`
                  : "Les données apparaîtront ici.")
              }
            />
          )}
        </div>
      ) : (
        <DataTableView table={table} label={label} density={density} onRowClick={onRowClick} />
      )}

      {pageSize > 0 && (rows.length > 0 || filteredCount > 0) && (
        <DataTablePagination table={table} filteredCount={filteredCount} />
      )}
    </div>
  );
}

export type { ColumnDef };
