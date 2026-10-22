import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Updater,
  type VisibilityState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Columns3,
  Minus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { EmptyState } from "./empty-state";
import { Input } from "./input";
import { Select } from "./select";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const SQUIRCLE = "[corner-shape:squircle]";

/** DataTable columns: the label is also reused in the mobile cards. */
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
  /** Filters/main action displayed on the same bar as the search. */
  toolbarActions?: React.ReactNode;
  actionPrimary?: React.ReactNode;
  /** Optional controlled search, used by the existing pages. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Search text derived from data linked to a row (e.g. associated taxpayer). */
  getSearchText?: (row: TData) => string;
  /** Optional controlled pagination (page numbered from 1). */
  page?: number;
  onPageChange?: (page: number) => void;
  rowsPerPage?: number;
  onRowsPerPageChange?: (pageSize: number) => void;
  /** Controlled selected identifiers, useful to business actions. */
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

function Checkbox({
  checked,
  onCheckedChange,
  label,
  onClick,
}: Readonly<{
  checked: boolean | "indeterminate";
  onCheckedChange: (checked: boolean) => void;
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
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

export function DataTableBulkActions<TData>({
  data,
  columns: userColumns,
  searchPlaceholder,
  selectable = false,
  bulkActions,
  onSelectionChange,
  pageSize = 10,
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

  const columnsWithSearch = React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    const withoutSearch = userColumns.filter((column) => column.id !== "__globalSearch");
    if (!searchPlaceholder && searchValue === undefined && !onSearchChange) return withoutSearch;
    return [
      ...withoutSearch,
      {
        id: "__globalSearch",
        header: "",
        accessorFn: (row) => getSearchText?.(row) ?? searchText(row),
        enableSorting: false,
        enableHiding: false,
        meta: { label: "Recherche" },
      },
    ];
  }, [userColumns, searchPlaceholder, searchValue, onSearchChange, getSearchText]);

  const columns = React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!selectable) return columnsWithSearch;
    const select: ColumnDef<TData, unknown> = {
      id: "__select",
      enableSorting: false,
      enableHiding: false,
      meta: { width: 44, label: "Sélection" },
      header: ({ table }) => (
        <Checkbox
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
      cell: ({ row }) => (
        <Checkbox
          label={`Sélectionner la ligne ${row.id}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(value)}
          onClick={(event) => event.stopPropagation()}
        />
      ),
    };
    return [select, ...columnsWithSearch];
  }, [columnsWithSearch, selectable]);

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    if (page !== undefined) onPageChange?.(next.pageIndex + 1);
    else setInternalPagination(next);
    if (rowsPerPage !== undefined) onRowsPerPageChange?.(next.pageSize);
    else if (page !== undefined)
      setInternalPagination((current) => ({ ...current, pageSize: next.pageSize }));
  };

  const handleSearchChange = (updater: Updater<unknown>) => {
    const value = typeof updater === "function" ? updater(search) : updater;
    const next = String(value ?? "");
    if (searchValue === undefined) setInternalSearch(next);
    onSearchChange?.(next);
    if (page !== undefined) onPageChange?.(1);
    else setInternalPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  const handleSelectionChange: OnChangeFn<RowSelectionState> = (updater) => {
    const next = typeof updater === "function" ? updater(rowSelection) : updater;
    if (selectedRowIds !== undefined) {
      onSelectedRowIdsChange?.(Object.keys(next).filter((id) => next[id]));
    } else setInternalRowSelection(next);
  };

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
    .sort()
    .join(",");
  const sortableColumns = table.getAllLeafColumns().filter((column) => column.getCanSort());
  const currentSort = sorting[0];
  const pageCount = Math.max(1, table.getPageCount());
  const currentPage = table.getState().pagination.pageIndex + 1;
  const start = filteredCount ? (currentPage - 1) * table.getState().pagination.pageSize + 1 : 0;
  const end = Math.min(currentPage * table.getState().pagination.pageSize, filteredCount);

  React.useEffect(() => {
    onSelectionChange?.(selectedRows);
    // Only notify the parent when the selected identifiers actually change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  return (
    <div className={cn("grid min-w-0 gap-3", className)}>
      {(searchPlaceholder ||
        toolbarActions ||
        actionPrimary ||
        columnToggle ||
        selectedRows.length > 0) && (
        <div className="layro-data-table__toolbar">
          {searchPlaceholder && (
            <label className="layro-data-table__search">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <Input
                type="search"
                role="searchbox"
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                className="h-8 min-w-0 border-0 bg-transparent px-0 shadow-none ring-0 focus-visible:ring-0"
              />
            </label>
          )}
          <span className="layro-data-table__count" aria-live="polite">
            {filteredCount.toLocaleString("fr-FR")} résultat{filteredCount === 1 ? "" : "s"}
          </span>
          {toolbarActions && <div className="layro-data-table__filters">{toolbarActions}</div>}
          {selectedRows.length > 0 && (
            <div className="layro-data-table__bulk" aria-live="polite">
              <span>
                {selectedRows.length} sélectionné{selectedRows.length === 1 ? "" : "s"}
              </span>
              {bulkActions?.(selectedRows)}
            </div>
          )}
          {columnToggle && (
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
          )}
          {actionPrimary && <div className="layro-data-table__primary">{actionPrimary}</div>}
        </div>
      )}

      {rows.length > 0 && (selectable || sortableColumns.length > 0) && (
        <div className="table-mobile-controls-sre">
          {selectable && (
            <label className="table-mobile-selection-sre">
              <Checkbox
                label="Sélectionner toute cette page"
                checked={
                  table.getIsAllPageRowsSelected()
                    ? true
                    : table.getIsSomePageRowsSelected()
                      ? "indeterminate"
                      : false
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(value)}
              />
              <span>Sélectionner toute la page</span>
            </label>
          )}
          {sortableColumns.length > 0 && (
            <div className="table-mobile-sort-sre">
              <label>
                <span>Trier par</span>
                <Select
                  aria-label="Trier le tableau par colonne"
                  value={currentSort?.id ?? ""}
                  onChange={(event) => {
                    const id = event.target.value;
                    setSorting(id ? [{ id, desc: false }] : []);
                    if (page !== undefined) onPageChange?.(1);
                    else setInternalPagination((current) => ({ ...current, pageIndex: 0 }));
                  }}
                >
                  <option value="">Ordre initial</option>
                  {sortableColumns.map((column) => (
                    <option key={column.id} value={column.id}>
                      {headerText(column)}
                    </option>
                  ))}
                </Select>
              </label>
              <Button
                variant="outline"
                size="small"
                aria-label={currentSort?.desc ? "Tri décroissant" : "Tri croissant"}
                disabled={!currentSort}
                onClick={() =>
                  setSorting((current) =>
                    current.length ? [{ ...current[0], desc: !current[0].desc }] : current,
                  )
                }
              >
                {currentSort?.desc ? <ArrowDown aria-hidden /> : <ArrowUp aria-hidden />}
                <span>{currentSort?.desc ? "Décroissant" : "Croissant"}</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="layro-data-table__empty">
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
        <div className="responsive-table-cards-sre overflow-x-auto rounded-[14px] bg-card ring-1 ring-border">
          <table
            aria-label={label}
            className="responsive-table-cards-sre__table w-full border-collapse text-[13px]"
          >
            <thead>
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id} className="border-b border-border">
                  {group.headers.map((header) => {
                    if (header.column.id === "__globalSearch") return null;
                    const meta = header.column.columnDef.meta;
                    const sorted = header.column.getIsSorted();
                    const canSort = header.column.getCanSort();
                    const align = meta?.align ?? "left";
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        style={meta?.width ? { width: meta.width } : undefined}
                        aria-sort={
                          sorted === "asc"
                            ? "ascending"
                            : sorted === "desc"
                              ? "descending"
                              : canSort
                                ? "none"
                                : undefined
                        }
                        className={cn(
                          "h-10 px-3 text-[11.5px] font-medium whitespace-nowrap text-muted-foreground",
                          align === "right"
                            ? "text-right"
                            : align === "center"
                              ? "text-center"
                              : "text-left",
                        )}
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className={cn(
                              "-mx-1.5 inline-flex cursor-pointer items-center gap-1 rounded-[6px] px-1.5 py-0.5 hover:bg-accent hover:text-foreground",
                              FOCUS,
                              sorted && "text-foreground",
                              align === "right" && "flex-row-reverse",
                            )}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {sorted === "asc" ? (
                              <ArrowUp className="size-3.5" aria-hidden />
                            ) : sorted === "desc" ? (
                              <ArrowDown className="size-3.5" aria-hidden />
                            ) : (
                              <ChevronsUpDown className="size-3.5 opacity-50" aria-hidden />
                            )}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
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
                    const cellLabel =
                      cell.column.columnDef.meta?.label ??
                      (typeof cell.column.columnDef.header === "string"
                        ? cell.column.columnDef.header
                        : cell.column.id === "__select"
                          ? "Sélection"
                          : cell.column.id);
                    return (
                      <td
                        key={cell.id}
                        data-label={cellLabel}
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
      )}

      {pageSize > 0 && table.getPageCount() > 1 && (
        <div className="layro-data-table__pagination">
          <span className="layro-data-table__range" aria-live="polite">
            {filteredCount === 0 ? "0 résultat" : `${start}–${end} sur ${filteredCount}`}
          </span>
          <label className="layro-data-table__page-size">
            Lignes par page
            <Select
              aria-label="Lignes par page"
              value={table.getState().pagination.pageSize}
              onChange={(event) => table.setPageSize(Number(event.target.value))}
            >
              {[10, 20, 50].map((size) => (
                <option value={size} key={size}>
                  {size}
                </option>
              ))}
            </Select>
          </label>
          <div className="layro-data-table__page-controls">
            <Button
              variant="ghost"
              size="small"
              className="h-8 w-8 !px-0"
              aria-label="Page précédente"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft aria-hidden />
            </Button>
            <span>
              Page {currentPage} sur {pageCount}
            </span>
            <Button
              variant="ghost"
              size="small"
              className="h-8 w-8 !px-0"
              aria-label="Page suivante"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function headerText<TData>(column: { id: string; columnDef: ColumnDef<TData, unknown> }): string {
  const header = column.columnDef.header;
  return column.columnDef.meta?.label ?? (typeof header === "string" ? header : column.id);
}

export type { ColumnDef };
