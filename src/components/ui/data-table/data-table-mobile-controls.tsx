import { ArrowDown, ArrowUp } from "lucide-react";
import type { Column, SortingState, Table } from "@tanstack/react-table";
import { Button } from "@/components/ui";
import { Select } from "@/components/ui";
import { SelectionCheckbox } from "./selection-checkbox";
import { columnLabel } from "./column-label";
import {
  TABLE_MOBILE_CONTROLS_CLASS,
  TABLE_MOBILE_SELECTION_CLASS,
  TABLE_MOBILE_SORT_CLASS,
} from "@/components/ui";

export function DataTableMobileControls<TData>({
  table,
  selectable,
  sortableColumns,
  sorting,
  onSortingChange,
  onPageReset,
}: Readonly<{
  table: Table<TData>;
  selectable: boolean;
  sortableColumns: Column<TData, unknown>[];
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  onPageReset: () => void;
}>) {
  const pageSelectionChecked = table.getIsAllPageRowsSelected()
    ? true
    : table.getIsSomePageRowsSelected()
      ? "indeterminate"
      : false;
  const currentSort = sorting[0];

  return (
    <div className={TABLE_MOBILE_CONTROLS_CLASS}>
      {selectable && (
        <label className={TABLE_MOBILE_SELECTION_CLASS}>
          <SelectionCheckbox
            label="Sélectionner toute cette page"
            checked={pageSelectionChecked}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(value)}
          />
          <span>Sélectionner toute la page</span>
        </label>
      )}
      {sortableColumns.length > 0 && (
        <div className={TABLE_MOBILE_SORT_CLASS}>
          <label>
            <span>Trier par</span>
            <Select
              aria-label="Trier le tableau par colonne"
              value={currentSort?.id ?? ""}
              onChange={(event) => {
                const id = event.target.value;
                onSortingChange(id ? [{ id, desc: false }] : []);
                onPageReset();
              }}
            >
              <option value="">Ordre initial</option>
              {sortableColumns.map((column) => (
                <option key={column.id} value={column.id}>
                  {columnLabel(column)}
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
              onSortingChange(
                sorting.length ? [{ ...sorting[0], desc: !sorting[0].desc }] : sorting,
              )
            }
          >
            {currentSort?.desc ? <ArrowDown aria-hidden /> : <ArrowUp aria-hidden />}
            <span>{currentSort?.desc ? "Décroissant" : "Croissant"}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
