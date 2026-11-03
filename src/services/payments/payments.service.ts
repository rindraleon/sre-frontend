import { callApi, fetchFileApi, saveBlob, ApiError } from "@/services/api";
import { buildQueryString, type QueryValue } from "@/utils";
import type { Payment, PaymentFilters, PaymentPage, Statistics, ApiPayment } from "@/types";
import { mapApiPayment } from "./payment.mappers";

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
  cleIdempotence?: string;
}

export type PaymentDecisionStatus = "CONFIRME" | "REJETE" | "CORRECTION_DEMANDEE";

export interface PaymentDecisionResult {
  payment: Payment;
  apiPayment: ApiPayment;
}

export async function createAutonomousPaymentApi(
  token: string,
  payload: PaymentDeclarationPayload,
): Promise<Payment> {
  const payment = await callApi<ApiPayment>("paiements", { method: "POST", token, body: payload });
  return mapApiPayment(payment);
}

export async function searchPaymentsApi(
  token: string,
  filters: PaymentFilters,
): Promise<PaymentPage> {
  const search = buildQueryString(filters as Record<string, string | number | boolean | undefined>);
  const response = await callApi<{
    donnees: ApiPayment[];
    total: number;
    page: number;
    parPage: number;
  }>(`paiements${search}`, { token });
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
  const payment = await callApi<ApiPayment>(`paiements/${encodeURIComponent(id)}/annulation`, {
    method: "POST",
    token,
  });
  return mapApiPayment(payment);
}

export async function submitPaymentDecisionApi(
  token: string,
  paymentId: string,
  status: PaymentDecisionStatus,
  reason?: string,
): Promise<PaymentDecisionResult> {
  const apiPayment = await callApi<ApiPayment>(
    `paiements/${encodeURIComponent(paymentId)}/decision`,
    { method: "PATCH", token, body: { statut: status, ...(reason ? { motif: reason } : {}) } },
  );
  return { payment: mapApiPayment(apiPayment), apiPayment };
}

export function loadStatisticsApi(
  token: string,
  filters: Record<string, QueryValue> = {},
): Promise<Statistics> {
  return callApi<Statistics>(`statistiques${buildQueryString(filters)}`, { token });
}

export async function downloadStatisticsExportApi(
  token: string,
  format: "csv" | "pdf",
  filters: Record<string, QueryValue> = {},
): Promise<void> {
  const query = buildQueryString({ ...filters, format });
  const { blob, filename } = await fetchFileApi(`statistiques/export${query}`, {
    token,
    accept: format === "pdf" ? "application/pdf" : "text/csv",
    expectedType: format === "pdf" ? "pdf" : "csv",
  });
  saveBlob(blob, filename ?? `export-sre-${new Date().toISOString().slice(0, 10)}.${format}`);
}

export interface ReceiptVerification {
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
}

export function verifyReceiptApi(numero: string, code: string): Promise<ReceiptVerification> {
  return callApi<ReceiptVerification>(`documents/verifier${buildQueryString({ numero, code })}`);
}

export function describeVerificationError(cause: unknown): string {
  return cause instanceof ApiError
    ? cause.message
    : "Impossible de vérifier ce reçu pour le moment. Réessayez.";
}
