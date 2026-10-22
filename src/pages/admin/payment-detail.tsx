import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  MessageSquareWarning,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { Payment } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import {
  callApi,
  mapApiPaymentDocuments,
  mapApiPayment,
  type ApiPayment,
} from "@/services/api-client";
import { StatusBadge, Button, ConfirmDialog, PageHeader, EmptyState, Modal } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";
import { SubmitButton } from "@/components/forms/form-field";
import {
  PaymentDecisionFormFields,
  REASON_EMPTY,
} from "@/components/forms/admin/payment-decision-form";
import { useApiForm, useConfirmation } from "@/hooks";
import { decisionReasonSchema, type DecisionReasonFormValues } from "@/validation/payment.schema";

export function AdminPaymentDetailPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { state, updateState, notify } = useSre();
  const payment = state.payments.find((entry) => entry.id === id);
  const taxpayer = state.taxpayers.find((entry) => entry.id === payment?.taxpayerId);
  const obligation = state.obligations.find((entry) => entry.id === payment?.obligationId);
  const confirmation = useConfirmation<Payment>();
  const [reasonDialog, setReasonDialog] = useState<"REJETE" | "CORRECTION_DEMANDEE" | null>(
    null,
  );
  const [loadingDecision, setLoadingDecision] = useState(false);
  const formReason = useApiForm<DecisionReasonFormValues>({
    schema: decisionReasonSchema,
    initialValues: REASON_EMPTY,
    fallbackMessage: "Le serveur n’a pas enregistré la décision.",
  });

  if (!payment)
    return (
      <div className="page-content-sre">
        <PageHeader
          title="Déclaration introuvable"
          breadcrumb={["Accueil", "Historique des paiements"]}
        />
        <EmptyState
          title="Cette déclaration n’existe pas"
          description="Elle n’a pas été trouvée dans les données accessibles à la session."
          action={
            <Link className="button-sre button-sre--outline" to="/admin/paiements">
              Retour aux paiements
            </Link>
          }
        />
      </div>
    );

  const saveDecision = async (
    status: "CONFIRME" | "REJETE" | "CORRECTION_DEMANDEE",
    reasonOptional?: string,
  ) => {
    if (payment.status !== "EN_VERIFICATION") return;
    if (!session?.apiToken) {
      throw new Error("Session serveur introuvable. Reconnectez-vous.");
    }
    setLoadingDecision(true);
    formReason.resetError();
    try {
      const apiResult = await callApi<ApiPayment>(
        `paiements/${encodeURIComponent(payment.id)}/decision`,
        {
          method: "PATCH",
          token: session.apiToken,
          body: { statut: status, ...(reasonOptional ? { motif: reasonOptional } : {}) },
        },
      );
      const updatedPayment = mapApiPayment(apiResult);
      const documentsApi = mapApiPaymentDocuments(apiResult);
      let statusObligation: "PAYE" | "REJETE" | "CORRECTION_DEMANDEE";
      if (status === "CONFIRME") {
        statusObligation = "PAYE";
      } else if (status === "REJETE") {
        statusObligation = "REJETE";
      } else {
        statusObligation = "CORRECTION_DEMANDEE";
      }
      updateState((current) => ({
        ...current,
        payments: [
          updatedPayment,
          ...current.payments.filter((entry) => entry.id !== updatedPayment.id),
        ],
        paymentDocuments: [
          ...current.paymentDocuments.filter(
            (document) => document.paymentId !== updatedPayment.id,
          ),
          ...documentsApi,
        ],
        obligations: current.obligations.map((entry) =>
          entry.id === updatedPayment.obligationId
            ? { ...entry, status: statusObligation }
            : entry,
        ),
      }));
      let messageDecision: string;
      if (status === "CONFIRME") {
        messageDecision =
          "Décision enregistrée. Le reçu est interne et ne prouve pas un transfert bancaire.";
      } else if (status === "REJETE") {
        messageDecision = "Rejet enregistré sur le serveur.";
      } else {
        messageDecision = "Demande de correction enregistrée sur le serveur.";
      }
      notify(messageDecision, status === "CONFIRME" ? "success" : "warning");
      confirmation.close();
      setReasonDialog(null);
      formReason.resetForm();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Le serveur n’a pas enregistré la décision.";
      notify(message, "error");
      throw new Error(message);
    } finally {
      setLoadingDecision(false);
    }
  };

  const submitReason = formReason.handleSubmit(async (values) => {
    if (!reasonDialog) return;
    try {
      await saveDecision(reasonDialog, values.motif.trim());
    } catch (cause) {
      formReason.setError(
        cause instanceof Error ? cause.message : "Le serveur n’a pas enregistré la décision.",
      );
    }
  });

  const taxpayerName =
    taxpayer?.legalName ||
    `${taxpayer?.firstName ?? ""} ${taxpayer?.lastName ?? ""}`.trim() ||
    "Contribuable";
  const documents = state.paymentDocuments.filter(
    (document) => document.paymentId === payment.id && document.status === "VALIDE",
  );
  return (
    <div className="page-content-sre">
      <PageHeader
        title="Examen d’une déclaration"
        description={`Référence interne ${payment.internalReference}`}
        breadcrumb={[
          "Accueil",
          payment.status === "EN_VERIFICATION"
            ? "Vérification des paiements"
            : "Historique des paiements",
          payment.internalReference,
        ]}
        actions={
          <Link
            className="button-sre button-sre--outline"
            to={
              payment.status === "EN_VERIFICATION"
                ? "/admin/paiements-a-verifier"
                : "/admin/paiements"
            }
          >
            <ArrowLeft size={14} /> Retour à la liste
          </Link>
        }
      />
      <div className="payment-detail-grid-sre">
        <section className="card-sre">
          <div className="card-sre__header">
            <div>
              <h2>Déclaration {payment.internalReference}</h2>
              <p>
                {payment.taxTypeName} · période {payment.period}
              </p>
            </div>
            <StatusBadge status={payment.status} />
          </div>
          <div className="payment-detail-amount-sre">
            <span>Montant déclaré</span>
            <strong>{formatMoney(payment.amount)}</strong>
            <small>Montant transmis pour examen · MGA</small>
          </div>
          <dl className="details-list-sre">
            <div>
              <dt>Contribuable</dt>
              <dd>{taxpayerName}</dd>
            </div>
            <div>
              <dt>NIF / STAT</dt>
              <dd>
                {taxpayer?.nif || "—"}
                {taxpayer?.stat ? ` / ${taxpayer.stat}` : ""}
              </dd>
            </div>
            <div>
              <dt>Adresse e-mail</dt>
              <dd>{taxpayer?.email || "—"}</dd>
            </div>
            <div>
              <dt>Mode déclaré</dt>
              <dd>
                <StatusBadge status={payment.mode} />
              </dd>
            </div>
            {payment.operator && (
              <div>
                <dt>Opérateur / téléphone</dt>
                <dd>
                  {payment.operator.replaceAll("_", " ")} · {payment.usedPhone}
                </dd>
              </div>
            )}
            {payment.bankOrChannel && (
              <div>
                <dt>Établissement / canal indiqué</dt>
                <dd>
                  {payment.bankOrChannel}
                  {payment.payerName ? ` · ${payment.payerName}` : ""}
                </dd>
              </div>
            )}
            <div>
              <dt>Référence de transaction déclarée</dt>
              <dd>
                <strong>{payment.transactionReference}</strong>
              </dd>
            </div>
            <div>
              <dt>Date indiquée</dt>
              <dd>{formatDate(payment.transactionDate)}</dd>
            </div>
            <div>
              <dt>Obligation liée</dt>
              <dd>
                {obligation?.taxReference ?? "—"} ·{" "}
                <StatusBadge status={obligation?.status ?? "INACTIF"} />
              </dd>
            </div>
            <div>
              <dt>Soumise le</dt>
              <dd>{formatDate(payment.submittedAt, true)}</dd>
            </div>
          </dl>
          {documents.length > 0 && (
            <div className="payment-documents-list-sre">
              <div className="card-sre__header">
                <div>
                  <h3>Documents du serveur</h3>
                  <p>Documents associés à l’état de cette déclaration</p>
                </div>
                <BadgeCheck size={16} />
              </div>
              {documents.map((document) => (
                <div className="payment-documents-row-sre" key={document.id}>
                  <span>
                    <strong>{document.number}</strong>
                    <small>
                      {document.type === "ACCUSE_DECLARATION"
                        ? "Accusé de soumission · ne prouve pas le règlement"
                        : "Reçu interne · sans preuve bancaire"}
                    </small>
                  </span>
                </div>
              ))}
            </div>
          )}
          {payment.rejectionReason && (
            <div className="decision-reason-sre">
              <strong>
                {payment.status === "REJETE" ? "Motif de rejet" : "Motif de correction"}
              </strong>
              <p>{payment.rejectionReason}</p>
            </div>
          )}
          {payment.status === "EN_VERIFICATION" ? (
            <div className="payment-decision-actions-sre">
              <Button onClick={() => confirmation.open(payment)}>
                <CheckCircle2 size={15} /> Confirmer la déclaration
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setReasonDialog("REJETE");
                  formReason.resetForm();
                }}
              >
                <XCircle size={15} /> Rejeter avec motif
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setReasonDialog("CORRECTION_DEMANDEE");
                  formReason.resetForm();
                }}
              >
                <MessageSquareWarning size={15} /> Demander une correction
              </Button>
            </div>
          ) : (
            <div className="tax-note-sre">
              <span>
                <BadgeCheck size={14} />
              </span>
              <p>
                Une décision a déjà été enregistrée. Elle ne peut pas être modifiée depuis cette
                interface.
              </p>
            </div>
          )}
        </section>
        <section className="card-sre">
          <div className="card-sre__header">
            <div>
              <h2>Historique de traitement</h2>
              <p>Étapes renvoyées par le serveur</p>
            </div>
            <Clock3 size={18} />
          </div>
          <ol className="vertical-history-sre">
            {payment.history
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((step, index) => (
                <li key={`${step.date}-${index}`}>
                  <i
                    className={
                      index === payment.history.length - 1
                        ? "vertical-history-sre__active"
                        : ""
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
          <div className="security-note-sre">
            <ShieldCheck size={16} />
            <p>
              <strong>Vérification manuelle</strong>
              <span>Une référence saisie seule ne constitue pas une preuve de règlement.</span>
            </p>
          </div>
        </section>
      </div>
      <ConfirmDialog
        open={!!confirmation.target}
        title="Confirmer cette déclaration ?"
        description={`Vous allez enregistrer une décision « Confirmé par l’administration » pour ${payment.internalReference}, montant déclaré ${formatMoney(payment.amount)}. Aucun règlement bancaire n’est exécuté.`}
        close={confirmation.close}
        confirm={() => void confirmation.execute(() => saveDecision("CONFIRME"))}
        confirmLabel="Confirmer la décision"
        loading={confirmation.inProgress}
        error={confirmation.error}
      />
      <Modal
        open={!!reasonDialog}
        title={reasonDialog === "REJETE" ? "Rejeter la déclaration" : "Demander une correction"}
        description="Le motif sera enregistré avec la décision et consultable dans l’espace contribuable. Aucun email ne sera simulé."
        close={() => setReasonDialog(null)}
        disableClose={loadingDecision}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setReasonDialog(null)}
              disabled={loadingDecision}
            >
              Annuler
            </Button>
            <SubmitButton
              form="motif-paiement-admin"
              variant={reasonDialog === "REJETE" ? "danger" : "primary"}
              inProgress={loadingDecision}
              pendingLabel="Enregistrement…"
            >
              {reasonDialog === "REJETE" ? "Confirmer le rejet" : "Enregistrer la demande"}
            </SubmitButton>
          </>
        }
      >
        <form id="motif-paiement-admin" onSubmit={submitReason} noValidate>
          <PaymentDecisionFormFields form={formReason} error={formReason.error} />
        </form>
      </Modal>
    </div>
  );
}
