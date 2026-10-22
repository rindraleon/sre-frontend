const periodComparator = new Intl.Collator("fr", { numeric: true, sensitivity: "base" });

/** Returns the non-empty periods actually recorded, without normalizing their format. */
export function listFiscalPeriods(periods: readonly string[]): string[] {
  return [...new Set(periods.filter((period) => period.trim().length > 0))].sort(
    periodComparator.compare,
  );
}

/** An empty selection disables the filter; otherwise the value is compared identically. */
export function matchesFiscalPeriod(savedValue: string, selection: string): boolean {
  return selection === "" || savedValue === selection;
}
