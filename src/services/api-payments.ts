import type { Payment, PaymentFilters, PaymentPage, Statistics } from "@/types";
import { mapApiPayment } from "./api-mappers";
import { type ApiPayment, callApi } from "./api-client";
import { ApiError } from "./api-errors";

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/+$/, "");

/** Charge utile d'une déclaration autonome (montant et nature saisis par l'utilisateur). */
export interface PaymentDeclarationPayload {
  typeImpotId: string;
  montant: number;
  periode?: string;
  mode: "MOBILE_MONEY" | "VIREMENT_BANCAIRE";
  operateur?: string;
  telephoneUtilise?: string;
  banqueOuCanal?: string;
  titulairePayeur?: string;
  referenceTransaction: string;
  dateTransaction: string;
  justificatifNom?: string;
  /** Empêche l'enregistrement en double si l'utilisateur resoumet le formulaire. */
  cleIdempotence?: string;
}

/** Supprime les paramètres vides : le serveur ne reçoit que les filtres réellement actifs. */
function toQueryString(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "string" && value === "TOUS") continue;
    params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function createAutonomousPaymentApi(
  token: string,
  payload: PaymentDeclarationPayload,
): Promise<Payment> {
  const payment = await callApi<ApiPayment>("paiements", {
    method: "POST",
    token,
    body: payload,
  });
  return mapApiPayment(payment);
}

/** Recherche filtrée côté serveur (administration) : filtres combinables et pagination. */
export async function searchPaymentsApi(
  token: string,
  filters: PaymentFilters,
): Promise<PaymentPage> {
  const query = toQueryString(filters as Record<string, unknown>);
  const response = await callApi<{
    donnees: ApiPayment[];
    total: number;
    page: number;
    parPage: number;
  }>(`paiements${query}`, { token });
  const parPage = response.parPage || filters.parPage || 25;
  return {
    donnees: response.donnees.map(mapApiPayment),
    total: response.total,
    page: response.page,
    parPage,
    pages: Math.max(1, Math.ceil(response.total / Math.max(1, parPage))),
  };
}

export async function getPaymentApi(token: string, id: string): Promise<Payment> {
  const payment = await callApi<ApiPayment>(`paiements/${encodeURIComponent(id)}`, { token });
  return mapApiPayment(payment);
}

export async function cancelPaymentApi(token: string, id: string): Promise<Payment> {
  const payment = await callApi<ApiPayment>(
    `paiements/${encodeURIComponent(id)}/annulation`,
    { method: "POST", token },
  );
  return mapApiPayment(payment);
}

export async function loadStatisticsApi(
  token: string,
  filters: Record<string, unknown> = {},
): Promise<Statistics> {
  return callApi<Statistics>(`statistiques${toQueryString(filters)}`, { token });
}

/**
 * Télécharge l'export serveur (CSV ou PDF) des paiements filtrés.
 * Le fichier est construit par le backend : aucune donnée n'est recalculée dans le navigateur.
 */
export async function downloadStatisticsExportApi(
  token: string,
  format: "csv" | "pdf",
  filters: Record<string, unknown> = {},
): Promise<void> {
  const query = toQueryString({ ...filters, format });
  const response = await fetch(`${apiBaseUrl}/statistiques/export${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: format === "pdf" ? "application/pdf" : "text/csv",
    },
  });
  if (!response.ok) {
    throw new ApiError(
      "L'export n'a pas pu être généré. Réessayez dans quelques instants.",
      response.status,
    );
  }
  const blob = await response.blob();
  if (!blob.size) throw new ApiError("Le serveur a renvoyé un fichier vide.", response.status);
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  const filename = match?.[1] ?? `export-sre-${new Date().toISOString().slice(0, 10)}.${format}`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/** Vérification publique d'un reçu à partir de son numéro et de son code. */
export async function verifyReceiptApi(numero: string, code: string) {
  const query = new URLSearchParams({ numero, code }).toString();
  return callApi<{
    valide: boolean;
    numero?: string;
    type?: string;
    emisLe?: string;
    contribuable?: string;
    natureImpot?: string | null;
    montant?: number;
    devise?: string;
    periode?: string | null;
    statutPaiement?: string | null;
  }>(`documents/verifier?${query}`);
}
