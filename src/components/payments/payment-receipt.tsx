import { Check, Clock, Download, Printer } from "lucide-react";
import type { Payment, PaymentDocument, Taxpayer } from "@/types";
import { formatMoney } from "@/utils/format";
import {
  formatFiscalPeriod,
  formatPaymentModeLabel,
  formatReceiptDateTime,
  montantEnLettres,
} from "@/utils/montant-en-lettres";
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

/** Construit les données d'affichage du reçu définitif d'un paiement confirmé. */
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
    .join("  •  ");
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
    paymentModeLabel: formatPaymentModeLabel(
      payment.mode,
      payment.operator,
      payment.bankOrChannel,
    ),
    transactionReference: payment.transactionReference,
    paymentReference: payment.internalReference,
    status: payment.status,
    verificationCode: payment.receipt.verificationCode ?? document?.verificationCode ?? null,
    issuer: document?.issuer ?? "SRE · Service régional des entreprises",
    documentId: payment.receipt.id,
    isAcknowledgment: false,
  };
}

/** Construit les données d'affichage à partir d'un document persisté (reçu ou accusé). */
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
    .join("  •  ");
  const declarationReference = payment
    ? payment.origin === "OBLIGATION"
      ? `${payment.internalReference} (obligation rattachée)`
      : payment.internalReference
    : document.paymentReference;
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
    issuer: document.issuer || "SRE · Service régional des entreprises",
    documentId: document.id,
    isAcknowledgment: isAck,
  };
}

function formatFiscalId(prefix: "NIF" | "STAT", value?: string | null): string | null {
  const clean = (value ?? "").trim();
  if (!clean) return null;
  return new RegExp(`^${prefix}\\b`, "i").test(clean) ? clean : `${prefix} ${clean}`;
}

/**
 * Reçu de versement fiscal fidèle au modèle officiel (bandeau marine, cartes,
 * montant en lettres et code-barres Code 128 de l'identifiant du reçu).
 */
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
    .join("  •  ");

  return (
    <article
      className={`fiscal-receipt-sre ${isAck ? "fiscal-receipt-sre--ack" : ""}`}
      aria-label={isAck ? "Accusé de déclaration fiscale" : "Reçu de versement fiscal"}
    >
      {/* 1. Bandeau marine */}
      <header className="fiscal-receipt-sre__banner">
        <div className="fiscal-receipt-sre__brand">
          <span className="fiscal-receipt-sre__badge-icon" aria-hidden="true">
            {isAck ? <Clock size={18} strokeWidth={2.5} /> : <Check size={19} strokeWidth={3} />}
          </span>
          <div>
            <strong>SRE &nbsp;|&nbsp; PLATEFORME FISCALE</strong>
            <span>{receipt.issuer}</span>
          </div>
        </div>
        <h2 className="fiscal-receipt-sre__title">
          {isAck ? "ACCUSÉ DE DÉCLARATION FISCALE" : "REÇU DE VERSEMENT FISCAL"}
        </h2>
        <p className="fiscal-receipt-sre__subtitle">
          {isAck
            ? "CONFIRMATION DE DÉPÔT  •  NE VAUT PAS PREUVE DE PAIEMENT"
            : "JUSTIFICATIF DE PAIEMENT  •  DOCUMENT À CONSERVER"}
        </p>
        {isAck && (
          <span className="fiscal-receipt-sre__ribbon">ACCUSÉ — NON LIBÉRATOIRE</span>
        )}
      </header>

      <div className="fiscal-receipt-sre__sheet">
        {/* 2. Carte Numéro / Date et heure */}
        <div className="fiscal-receipt-sre__meta-card">
          <div>
            <span>{isAck ? "NUMÉRO DE L’ACCUSÉ" : "NUMÉRO DU REÇU"}</span>
            <strong className="is-mono">{receipt.number}</strong>
          </div>
          <div>
            <span>{isAck ? "DATE ET HEURE DU DÉPÔT" : "DATE ET HEURE DU PAIEMENT"}</span>
            <strong>{formatReceiptDateTime(receipt.paidAt ?? receipt.issuedAt)}</strong>
          </div>
        </div>

        <div className="fiscal-receipt-sre__status-row">
          <span
            className={`fiscal-receipt-sre__pill ${isAck ? "fiscal-receipt-sre__pill--ack" : ""}`}
          >
            {isAck ? "DÉCLARÉ / EN ATTENTE" : "PAYÉ / CONFIRMÉ"}
          </span>
        </div>

        {/* 3. Identification du contribuable */}
        <section className="fiscal-receipt-sre__section">
          <h3>IDENTIFICATION DU CONTRIBUABLE</h3>
          <div className="fiscal-receipt-sre__taxpayer-card">
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

        {/* 4. Détails du versement */}
        <section className="fiscal-receipt-sre__section">
          <h3>DÉTAILS DU VERSEMENT</h3>
          <dl className="fiscal-receipt-sre__table">
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
              <dd className="is-mono">{receipt.declarationReference}</dd>
            </div>
            <div>
              <dt>Mode de paiement</dt>
              <dd>{receipt.paymentModeLabel}</dd>
            </div>
            <div>
              <dt>Référence de transaction</dt>
              <dd className="is-mono">{receipt.transactionReference}</dd>
            </div>
          </dl>
        </section>

        {/* 5. Montant total versé + montant en lettres */}
        <div
          className={`fiscal-receipt-sre__amount-box ${isAck ? "fiscal-receipt-sre__amount-box--ack" : ""}`}
        >
          <div>
            <span>{isAck ? "MONTANT DÉCLARÉ" : "MONTANT TOTAL VERSÉ"}</span>
            <strong>{formatMoney(receipt.amount, receipt.currency)}</strong>
          </div>
          <p>{montantEnLettres(receipt.amount, receipt.currency)}</p>
        </div>

        {/* 6. Vérification, traçabilité et code-barres */}
        <div className="fiscal-receipt-sre__verification">
          <div className="fiscal-receipt-sre__verification-text">
            <h3>VÉRIFICATION ET TRAÇABILITÉ</h3>
            <p>
              {isAck ? "Référence de l’accusé" : "Référence de vérification"} :{" "}
              <span className="is-mono">{receipt.number}</span>
            </p>
            {receipt.verificationCode && (
              <p className="fiscal-receipt-sre__auth-code">
                Code d’authenticité : <strong className="is-mono">{receipt.verificationCode}</strong>
              </p>
            )}
            <p className="fiscal-receipt-sre__trace-note">
              {isAck
                ? "Document émis au dépôt de la déclaration ; le reçu définitif sera délivré après confirmation."
                : "Ce reçu est associé à une transaction confirmée et enregistrée dans la plateforme."}
            </p>
          </div>
          <ReceiptBarcode
            value={receipt.number}
            label={isAck ? "CODE-BARRES — ID DE L’ACCUSÉ" : "CODE-BARRES — ID DU REÇU"}
          />
        </div>

        {!isAck && (
          <div className="fiscal-receipt-sre__stamp">
            <strong>TAMPON ET SIGNATURE DU RESPONSABLE</strong>
            <div aria-label="Espace réservé au tampon du responsable" />
          </div>
        )}

        {/* 7. Pied de document + actions écran */}
        <footer className="fiscal-receipt-sre__footer">
          <p>{receipt.issuer}  •  Portail de télédéclaration et suivi des paiements fiscaux</p>
          <small>
            {isAck
              ? "Accusé électronique de soumission : ce document n’atteste pas l’encaissement effectif des fonds."
              : "Justificatif électronique généré automatiquement dès la validation de la déclaration ; un seul reçu officiel est émis par transaction."}
          </small>
        </footer>

        {(onDownload || onPrint) && (
          <div className="fiscal-receipt-sre__actions">
            {onDownload && (
              <button
                type="button"
                className="button-sre button-sre--primary"
                onClick={onDownload}
                disabled={isDownloading}
              >
                <Download size={14} /> {isDownloading ? "Préparation…" : "Télécharger le PDF"}
              </button>
            )}
            {onPrint && (
              <button type="button" className="button-sre button-sre--outline" onClick={onPrint}>
                <Printer size={14} /> Imprimer
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/** Suivi explicite : en attente / échec / annulé ne valent jamais un reçu. */
export function PaymentStatusTrack({
  payment,
}: Readonly<{ payment: Payment }>) {
  const failed = payment.status === "ECHEC";
  const cancelled = payment.status === "ANNULE";
  const rejected = payment.status === "REJETE" || payment.status === "CORRECTION_DEMANDEE";
  const confirmed = payment.status === "CONFIRME";
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
    <div className="status-track-sre">
      <div className="status-track-sre__steps">
        {steps.map((step) => (
          <span
            key={step.key}
            className={step.failed ? "is-failed" : step.active ? "is-active" : undefined}
          >
            {step.label}
          </span>
        ))}
      </div>
      <p>
        {confirmed && "Paiement confirmé : le reçu définitif est disponible ci-dessous."}
        {failed &&
          `Le mécanisme de paiement a refusé l’opération${payment.failureReason ? ` (${payment.failureReason})` : ""}. Aucun reçu n’est émis.`}
        {cancelled && "Paiement annulé : aucun reçu n’est émis pour cette déclaration."}
        {rejected &&
          `Déclaration non validée${payment.rejectionReason ? ` : ${payment.rejectionReason}` : ""}. Aucun reçu n’est émis.`}
        {!confirmed &&
          !failed &&
          !cancelled &&
          !rejected &&
          "En attente de la confirmation du canal de paiement. Aucun reçu définitif n’est disponible à ce stade."}
      </p>
    </div>
  );
}
