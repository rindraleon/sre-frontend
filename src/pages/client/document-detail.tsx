import { cn } from "@/utils";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useAuth , useSre } from "@/contexts";
import {
  PageHeader,
  EmptyState,
  Button,
  buttonVariants,
  PAGE_CONTENT_CLASS,
  DOCUMENT_LINK_HIDDEN_CLASS,
  DOCUMENT_PAGE_CLASS,
  DOCUMENT_SCREEN_ONLY_CLASS,
} from "@/components";
import type { PaymentDocument } from "@/types";
import { isApiConfigured } from "@/services/api";
import { downloadPdfApi } from "@/services/documents";
import { PaymentReceiptCard, buildDocumentDisplayData } from "@/components/PaymentsComponents";

function documentTitle(document: PaymentDocument) {
  return document.type === "ACCUSE_DECLARATION"
    ? "Accusé de déclaration fiscale"
    : "Reçu de versement fiscal";
}

export function ClientDocumentDetailPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { state, notify } = useSre();
  const [isDownloading, setIsDownloading] = useState(false);

  const document = state.paymentDocuments.find(
    (entry) =>
      entry.id === id && entry.taxpayerId === session?.taxpayerId && entry.status === "VALIDE",
  );
  if (!document)
    return (
      <div className={PAGE_CONTENT_CLASS}>
        <PageHeader title="Document introuvable" breadcrumb={["Accueil", "Mes reçus"]} />
        <EmptyState
          title="Ce document n’est pas accessible"
          description="Il n’existe pas ou ne fait pas partie de votre espace contribuable."
          action={
            <Link className={buttonVariants({ variant: "outline" })} to="/client/documents">
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

  const associatedPayment = state.payments.find((entry) => entry.id === document.paymentId);
  const displayData = buildDocumentDisplayData(
    document,
    taxpayerName,
    taxpayer,
    session?.email,
    associatedPayment,
  );

  const downloadPdf = async () => {
    if (!isApiConfigured || !session?.apiToken) {
      notify("Le téléchargement PDF nécessite une session serveur.", "error");
      return;
    }
    setIsDownloading(true);
    try {
      await downloadPdfApi(document.id, session.apiToken, document.number);
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : "Téléchargement PDF impossible.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const actions = (
    <>
      <Button
        type="button"
        variant="primary"
        className={DOCUMENT_SCREEN_ONLY_CLASS}
        onClick={() => void downloadPdf()}
        disabled={isDownloading}
      >
        <Download size={15} />
        {isDownloading ? "Préparation…" : "Télécharger le PDF"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className={DOCUMENT_SCREEN_ONLY_CLASS}
        onClick={() => window.print()}
      >
        <Printer size={15} />
        Imprimer
      </Button>
      <Link
        className={cn(buttonVariants({ variant: "outline" }), DOCUMENT_LINK_HIDDEN_CLASS)}
        to={`/client/paiements/${document.paymentId}`}
      >
        <ArrowLeft size={14} /> Retour à la déclaration
      </Link>
    </>
  );

  return (
    <div className={cn(PAGE_CONTENT_CLASS, DOCUMENT_PAGE_CLASS)}>
      <PageHeader
        title={documentTitle(document)}
        description={`Document ${document.number}`}
        breadcrumb={["Accueil", "Mes reçus", document.number]}
        actions={actions}
      />
      <PaymentReceiptCard
        receipt={displayData}
        isDownloading={isDownloading}
        onDownload={() => void downloadPdf()}
        onPrint={() => window.print()}
      />
    </div>
  );
}
