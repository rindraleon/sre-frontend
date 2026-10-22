import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileCheck2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { StatusBadge, PageHeader, EmptyState } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

export function ClientPaymentDetailPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { state } = useSre();
  const payment = state.payments.find(
    (entry) => entry.id === id && entry.taxpayerId === session?.taxpayerId,
  );
  if (!payment)
    return (
      <div className="page-content-sre">
        <PageHeader
          title="Déclaration introuvable"
          breadcrumb={["Accueil", "Historique des paiements"]}
        />
        <EmptyState
          title="Cette déclaration n’est pas accessible"
          description="Elle n’existe pas ou ne fait pas partie de votre espace contribuable."
          action={
            <Link className="button-sre button-sre--outline" to="/client/paiements">
              <ArrowLeft size={14} /> Retour à l’historique
            </Link>
          }
        />
      </div>
    );
  const obligation = state.obligations.find(
    (entry) =>
      entry.id === payment.obligationId && entry.taxpayerId === session?.taxpayerId,
  );
  const paymentDocuments = state.paymentDocuments.filter(
    (document) =>
      document.paymentId === payment.id &&
      document.taxpayerId === session?.taxpayerId &&
      document.status === "VALIDE",
  );
  return (
    <div className="page-content-sre">
      <PageHeader
        title="Suivi de la déclaration"
        description={`Référence interne ${payment.internalReference}`}
        breadcrumb={["Accueil", "Historique des paiements", payment.internalReference]}
        actions={
          <Link className="button-sre button-sre--outline" to="/client/paiements">
            <ArrowLeft size={14} /> Retour à l’historique
          </Link>
        }
      />
      <div className="payment-detail-grid-sre">
        <section className="card-sre">
          <div className="card-sre__header">
            <div>
              <h2>{payment.taxTypeName}</h2>
              <p>Période {payment.period}</p>
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
              <dt>Référence de l’opération déclarée</dt>
              <dd>{payment.transactionReference}</dd>
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
                  {payment.operator.replace("_", " ")} · {payment.usedPhone}
                </dd>
              </div>
            )}
            {payment.bankOrChannel && (
              <div>
                <dt>Canal indiqué</dt>
                <dd>{payment.bankOrChannel}</dd>
              </div>
            )}
            <div>
              <dt>Date déclarée</dt>
              <dd>{formatDate(payment.transactionDate)}</dd>
            </div>
            <div>
              <dt>Soumise le</dt>
              <dd>{formatDate(payment.submittedAt, true)}</dd>
            </div>
          </dl>
          <div className="payment-documents-list-sre">
            <div className="card-sre__header">
              <div>
                <h3>Documents associés</h3>
                <p>Émis par le serveur selon l’état du dossier</p>
              </div>
              <FileCheck2 size={17} />
            </div>
            {paymentDocuments.length ? (
              paymentDocuments.map((document) => (
                <Link
                  className="payment-documents-row-sre"
                  key={document.id}
                  to={`/client/documents/${document.id}`}
                >
                  <span>
                    <strong>{document.number}</strong>
                    <small>
                      {document.type === "ACCUSE_DECLARATION"
                        ? "Accusé de soumission · ne prouve pas le règlement"
                        : "Reçu interne · sans preuve bancaire"}
                    </small>
                  </span>
                  <ArrowRight size={15} />
                </Link>
              ))
            ) : (
              <p className="text-help-sre">
                Aucun document n’est disponible pour cette déclaration.
              </p>
            )}
          </div>
          {payment.rejectionReason && (
            <div className="decision-reason-sre">
              <strong>
                {payment.status === "REJETE" ? "Motif de rejet" : "Correction demandée"}
              </strong>
              <p>{payment.rejectionReason}</p>
            </div>
          )}
        </section>
        <section className="card-sre">
          <div className="card-sre__header">
            <div>
              <h2>Historique de traitement</h2>
              <p>Étapes enregistrées par le serveur</p>
            </div>
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
          {obligation && (
            <div className="tax-note-sre">
              <span>i</span>
              <p>
                Obligation associée :{" "}
                <Link to={`/client/obligations/${obligation.id}`}>
                  {obligation.taxReference}
                </Link>
                . Une référence déclarée ne confirme pas un règlement.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
