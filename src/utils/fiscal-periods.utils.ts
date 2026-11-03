const periodComparator = new Intl.Collator("fr", { numeric: true, sensitivity: "base" });

export function listFiscalPeriods(periods: readonly string[]): string[] {
  return [...new Set(periods.filter((period) => period.trim().length > 0))].sort(
    periodComparator.compare,
  );
}

export function matchesFiscalPeriod(savedValue: string, selection: string): boolean {
  return selection === "" || savedValue === selection;
}
