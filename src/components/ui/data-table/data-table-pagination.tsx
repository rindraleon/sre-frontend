import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui";
import { Select } from "@/components/ui";
import {
  DATA_TABLE_PAGE_CONTROLS_CLASS,
  DATA_TABLE_PAGE_SIZE_CLASS,
  DATA_TABLE_PAGINATION_CLASS,
  DATA_TABLE_RANGE_CLASS,
} from "@/components/ui";

const PAGE_SIZES = [5, 10, 20, 50];

export function DataTablePagination<TData>({
  table,
  filteredCount,
}: Readonly<{ table: Table<TData>; filteredCount: number }>) {
  const pageSize = table.getState().pagination.pageSize;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageCount = Math.max(1, table.getPageCount());
  const start = filteredCount ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, filteredCount);

  return (
    <div className={DATA_TABLE_PAGINATION_CLASS}>
      <span className={DATA_TABLE_RANGE_CLASS} aria-live="polite">
        {filteredCount === 0 ? "0 résultat" : `${start}–${end} sur ${filteredCount}`}
      </span>
      <label className={DATA_TABLE_PAGE_SIZE_CLASS}>
        Lignes par page
        <Select
          aria-label="Lignes par page"
          value={pageSize}
          onChange={(event) => table.setPageSize(Number(event.target.value))}
        >
          {PAGE_SIZES.map((size) => (
            <option value={size} key={size}>
              {size}
            </option>
          ))}
        </Select>
      </label>
      <div className={DATA_TABLE_PAGE_CONTROLS_CLASS}>
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
  );
}
