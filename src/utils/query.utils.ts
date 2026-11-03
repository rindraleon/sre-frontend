export type QueryValue = string | number | boolean | null | undefined;

export const ALL_FILTER_VALUE = "TOUS";

export function buildQueryString(params: Record<string, QueryValue>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === false) continue;
    if (typeof value === "string" && value.trim() === ALL_FILTER_VALUE) continue;
    searchParams.set(key, typeof value === "string" ? value.trim() : String(value));
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
