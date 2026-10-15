import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, FileCheck2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { StatusBadge, PageHeader, EmptyState } from "@/components/ui";
import type { PaymentDocument } from "@/types/models";
import { formatMoney, formatDate } from "@/utils/format";
import { isApiConfigured, downloadPdfApi } from "@/services/api";

function titreDocument(document: PaymentDocument) {
  return document.type === "ACCUSE_DECLARATION"
    ? "Accusé de soumission de déclaration"
    : "Reçu interne de décision";
}

export function ClientDocumentDetailPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { etat, notifier } = useSre();
  const document = etat.documentsPaiement.find(
    (entree) =>
      entree.id === id &&
      entree.contribuableId === session?.contribuableId &&
      entree.statut === "VALIDE",
  );
  if (!document)
    return (
      <div className="page-contenu-sre">
        <PageHeader titre="Document introuvable" filAriane={["Mon espace", "Mes reçus"]} />
        <EmptyState
          titre="Ce document n’est pas accessible"
          description="Il n’existe pas ou ne fait pas partie de votre espace contribuable."
          action={
            <Link className="bouton-sre bouton-sre--contour" to="/client/documents">
              <ArrowLeft size={14} /> Retour à mes reçus
            </Link>
          }
        />
      </div>
    );
  const contribuable = etat.contribuables.find((entree) => entree.id === document.contribuableId);
  const nomContribuable =
    contribuable?.raisonSociale ||
    `${contribuable?.prenom ?? ""} ${contribuable?.nom ?? ""}`.trim() ||
    session?.nom ||
    "Contribuable";
  const estAccuse = document.type === "ACCUSE_DECLARATION";
  const telechargerPdf = async () => {
    if (!isApiConfigured || !session?.jetonApi) {
      notifier("Le téléchargement PDF nécessite une session serveur.", "erreur");
      return;
    }
    try {
      await downloadPdfApi(document.id, session.jetonApi, document.numero);
    } catch (cause) {
      notifier(cause instanceof Error ? cause.message : "Téléchargement PDF impossible.", "erreur");
    }
  };
  const actions = (
    <>
      <button
        className="bouton-sre bouton-sre--contour bouton-document-ecran-sre"
        onClick={() => void telechargerPdf()}
      >
        <Download size={15} />
        Télécharger le PDF
      </button>
      <Link
        className="bouton-sre bouton-sre--contour bouton-document-imprime-sre"
        to={`/client/paiements/${document.paiementId}`}
      >
        <ArrowLeft size={14} /> Retour à la déclaration
      </Link>
    </>
  );
  return (
    <div className="page-contenu-sre document-detail-page-sre">
      <PageHeader
        titre={titreDocument(document)}
        description={`Document ${document.numero}`}
        filAriane={["Mon espace", "Mes reçus", document.numero]}
        actions={actions}
      />
      <article className="document-paiement-sre" aria-label={titreDocument(document)}>
        <header className="document-paiement-sre__entete">
          <div className="document-paiement-sre__marque">
            <span>
              <ShieldCheck size={20} />
            </span>
            <div>
              <strong>SRE · Portail</strong>
              <small>DOCUMENT DE SUIVI</small>
            </div>
          </div>
          <StatusBadge statut={document.type} />
        </header>
        <div className="document-paiement-sre__titre">
          <p>{document.emetteur}</p>
          <h2>{titreDocument(document)}</h2>
          <span>N° {document.numero}</span>
        </div>
        <div
          className={`document-paiement-sre__alerte ${estAccuse ? "document-paiement-sre__alerte--accuse" : ""}`}
        >
          <ShieldCheck size={18} />
          <div>
            <strong>
              {estAccuse
                ? "Accusé de soumission — pas une preuve de paiement"
                : "Reçu interne de décision — pas une preuve bancaire"}
            </strong>
            <p>{document.mention}</p>
          </div>
        </div>
        <div className="document-paiement-sre__grille">
          <section>
            <h3>Contribuable</h3>
            <dl>
              <div>
                <dt>Nom / raison sociale</dt>
                <dd>{nomContribuable}</dd>
              </div>
              <div>
                <dt>NIF</dt>
                <dd>{contribuable?.nif ?? "—"}</dd>
              </div>
              <div>
                <dt>Courriel</dt>
                <dd>{contribuable?.courriel ?? session?.courriel ?? "—"}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h3>Déclaration associée</h3>
            <dl>
              <div>
                <dt>Référence interne</dt>
                <dd>
                  <Link to={`/client/paiements/${document.paiementId}`}>
                    {document.referencePaiement}
                  </Link>
                </dd>
              </div>
              <div>
                <dt>Type / période</dt>
                <dd>
                  {document.typeImpotNom} · {document.periode}
                </dd>
              </div>
              <div>
                <dt>Référence de transaction déclarée</dt>
                <dd>{document.referenceTransactionDeclaree}</dd>
              </div>
              <div>
                <dt>Mode indiqué</dt>
                <dd>{document.modeDeclare.replaceAll("_", " ")}</dd>
              </div>
            </dl>
          </section>
        </div>
        <div className="document-paiement-sre__montant">
          <span>Montant déclaré</span>
          <strong>{formatMoney(document.montant, document.devise)}</strong>
        </div>
        <footer className="document-paiement-sre__pied">
          <span>Émis le {formatDate(document.emisLe, true)}</span>
          <span>
            {document.emisPar
              ? `Décision saisie par ${document.emisPar}`
              : "Émission automatique à la soumission"}
          </span>
        </footer>
      </article>
      <div className="document-paiement-sre__note">
        <FileCheck2 size={16} />
        <p>
          Document récupéré depuis le backend et persisté en base de données. L’accusé atteste
          uniquement la soumission; le reçu interne n’est pas une preuve bancaire.
        </p>
      </div>
    </div>
  );
}
