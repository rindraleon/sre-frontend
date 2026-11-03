import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileCheck2, RefreshCw, TimerReset, XCircle } from "lucide-react";
import { useAuth } from "@/contexts";
import { useSre } from "@/contexts";
import {
  Button,
  CARD_CLASS,
  CARD_HEADER_CLASS,
  ConfirmDialog,
  DECISION_REASON_CLASS,
  DETAILS_LIST_CLASS,
  EmptyState,
  FORM_ACTIONS_CLASS,
  PAGE_CONTENT_CLASS,
  PAYMENT_DETAIL_AMOUNT_CLASS,
  PAYMENT_DETAIL_GRID_CLASS,
  PageHeader,
  StatusBadge,
  TAX_NOTE_CLASS,
  VERTICAL_HISTORY_ACTIVE_CLASS,
  VERTICAL_HISTORY_CLASS,
  buttonVariants,
} from "@/components";
import { formatMoney, formatDate, cn } from "@/utils";
import { downloadPdfApi } from "@/services/documents";
import {
  PaymentReceiptCard,
  PaymentStatusTrack,
  buildReceiptData,
} from "@/components/PaymentsComponents";
import { PAYMENT_STATUS_LABELS } from "@/data";
import { cancelPaymentApi, getPaymentApi } from "@/services/payments";
import type { Payment } from "@/types";

export function ClientPaymentDetailPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { state, updateState, notify } = useSre();
  const cached = state.payments.find(
    (entry) => entry.id === id && entry.taxpayerId === session?.taxpayerId,
  );
  const [payment, setPayment] = useState<Payment | undefined>(cached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const refresh = useCallback(async () => {
    if (!session?.apiToken || !id) return;
    setIsRefreshing(true);
    try {
      const fresh = await getPaymentApi(session.apiToken, id);
      setPayment(fresh);
      updateState((current) => ({
        ...current,
        payments: current.payments.some((entry) => entry.id === fresh.id)
          ? current.payments.map((entry) => (entry.id === fresh.id ? fresh : entry))
          : [fresh, ...current.payments],
      }));
    } catch (cause) {
      console.error("Actualisation du suivi de paiement impossible.", cause);
      notify("Le suivi n’a pas pu être actualisé. Vérifiez votre connexion.", "warning");
    } finally {
      setIsRefreshing(false);
    }
  }, [id, notify, session?.apiToken, updateState]);

  useEffect(() => {
    if (!cached) void refresh();
  }, [cached, refresh]);

  if (!payment)
    return (
      <div className={PAGE_CONTENT_CLASS}>
        <PageHeader title="Paiement introuvable" breadcrumb={["Accueil", "Historique"]} />
        <EmptyState
          title="Cette déclaration n’est pas accessible"
          description="Elle n’existe pas ou ne fait pas partie de votre espace contribuable."
          action={
            <Link className={buttonVariants({ variant: "outline" })} to="/client/paiements">
              <ArrowLeft size={14} /> Retour à l’historique
            </Link>
          }
        />
      </div>
    );

  const ownTaxpayer = state.taxpayers.find((entry) => entry.id === payment.taxpayerId);
  const taxpayerName =
    ownTaxpayer?.legalName ||
    [ownTaxpayer?.firstName, ownTaxpayer?.lastName].filter(Boolean).join(" ") ||
    ownTaxpayer?.email ||
    "Contribuable";
  const matchingDocument = state.paymentDocuments.find(
    (doc) =>
      doc.paymentId === payment.id && doc.type === "RECU_PAIEMENT" && doc.status === "VALIDE",
  );
  const receipt = buildReceiptData(payment, taxpayerName, matchingDocument, ownTaxpayer);
  const obligation = payment.obligationId
    ? state.obligations.find((entry) => entry.id === payment.obligationId)
    : undefined;

  const handleDownload = async () => {
    if (!session?.apiToken || !payment.receipt) return;
    setIsDownloading(true);
    try {
      await downloadPdfApi(payment.receipt.id, session.apiToken, payment.receipt.number);
      notify("Reçu téléchargé.", "success");
    } catch (cause) {
      console.error("Téléchargement du reçu impossible.", cause);
      notify("Le reçu n’a pas pu être téléchargé. Réessayez.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCancel = async () => {
    if (!session?.apiToken) return;
    setConfirmCancel(false);
    setIsCancelling(true);
    try {
      const updated = await cancelPaymentApi(session.apiToken, payment.id);
      setPayment(updated);
      updateState((current) => ({
        ...current,
        payments: current.payments.map((entry) => (entry.id === updated.id ? updated : entry)),
      }));
      notify("Déclaration annulée. Aucun reçu n’a été émis.", "info");
    } catch (cause) {
      console.error("Annulation du paiement impossible.", cause);
      notify("L’annulation n’a pas été acceptée par le serveur.", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancel = payment.status === "EN_ATTENTE" || payment.status === "ECHEC";

  return (
    <div className={PAGE_CONTENT_CLASS}>
      <PageHeader
        title="Suivi du paiement"
        description={`Référence ${payment.internalReference} · ${payment.taxTypeName}`}
        breadcrumb={["Accueil", "Historique des paiements", payment.internalReference]}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => void refresh()}
              disabled={isRefreshing}
            >
              <RefreshCw size={14} /> {isRefreshing ? "Actualisation…" : "Actualiser"}
            </Button>
            <Link className={buttonVariants({ variant: "outline" })} to="/client/paiements">
              <ArrowLeft size={14} /> Historique
            </Link>
          </>
        }
      />
      <PaymentStatusTrack payment={payment} />
      {receipt ? (
        <div style={{ marginTop: 14 }}>
          <PaymentReceiptCard
            receipt={receipt}
            onDownload={() => void handleDownload()}
            onPrint={() => window.print()}
            isDownloading={isDownloading}
          />
        </div>
      ) : (
        <div className={TAX_NOTE_CLASS} style={{ marginTop: 14 }}>
          <TimerReset size={15} />
          <p>
            <strong>Aucun reçu définitif pour l’instant.</strong> Statut actuel :{" "}
            {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}. Le reçu est émis uniquement
            lorsque le paiement est confirmé ; une déclaration en attente, annulée ou en échec ne
            donne jamais lieu à un reçu.
          </p>
        </div>
      )}
      <div className={cn(PAYMENT_DETAIL_GRID_CLASS, "print:hidden")} style={{ marginTop: 14 }}>
        <section className={CARD_CLASS}>
          <div className={CARD_HEADER_CLASS}>
            <div>
              <h2>Déclaration</h2>
              <p>Éléments transmis au service des recettes</p>
            </div>
            <StatusBadge status={payment.status} />
          </div>
          <div className={PAYMENT_DETAIL_AMOUNT_CLASS}>
            <span>Montant déclaré</span>
            <strong>{formatMoney(payment.amount)}</strong>
            <small>
              {payment.origin === "OBLIGATION"
                ? "Déclaration rattachée à une obligation"
                : "Déclaration autonome (sans obligation préalable)"}
            </small>
          </div>
          <dl className={DETAILS_LIST_CLASS}>
            <div>
              <dt>Nature d’impôt</dt>
              <dd>{payment.taxTypeName}</dd>
            </div>
            <div>
              <dt>Période fiscale</dt>
              <dd>{payment.period || "—"}</dd>
            </div>
            <div>
              <dt>Référence de transaction</dt>
              <dd>{payment.transactionReference}</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>
                <StatusBadge status={payment.mode} />
              </dd>
            </div>
            {payment.operator && (
              <div>
                <dt>Opérateur · numéro</dt>
                <dd>
                  {payment.operator.replace("_", " ")} · {payment.usedPhone}
                </dd>
              </div>
            )}
            {payment.bankOrChannel && (
              <div>
                <dt>Canal</dt>
                <dd>{payment.bankOrChannel}</dd>
              </div>
            )}
            <div>
              <dt>Date de l’opération</dt>
              <dd>{formatDate(payment.transactionDate)}</dd>
            </div>
            <div>
              <dt>Soumis le</dt>
              <dd>{formatDate(payment.submittedAt, true)}</dd>
            </div>
            {payment.confirmedAt && (
              <div>
                <dt>Confirmé le</dt>
                <dd>{formatDate(payment.confirmedAt, true)}</dd>
              </div>
            )}
          </dl>
          {payment.failureReason && (
            <div className={DECISION_REASON_CLASS}>
              <strong>Motif de l’échec</strong>
              <p>{payment.failureReason}</p>
            </div>
          )}
          {payment.rejectionReason && (
            <div className={DECISION_REASON_CLASS}>
              <strong>
                {payment.status === "REJETE" ? "Motif de rejet" : "Correction demandée"}
              </strong>
              <p>{payment.rejectionReason}</p>
            </div>
          )}
          {canCancel && (
            <div className={cn(FORM_ACTIONS_CLASS)}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmCancel(true)}
                disabled={isCancelling}
              >
                <XCircle size={14} /> {isCancelling ? "Annulation…" : "Annuler cette déclaration"}
              </Button>
            </div>
          )}
        </section>
        <section className={CARD_CLASS}>
          <div className={CARD_HEADER_CLASS}>
            <div>
              <h2>Historique</h2>
              <p>Étapes enregistrées par le serveur</p>
            </div>
            <FileCheck2 size={17} />
          </div>
          <ol className={VERTICAL_HISTORY_CLASS}>
            {payment.history.map((step, index) => (
              <li key={`${step.date}-${index}`}>
                <i
                  className={
                    index === payment.history.length - 1 ? VERTICAL_HISTORY_ACTIVE_CLASS : undefined
                  }
                />
                <div>
                  <strong>{step.label}</strong>
                  <p>
                    {step.actor}
                    {step.reason ? ` · ${step.reason}` : ""}
                  </p>
                  <small>{formatDate(step.date, true)}</small>
                </div>
              </li>
            ))}
          </ol>
          {obligation && (
            <div className={TAX_NOTE_CLASS}>
              <span>i</span>
              <p>
                Obligation rattachée :{" "}
                <Link to={`/client/obligations/${obligation.id}`}>{obligation.taxReference}</Link>
              </p>
            </div>
          )}
        </section>
      </div>
      <ConfirmDialog
        open={confirmCancel}
        title="Annuler cette déclaration ?"
        description="L’annulation est définitive : aucun reçu ne sera émis pour ce paiement. Vous pourrez soumettre une nouvelle déclaration si nécessaire."
        close={() => setConfirmCancel(false)}
        confirm={() => void handleCancel()}
        confirmLabel="Annuler la déclaration"
      />
    </div>
  );
}
