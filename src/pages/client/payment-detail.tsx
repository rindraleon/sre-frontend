import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileCheck2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { StatusBadge, PageHeader, EmptyState } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

export function ClientPaymentDetailPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { etat } = useSre();
  const paiement = etat.paiements.find(
    (entree) => entree.id === id && entree.contribuableId === session?.contribuableId,
  );
  if (!paiement)
    return (
      <div className="page-contenu-sre">
        <PageHeader
          titre="Déclaration introuvable"
          filAriane={["Accueil", "Historique des paiements"]}
        />
        <EmptyState
          titre="Cette déclaration n’est pas accessible"
          description="Elle n’existe pas ou ne fait pas partie de votre espace contribuable."
          action={
            <Link className="bouton-sre bouton-sre--contour" to="/client/paiements">
              <ArrowLeft size={14} /> Retour à l’historique
            </Link>
          }
        />
      </div>
    );
  const obligation = etat.obligations.find(
    (entree) =>
      entree.id === paiement.obligationId && entree.contribuableId === session?.contribuableId,
  );
  const documentsPaiement = etat.documentsPaiement.filter(
    (document) =>
      document.paiementId === paiement.id &&
      document.contribuableId === session?.contribuableId &&
      document.statut === "VALIDE",
  );
  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Suivi de la déclaration"
        description={`Référence interne ${paiement.referenceInterne}`}
        filAriane={["Accueil", "Historique des paiements", paiement.referenceInterne]}
        actions={
          <Link className="bouton-sre bouton-sre--contour" to="/client/paiements">
            <ArrowLeft size={14} /> Retour à l’historique
          </Link>
        }
      />
      <div className="grille-detail-paiement-sre">
        <section className="carte-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>{paiement.typeImpotNom}</h2>
              <p>Période {paiement.periode}</p>
            </div>
            <StatusBadge statut={paiement.statut} />
          </div>
          <div className="montant-detail-paiement-sre">
            <span>Montant déclaré</span>
            <strong>{formatMoney(paiement.montant)}</strong>
            <small>Montant transmis pour examen · MGA</small>
          </div>
          <dl className="liste-details-sre">
            <div>
              <dt>Référence de l’opération déclarée</dt>
              <dd>{paiement.referenceTransaction}</dd>
            </div>
            <div>
              <dt>Mode déclaré</dt>
              <dd>
                <StatusBadge statut={paiement.mode} />
              </dd>
            </div>
            {paiement.operateur && (
              <div>
                <dt>Opérateur / téléphone</dt>
                <dd>
                  {paiement.operateur.replace("_", " ")} · {paiement.telephoneUtilise}
                </dd>
              </div>
            )}
            {paiement.banqueOuCanal && (
              <div>
                <dt>Canal indiqué</dt>
                <dd>{paiement.banqueOuCanal}</dd>
              </div>
            )}
            <div>
              <dt>Date déclarée</dt>
              <dd>{formatDate(paiement.dateTransaction)}</dd>
            </div>
            <div>
              <dt>Soumise le</dt>
              <dd>{formatDate(paiement.soumisLe, true)}</dd>
            </div>
          </dl>
          <div className="documents-paiement-liste-sre">
            <div className="carte-sre__entete">
              <div>
                <h3>Documents associés</h3>
                <p>Émis par le serveur selon l’état du dossier</p>
              </div>
              <FileCheck2 size={17} />
            </div>
            {documentsPaiement.length ? (
              documentsPaiement.map((document) => (
                <Link
                  className="documents-paiement-ligne-sre"
                  key={document.id}
                  to={`/client/documents/${document.id}`}
                >
                  <span>
                    <strong>{document.numero}</strong>
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
              <p className="texte-aide-sre">
                Aucun document n’est disponible pour cette déclaration.
              </p>
            )}
          </div>
          {paiement.motifRejet && (
            <div className="motif-decision-sre">
              <strong>
                {paiement.statut === "REJETE" ? "Motif de rejet" : "Correction demandée"}
              </strong>
              <p>{paiement.motifRejet}</p>
            </div>
          )}
        </section>
        <section className="carte-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Historique de traitement</h2>
              <p>Étapes enregistrées par le serveur</p>
            </div>
          </div>
          <ol className="historique-vertical-sre">
            {paiement.historique
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((etape, index) => (
                <li key={`${etape.date}-${index}`}>
                  <i
                    className={
                      index === paiement.historique.length - 1
                        ? "historique-vertical-sre__actif"
                        : ""
                    }
                  />
                  <div>
                    <strong>{etape.libelle}</strong>
                    <p>
                      {etape.acteur}
                      {etape.motif ? ` · ${etape.motif}` : ""}
                    </p>
                    <small>{formatDate(etape.date, true)}</small>
                  </div>
                </li>
              ))}
          </ol>
          {obligation && (
            <div className="note-fiscale-sre">
              <span>i</span>
              <p>
                Obligation associée :{" "}
                <Link to={`/client/obligations/${obligation.id}`}>
                  {obligation.referenceFiscale}
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
