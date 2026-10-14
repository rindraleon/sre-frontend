import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Download, FileCheck2, ShieldCheck } from "lucide-react";
import { utiliserAuthentificationSre } from "@/contexte/contexte-authentification-sre";
import { utiliserSre } from "@/contexte/contexte-sre";
import {
  BadgeSre,
  EntetePageSre,
  EtatVideSre,
  TableauSre,
  type ColonneTableauSre,
} from "@/composants/ui/composants-sre";
import type { DocumentPaiementSre } from "@/types/sre";
import { formaterArgent, formaterDate } from "@/utilitaires/formatage";
import { apiSreConfiguree, telechargerPdfApiSre } from "@/services/api-sre";

function titreDocument(document: DocumentPaiementSre) {
  return document.type === "ACCUSE_DECLARATION"
    ? "Accusé de soumission de déclaration"
    : "Reçu interne de décision";
}

export function DocumentsPaiementContribuableSre() {
  const { session } = utiliserAuthentificationSre();
  const { etat } = utiliserSre();
  const [page, definirPage] = useState(1);
  const [parPage, definirParPage] = useState(10);
  const documents = useMemo(
    () =>
      etat.documentsPaiement
        .filter(
          (document) =>
            document.contribuableId === session?.contribuableId && document.statut === "VALIDE",
        )
        .sort((a, b) => b.emisLe.localeCompare(a.emisLe)),
    [etat.documentsPaiement, session?.contribuableId],
  );
  const colonnes: ColonneTableauSre<DocumentPaiementSre>[] = [
    {
      id: "numero",
      titre: "Document",
      afficher: (document) => (
        <>
          <Link className="reference-sre" to={`/client/documents/${document.id}`}>
            {document.numero}
          </Link>
          <small className="sous-ligne-sre">{titreDocument(document)}</small>
        </>
      ),
      valeurTri: (document) => document.numero,
    },
    {
      id: "paiement",
      titre: "Déclaration associée",
      afficher: (document) => (
        <Link className="lien-action-sre" to={`/client/paiements/${document.paiementId}`}>
          {document.referencePaiement} <ArrowRight size={13} />
        </Link>
      ),
      valeurTri: (document) => document.referencePaiement,
    },
    {
      id: "montant",
      titre: "Montant déclaré",
      afficher: (document) => (
        <span className="montant-sre">{formaterArgent(document.montant, document.devise)}</span>
      ),
      valeurTri: (document) => document.montant,
    },
    {
      id: "emis",
      titre: "Date d’émission",
      afficher: (document) => formaterDate(document.emisLe, true),
      valeurTri: (document) => document.emisLe,
    },
    {
      id: "type",
      titre: "Nature",
      afficher: (document) => <BadgeSre statut={document.type} />,
      valeurTri: (document) => document.type,
    },
    {
      id: "action",
      titre: "",
      afficher: (document) => (
        <Link className="lien-action-sre" to={`/client/documents/${document.id}`}>
          Consulter <ArrowRight size={13} />
        </Link>
      ),
    },
  ];
  return (
    <div className="page-contenu-sre">
      <EntetePageSre
        titre="Mes reçus et documents"
        description="Retrouvez les accusés de réception et les reçus internes liés à vos déclarations."
        filAriane={["Mon espace", "Mes reçus"]}
      />
      <div className="note-fiscale-sre">
        <span>
          <ShieldCheck size={15} />
        </span>
        <p>
          Un accusé atteste la soumission d’une déclaration. Un reçu interne n’est émis qu’après une
          décision administrative et ne constitue pas un justificatif bancaire.
        </p>
      </div>
      <TableauSre
        lignes={documents}
        colonnes={colonnes}
        obtenirId={(document) => document.id}
        espaceVide="Aucun document"
        messageVide="Les accusés et reçus associés à vos déclarations apparaîtront ici."
        page={page}
        parPage={parPage}
        changerPage={definirPage}
        changerParPage={definirParPage}
      />
    </div>
  );
}

export function DetailDocumentPaiementContribuableSre() {
  const { id } = useParams();
  const { session } = utiliserAuthentificationSre();
  const { etat, notifier } = utiliserSre();
  const document = etat.documentsPaiement.find(
    (entree) =>
      entree.id === id &&
      entree.contribuableId === session?.contribuableId &&
      entree.statut === "VALIDE",
  );
  if (!document)
    return (
      <div className="page-contenu-sre">
        <EntetePageSre titre="Document introuvable" filAriane={["Mon espace", "Mes reçus"]} />
        <EtatVideSre
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
    if (!apiSreConfiguree || !session?.jetonApi) {
      notifier("Le téléchargement PDF nécessite une session serveur.", "erreur");
      return;
    }
    try {
      await telechargerPdfApiSre(document.id, session.jetonApi, document.numero);
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
      <EntetePageSre
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
          <BadgeSre statut={document.type} />
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
          <strong>{formaterArgent(document.montant, document.devise)}</strong>
        </div>
        <footer className="document-paiement-sre__pied">
          <span>Émis le {formaterDate(document.emisLe, true)}</span>
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
