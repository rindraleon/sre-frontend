function normalizeBaseUrl(raw: string | undefined): string {
  return (raw ?? "").trim().replace(/\/+$/, "");
}

export const env = {
  apiBaseUrl: normalizeBaseUrl(import.meta.env.VITE_API_URL),
  mode: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
} as const;

export const isApiConfigured = env.apiBaseUrl.length > 0;
