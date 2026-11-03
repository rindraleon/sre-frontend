import type { ApiPayment, Payment } from "@/types";

export function mapApiPayment(payment: ApiPayment): Payment {
  return {
    id: payment.id,
    internalReference: payment.referenceInterne,
    taxpayerId: payment.contribuableId,
    obligationId: payment.obligationId ?? null,
    origin: payment.origine ?? (payment.obligationId ? "OBLIGATION" : "DECLARATION_AUTONOME"),
    taxTypeId: payment.typeImpotId,
    taxTypeName: payment.typeImpotNom,
    period: payment.periode ?? "—",
    amount: Number(payment.montant),
    currency: payment.devise,
    mode: payment.mode,
    operator: payment.operateur ?? undefined,
    usedPhone: payment.telephoneUtilise ?? undefined,
    bankOrChannel: payment.banqueOuCanal ?? undefined,
    payerName: payment.titulairePayeur ?? undefined,
    transactionReference: payment.referenceTransaction,
    transactionDate: payment.dateTransaction,
    supportingDocumentName: payment.justificatifNom ?? undefined,
    status: payment.statut,
    submittedAt: payment.soumisLe,
    confirmedAt: payment.confirmeLe ?? null,
    validatedAt: payment.valideLe ?? undefined,
    validatedBy: payment.validePar ?? undefined,
    rejectionReason: payment.motifRejet ?? undefined,
    failureReason: payment.motifEchec ?? null,
    provider: payment.fournisseur ?? null,
    receipt: payment.recu
      ? {
          id: payment.recu.id,
          number: payment.recu.numero,
          issuedAt: payment.recu.emisLe,
          verificationCode: payment.recu.codeVerification ?? null,
          pdfPath: payment.recu.lienPdf,
        }
      : null,
    history: payment.historique.map((entry) => ({
      status: entry.statut,
      label: entry.libelle,
      date: entry.date,
      actor: entry.acteur,
      reason: entry.motif ?? undefined,
    })),
  };
}
