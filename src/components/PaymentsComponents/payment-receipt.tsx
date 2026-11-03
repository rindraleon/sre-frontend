import {
  Button,
  MONO_CLASS,
  RECEIPT_ACTIONS_CLASS,
  RECEIPT_AUTH_CODE_CLASS,
  RECEIPT_AMOUNT_BOX_ACK_CLASS,
  RECEIPT_AMOUNT_BOX_CLASS,
  RECEIPT_BADGE_ICON_CLASS,
  RECEIPT_BANNER_CLASS,
  RECEIPT_BRAND_CLASS,
  RECEIPT_BRAND_ISSUER_CLASS,
  RECEIPT_BRAND_NAME_CLASS,
  RECEIPT_CLASS,
  RECEIPT_FOOTER_CLASS,
  RECEIPT_META_CARD_CLASS,
  RECEIPT_PILL_ACK_CLASS,
  RECEIPT_PILL_CLASS,
  RECEIPT_RIBBON_CLASS,
  RECEIPT_SECTION_CLASS,
  RECEIPT_SHEET_CLASS,
  RECEIPT_STAMP_CLASS,
  RECEIPT_STATUS_ROW_CLASS,
  RECEIPT_SUBTITLE_CLASS,
  RECEIPT_TABLE_CLASS,
  RECEIPT_TAXPAYER_CARD_CLASS,
  RECEIPT_TITLE_CLASS,
  RECEIPT_TRACE_NOTE_CLASS,
  RECEIPT_VERIFICATION_CLASS,
  RECEIPT_VERIFICATION_TEXT_CLASS,
  STATUS_TRACK_ACTIVE_CLASS,
  STATUS_TRACK_CLASS,
  STATUS_TRACK_FAILED_CLASS,
  STATUS_TRACK_STEPS_CLASS,
} from "@/components";
import { cn ,
  formatMoney,
  formatFiscalPeriod,
  formatPaymentModeLabel,
  formatReceiptDateTime,
  montantEnLettres,
} from "@/utils";
import { Check, Clock, Download, Printer } from "lucide-react";
import type { Payment, PaymentDocument, Taxpayer } from "@/types";
import { ReceiptBarcode } from "./receipt-barcode";

export interface ReceiptData {
  number: string;
  issuedAt: string;
  paidAt?: string | null;
  amount: number;
  currency: string;
  taxpayerName: string;
  taxpayerNif?: string | null;
  taxpayerStat?: string | null;
  taxpayerAddress?: string | null;
  taxpayerContact?: string | null;
  taxTypeName: string;
  period: string;
  declarationReference: string;
  paymentModeLabel: string;
  transactionReference: string;
  paymentReference: string;
  status: string;
  verificationCode?: string | null;
  issuer: string;
  documentId?: string;
  isAcknowledgment?: boolean;
}

export function buildReceiptData(
  payment: Payment,
  taxpayerName: string,
  document?: PaymentDocument,
  taxpayer?: Taxpayer,
): ReceiptData | null {
  if (payment.status !== "CONFIRME" || !payment.receipt) return null;
  const address = [taxpayer?.address, taxpayer?.city]
    .map((v) => (v ?? "").trim())
    .filter(Boolean)
    .join(", ");
  const contact = [taxpayer?.phone, taxpayer?.email]
    .map((v) => (v ?? "").trim())
    .filter(Boolean)
    .join("  /  ");
  return {
    number: payment.receipt.number,
    issuedAt: payment.receipt.issuedAt,
    paidAt: payment.confirmedAt ?? payment.receipt.issuedAt,
    amount: payment.amount,
    currency: payment.currency,
    taxpayerName,
    taxpayerNif: taxpayer?.nif ?? null,
    taxpayerStat: taxpayer?.stat ?? null,
    taxpayerAddress: address || null,
    taxpayerContact: contact || null,
    taxTypeName: payment.taxTypeName,
    period: payment.period,
    declarationReference:
      payment.origin === "OBLIGATION"
        ? `${payment.internalReference} (obligation rattachée)`
        : payment.internalReference,
    paymentModeLabel: formatPaymentModeLabel(payment.mode, payment.operator, payment.bankOrChannel),
    transactionReference: payment.transactionReference,
    paymentReference: payment.internalReference,
    status: payment.status,
    verificationCode: payment.receipt.verificationCode ?? document?.verificationCode ?? null,
    issuer: document?.issuer ?? "SRE — Service Régional des Entreprises",
    documentId: payment.receipt.id,
    isAcknowledgment: false,
  };
}

export function buildDocumentDisplayData(
  document: PaymentDocument,
  taxpayerName: string,
  taxpayer?: Taxpayer,
  fallbackEmail?: string | null,
  payment?: Payment,
): ReceiptData {
  const isAck = document.type === "ACCUSE_DECLARATION";
  const address = [taxpayer?.address, taxpayer?.city]
    .map((v) => (v ?? "").trim())
    .filter(Boolean)
    .join(", ");
  const contact = [taxpayer?.phone, taxpayer?.email ?? fallbackEmail]
    .map((v) => (v ?? "").trim())
    .filter(Boolean)
    .join("  /  ");

  let declarationReference = document.paymentReference;
  if (payment) {
    declarationReference =
      payment.origin === "OBLIGATION"
        ? `${payment.internalReference} (obligation rattachée)`
        : payment.internalReference;
  }

  return {
    number: document.number,
    issuedAt: document.issuedAt,
    paidAt: document.confirmedAt ?? payment?.confirmedAt ?? document.issuedAt,
    amount: document.amount,
    currency: document.currency,
    taxpayerName,
    taxpayerNif: taxpayer?.nif ?? null,
    taxpayerStat: taxpayer?.stat ?? null,
    taxpayerAddress: address || null,
    taxpayerContact: contact || null,
    taxTypeName: document.taxTypeName,
    period: document.period,
    declarationReference,
    paymentModeLabel: formatPaymentModeLabel(
      payment?.mode ?? document.declaredMode,
      payment?.operator,
      payment?.bankOrChannel,
    ),
    transactionReference: document.declaredTransactionReference,
    paymentReference: document.paymentReference,
    status: document.paymentStatus ?? payment?.status ?? (isAck ? "EN_ATTENTE" : "CONFIRME"),
    verificationCode: document.verificationCode ?? null,
    issuer: document.issuer || "SRE — Service Régional des Entreprises",
    documentId: document.id,
    isAcknowledgment: isAck,
  };
}

function formatFiscalId(prefix: "NIF" | "STAT", value?: string | null): string | null {
  const clean = (value ?? "").trim();
  if (!clean) return null;
  return new RegExp(String.raw`^${prefix}\b`, "i").test(clean) ? clean : `${prefix} ${clean}`;
}

export function PaymentReceiptCard({
  receipt,
  onDownload,
  onPrint,
  isDownloading = false,
}: Readonly<{
  receipt: ReceiptData;
  onDownload?: () => void;
  onPrint?: () => void;
  isDownloading?: boolean;
}>) {
  const isAck = Boolean(receipt.isAcknowledgment);
  const fiscalIds = [
    formatFiscalId("NIF", receipt.taxpayerNif),
    formatFiscalId("STAT", receipt.taxpayerStat),
  ]
    .filter(Boolean)
    .join("  /  ");
  const receiptContext = isAck
    ? {
        ariaLabel: "Accusé de déclaration fiscale",
        badgeIcon: <Clock size={18} strokeWidth={2.5} />,
        title: "ACCUSÉ DE DÉCLARATION FISCALE",
        subtitle: "CONFIRMATION DE DÉPÔT  /  NE VAUT PAS PREUVE DE PAIEMENT",
        ribbon: "ACCUSÉ — NON LIBÉRATOIRE",
        numberLabel: "NUMÉRO DE L’ACCUSÉ",
        dateLabel: "DATE ET HEURE DU DÉPÔT",
        statusLabel: "DÉCLARÉ / EN ATTENTE",
        amountLabel: "MONTANT DÉCLARÉ",
        traceLabel: "Référence de l’accusé",
        traceNote:
          "Document émis au dépôt de la déclaration ; le reçu définitif sera délivré après confirmation.",
        footerNote:
          "Accusé électronique de soumission : ce document n’atteste pas l’encaissement effectif des fonds.",
        barcodeLabel: "CODE-BARRES — ID DE L’ACCUSÉ",
      }
    : {
        ariaLabel: "Reçu de versement fiscal",
        badgeIcon: <Check size={19} strokeWidth={3} />,
        title: "REÇU DE VERSEMENT FISCAL",
        subtitle: "JUSTIFICATIF DE PAIEMENT  /  DOCUMENT À CONSERVER",
        ribbon: null,
        numberLabel: "NUMÉRO DU REÇU",
        dateLabel: "DATE ET HEURE DU PAIEMENT",
        statusLabel: "PAYÉ / CONFIRMÉ",
        amountLabel: "MONTANT TOTAL VERSÉ",
        traceLabel: "Référence de vérification",
        traceNote:
          "Ce reçu est associé à une transaction confirmée et enregistrée dans la plateforme.",
        footerNote:
          "Justificatif électronique généré automatiquement dès la validation de la déclaration ; un seul reçu officiel est émis par transaction.",
        barcodeLabel: "CODE-BARRES — ID DU REÇU",
      };
  const hasActions = Boolean(onDownload || onPrint);

  return (
    <article className={RECEIPT_CLASS} aria-label={receiptContext.ariaLabel}>
      <header className={RECEIPT_BANNER_CLASS}>
        <div className={RECEIPT_BRAND_CLASS}>
          <span className={RECEIPT_BADGE_ICON_CLASS} aria-hidden="true">
            {receiptContext.badgeIcon}
          </span>
          <div>
            <strong className={RECEIPT_BRAND_NAME_CLASS}>
              SRE &nbsp;—&nbsp; HAUTE MATSIATRA
            </strong>
            <span className={RECEIPT_BRAND_ISSUER_CLASS}>{receipt.issuer}</span>
          </div>
        </div>
        <h2 className={RECEIPT_TITLE_CLASS}>{receiptContext.title}</h2>
        <p className={RECEIPT_SUBTITLE_CLASS}>{receiptContext.subtitle}</p>
        {receiptContext.ribbon && <span className={RECEIPT_RIBBON_CLASS}>{receiptContext.ribbon}</span>}
      </header>

      <div className={RECEIPT_SHEET_CLASS}>
        <div className={RECEIPT_META_CARD_CLASS}>
          <div>
            <span>{receiptContext.numberLabel}</span>
            <strong className={MONO_CLASS}>{receipt.number}</strong>
          </div>
          <div>
            <span>{receiptContext.dateLabel}</span>
            <strong>{formatReceiptDateTime(receipt.paidAt ?? receipt.issuedAt)}</strong>
          </div>
        </div>

        <div className={RECEIPT_STATUS_ROW_CLASS}>
          <span className={cn(RECEIPT_PILL_CLASS, isAck && RECEIPT_PILL_ACK_CLASS)}>
            {receiptContext.statusLabel}
          </span>
        </div>

        <section className={RECEIPT_SECTION_CLASS}>
          <h3>IDENTIFICATION DU CONTRIBUABLE</h3>
          <div className={RECEIPT_TAXPAYER_CARD_CLASS}>
            <div>
              <span>ENTREPRISE / CONTRIBUABLE</span>
              <strong>{receipt.taxpayerName}</strong>
            </div>
            <div>
              <span>ADRESSE</span>
              <b>{receipt.taxpayerAddress || "Non renseignée"}</b>
            </div>
            <div>
              <span>NIF / IDENTIFIANT FISCAL</span>
              <b>{fiscalIds || "Non renseigné"}</b>
            </div>
            <div>
              <span>CONTACT</span>
              <b>{receipt.taxpayerContact || "Non renseigné"}</b>
            </div>
          </div>
        </section>

        <section className={RECEIPT_SECTION_CLASS}>
          <h3>DÉTAILS DU VERSEMENT</h3>
          <dl className={RECEIPT_TABLE_CLASS}>
            <div>
              <dt>Nature de l’impôt</dt>
              <dd>{receipt.taxTypeName}</dd>
            </div>
            <div>
              <dt>Période fiscale</dt>
              <dd>{formatFiscalPeriod(receipt.period)}</dd>
            </div>
            <div>
              <dt>Référence de déclaration / dossier</dt>
              <dd className={MONO_CLASS}>{receipt.declarationReference}</dd>
            </div>
            <div>
              <dt>Mode de paiement</dt>
              <dd>{receipt.paymentModeLabel}</dd>
            </div>
            <div>
              <dt>Référence de transaction</dt>
              <dd className={MONO_CLASS}>{receipt.transactionReference}</dd>
            </div>
          </dl>
        </section>

        <div className={cn(RECEIPT_AMOUNT_BOX_CLASS, isAck && RECEIPT_AMOUNT_BOX_ACK_CLASS)}>
          <div>
            <span>{receiptContext.amountLabel}</span>
            <strong>{formatMoney(receipt.amount, receipt.currency)}</strong>
          </div>
          <p>{montantEnLettres(receipt.amount, receipt.currency)}</p>
        </div>

        <div className={RECEIPT_VERIFICATION_CLASS}>
          <div className={RECEIPT_VERIFICATION_TEXT_CLASS}>
            <h3>VÉRIFICATION ET TRAÇABILITÉ</h3>
            <p>
              {receiptContext.traceLabel} : <span className={MONO_CLASS}>{receipt.number}</span>
            </p>
            {receipt.verificationCode && (
              <p className={RECEIPT_AUTH_CODE_CLASS}>
                Code d’authenticité : <strong className={MONO_CLASS}>{receipt.verificationCode}</strong>
              </p>
            )}
            <p className={RECEIPT_TRACE_NOTE_CLASS}>{receiptContext.traceNote}</p>
          </div>
          <ReceiptBarcode value={receipt.number} label={receiptContext.barcodeLabel} />
        </div>

        {!isAck && (
          <div className={RECEIPT_STAMP_CLASS}>
            <strong>TAMPON ET SIGNATURE DU RESPONSABLE</strong>
            <div aria-label="Espace réservé au tampon du responsable" />
          </div>
        )}

        <footer className={RECEIPT_FOOTER_CLASS}>
          <p>{receipt.issuer} • Portail de télédéclaration et suivi des paiements fiscaux</p>
          <small>{receiptContext.footerNote}</small>
        </footer>

        {hasActions && (
          <div className={RECEIPT_ACTIONS_CLASS}>
            {onDownload && (
              <Button type="button" variant="primary" onClick={onDownload} disabled={isDownloading}>
                <Download size={14} /> {isDownloading ? "Préparation…" : "Télécharger le PDF"}
              </Button>
            )}
            {onPrint && (
              <Button type="button" variant="outline" onClick={onPrint}>
                <Printer size={14} /> Imprimer
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export function PaymentStatusTrack({ payment }: Readonly<{ payment: Payment }>) {
  const failed = payment.status === "ECHEC";
  const cancelled = payment.status === "ANNULE";
  const rejected = payment.status === "REJETE" || payment.status === "CORRECTION_DEMANDEE";
  const confirmed = payment.status === "CONFIRME";
  const failureReasonText = payment.failureReason ? ` (${payment.failureReason})` : "";
  const rejectionReasonText = payment.rejectionReason ? ` : ${payment.rejectionReason}` : "";
  const steps = [
    { key: "declare", label: "Déclaré", active: true },
    {
      key: "attente",
      label: "En attente de confirmation",
      active: !confirmed && !failed && !cancelled && !rejected,
    },
    {
      key: "confirme",
      label: "Confirmé — reçu émis",
      active: confirmed,
      failed: failed || cancelled || rejected,
    },
  ];
  return (
    <div className={STATUS_TRACK_CLASS}>
      <div className={STATUS_TRACK_STEPS_CLASS}>
        {steps.map((step) => {
          let className: string | undefined;
          if (step.failed) {
            className = STATUS_TRACK_FAILED_CLASS;
          } else if (step.active) {
            className = STATUS_TRACK_ACTIVE_CLASS;
          }

          return (
            <span key={step.key} className={className}>
              {step.label}
            </span>
          );
        })}
      </div>
      <p>
        {confirmed && "Paiement confirmé : le reçu définitif est disponible ci-dessous."}
        {failed && `Le mécanisme de paiement a refusé l’opération${failureReasonText}. Aucun reçu n’est émis.`}
        {cancelled && "Paiement annulé : aucun reçu n’est émis pour cette déclaration."}
        {rejected && `Déclaration non validée${rejectionReasonText}. Aucun reçu n’est émis.`}
        {!confirmed &&
          !failed &&
          !cancelled &&
          !rejected &&
          "En attente de la confirmation du canal de paiement. Aucun reçu définitif n’est disponible à ce stade."}
      </p>
    </div>
  );
}
