import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, FileCheck2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { StatusBadge, PageHeader, EmptyState } from "@/components/ui";
import type { PaymentDocument } from "@/types";
import { formatMoney, formatDate } from "@/utils/format";
import { isApiConfigured, downloadPdfApi } from "@/services/api-client";

function documentTitle(document: PaymentDocument) {
  return document.type === "ACCUSE_DECLARATION"
    ? "Accusé de soumission de déclaration"
    : "Reçu interne de décision";
}

export function ClientDocumentDetailPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { state, notify } = useSre();
  const document = state.paymentDocuments.find(
    (entry) =>
      entry.id === id &&
      entry.taxpayerId === session?.taxpayerId &&
      entry.status === "VALIDE",
  );
  if (!document)
    return (
      <div className="page-content-sre">
        <PageHeader title="Document introuvable" breadcrumb={["Accueil", "Mes reçus"]} />
        <EmptyState
          title="Ce document n’est pas accessible"
          description="Il n’existe pas ou ne fait pas partie de votre espace contribuable."
          action={
            <Link className="button-sre button-sre--outline" to="/client/documents">
              <ArrowLeft size={14} /> Retour à mes reçus
            </Link>
          }
        />
      </div>
    );
  const taxpayer = state.taxpayers.find((entry) => entry.id === document.taxpayerId);
  const taxpayerName =
    taxpayer?.legalName ||
    `${taxpayer?.firstName ?? ""} ${taxpayer?.lastName ?? ""}`.trim() ||
    session?.name ||
    "Contribuable";
  const isAcknowledgment = document.type === "ACCUSE_DECLARATION";
  const downloadPdf = async () => {
    if (!isApiConfigured || !session?.apiToken) {
      notify("Le téléchargement PDF nécessite une session serveur.", "error");
      return;
    }
    try {
      await downloadPdfApi(document.id, session.apiToken, document.number);
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : "Téléchargement PDF impossible.", "error");
    }
  };
  const actions = (
    <>
      <button
        className="button-sre button-sre--outline screen-document-button-sre"
        onClick={() => void downloadPdf()}
      >
        <Download size={15} />
        Télécharger le PDF
      </button>
      <Link
        className="button-sre button-sre--outline print-document-button-sre"
        to={`/client/paiements/${document.paymentId}`}
      >
        <ArrowLeft size={14} /> Retour à la déclaration
      </Link>
    </>
  );
  return (
    <div className="page-content-sre document-detail-page-sre">
      <PageHeader
        title={documentTitle(document)}
        description={`Document ${document.number}`}
        breadcrumb={["Accueil", "Mes reçus", document.number]}
        actions={actions}
      />
      <article className="payment-document-sre" aria-label={documentTitle(document)}>
        <header className="payment-document-sre__header">
          <div className="payment-document-sre__brand">
            <span>
              <ShieldCheck size={20} />
            </span>
            <div>
              <strong>SRE · Portail</strong>
              <small>DOCUMENT DE SUIVI</small>
            </div>
          </div>
          <StatusBadge status={document.type} />
        </header>
        <div className="payment-document-sre__title">
          <p>{document.issuer}</p>
          <h2>{documentTitle(document)}</h2>
          <span>N° {document.number}</span>
        </div>
        <div
          className={`payment-document-sre__alert ${isAcknowledgment ? "payment-document-sre__alert--acknowledgment" : ""}`}
        >
          <ShieldCheck size={18} />
          <div>
            <strong>
              {isAcknowledgment
                ? "Accusé de soumission — pas une preuve de paiement"
                : "Reçu interne de décision — pas une preuve bancaire"}
            </strong>
            <p>{document.mention}</p>
          </div>
        </div>
        <div className="payment-document-sre__grid">
          <section>
            <h3>Contribuable</h3>
            <dl>
              <div>
                <dt>Nom / raison sociale</dt>
                <dd>{taxpayerName}</dd>
              </div>
              <div>
                <dt>NIF</dt>
                <dd>{taxpayer?.nif ?? "—"}</dd>
              </div>
              <div>
                <dt>Courriel</dt>
                <dd>{taxpayer?.email ?? session?.email ?? "—"}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h3>Déclaration associée</h3>
            <dl>
              <div>
                <dt>Référence interne</dt>
                <dd>
                  <Link to={`/client/paiements/${document.paymentId}`}>
                    {document.paymentReference}
                  </Link>
                </dd>
              </div>
              <div>
                <dt>Type / période</dt>
                <dd>
                  {document.taxTypeName} · {document.period}
                </dd>
              </div>
              <div>
                <dt>Référence de transaction déclarée</dt>
                <dd>{document.declaredTransactionReference}</dd>
              </div>
              <div>
                <dt>Mode indiqué</dt>
                <dd>{document.declaredMode.replaceAll("_", " ")}</dd>
              </div>
            </dl>
          </section>
        </div>
        <div className="payment-document-sre__amount">
          <span>Montant déclaré</span>
          <strong>{formatMoney(document.amount, document.currency)}</strong>
        </div>
        <footer className="payment-document-sre__footer">
          <span>Émis le {formatDate(document.issuedAt, true)}</span>
          <span>
            {document.issuedBy
              ? `Décision saisie par ${document.issuedBy}`
              : "Émission automatique à la soumission"}
          </span>
        </footer>
      </article>
      <div className="payment-document-sre__note">
        <FileCheck2 size={16} />
        <p>
          Document récupéré depuis le backend et persisté en base de données. L’accusé atteste
          uniquement la soumission; le reçu interne n’est pas une preuve bancaire.
        </p>
      </div>
    </div>
  );
}
