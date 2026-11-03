import type { ApiDocument, ApiPayment, PaymentDocument } from "@/types";

export function mapApiDocument(document: ApiDocument): PaymentDocument {
  return {
    id: document.id,
    number: document.numero,
    type: document.type,
    status: document.statut,
    paymentId: document.paiementId,
    taxpayerId: document.contribuableId,
    paymentReference: document.referencePaiement,
    taxTypeName: document.typeImpotNom,
    period: document.periode ?? "—",
    declaredTransactionReference: document.referenceTransactionDeclaree,
    declaredMode: document.modeDeclare,
    amount: Number(document.montant),
    currency: document.devise,
    issuer: document.emetteur,
    issuedAt: document.emisLe,
    issuedBy: document.emisPar ?? undefined,
    mention: document.mention,
    verificationCode: document.codeVerification ?? null,
    paymentStatus: document.statutPaiement ?? null,
    confirmedAt: document.confirmeLe ?? null,
  };
}

export function mapApiPaymentDocuments(payment: ApiPayment): PaymentDocument[] {
  return (payment.documents ?? []).map((document) => ({
    id: document.id,
    number: document.numero,
    type: document.type,
    status: document.statut,
    paymentId: payment.id,
    taxpayerId: payment.contribuableId,
    paymentReference: payment.referenceInterne,
    taxTypeName: payment.typeImpotNom,
    period: payment.periode ?? "—",
    declaredTransactionReference: payment.referenceTransaction,
    declaredMode: payment.mode,
    amount: Number(document.montant),
    currency: document.devise,
    issuer: document.emetteur,
    issuedAt: document.emisLe,
    issuedBy: document.emisPar ?? undefined,
    mention: document.mention,
    verificationCode: document.codeVerification ?? null,
    paymentStatus: document.statutPaiement ?? null,
    confirmedAt: document.confirmeLe ?? null,
  }));
}
