import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { flexRender, type HeaderGroup } from "@tanstack/react-table";
import { cn } from "@/utils";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function DataTableHeader<TData>({
  headerGroups,
}: Readonly<{ headerGroups: HeaderGroup<TData>[] }>) {
  return (
    <thead>
      {headerGroups.map((group) => (
        <tr key={group.id} className="border-b border-border">
          {group.headers.map((header) => {
            if (header.column.id === "__globalSearch") return null;
            const meta = header.column.columnDef.meta;
            const sorted = header.column.getIsSorted();
            const canSort = header.column.getCanSort();
            const align = meta?.align ?? "left";
            let alignmentClass = "text-left";
            if (align === "right") alignmentClass = "text-right";
            else if (align === "center") alignmentClass = "text-center";

            let ariaSort: "ascending" | "descending" | "none" | undefined;
            if (sorted === "asc") ariaSort = "ascending";
            else if (sorted === "desc") ariaSort = "descending";
            else if (canSort) ariaSort = "none";

            let sortIcon = <ChevronsUpDown className="size-3.5 opacity-50" aria-hidden />;
            if (sorted === "asc") sortIcon = <ArrowUp className="size-3.5" aria-hidden />;
            else if (sorted === "desc") sortIcon = <ArrowDown className="size-3.5" aria-hidden />;

            return (
              <th
                key={header.id}
                scope="col"
                style={meta?.width ? { width: meta.width } : undefined}
                aria-sort={ariaSort}
                className={cn(
                  "h-10 px-3 text-[11.5px] font-medium whitespace-nowrap text-muted-foreground",
                  alignmentClass,
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
                    {sortIcon}
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
  );
}
