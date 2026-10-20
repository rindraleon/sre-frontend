import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, CircleDollarSign } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { StatusBadge, PageHeader, EmptyState } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

export function ClientObligationDetailPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { etat } = useSre();
  const obligation = etat.obligations.find(
    (entree) => entree.id === id && entree.contribuableId === session?.contribuableId,
  );

  if (!obligation) {
    return (
      <div className="page-contenu-sre">
        <PageHeader titre="Obligation introuvable" filAriane={["Accueil", "Mes impôts"]} />
        <EmptyState
          titre="Cette obligation n’est pas accessible"
          description="Elle n’existe pas ou ne fait pas partie des données de votre compte."
          action={
            <Link className="bouton-sre bouton-sre--contour" to="/client/obligations">
              <ArrowLeft size={15} /> Retour aux obligations
            </Link>
          }
        />
      </div>
    );
  }

  const type = etat.typesImpots.find((entree) => entree.id === obligation.typeImpotId);
  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre={obligation.typeImpotNom}
        description={`Référence ${obligation.referenceFiscale}`}
        filAriane={["Accueil", "Mes impôts", obligation.referenceFiscale]}
        actions={
          <Link className="bouton-sre bouton-sre--contour" to="/client/obligations">
            <ArrowLeft size={15} /> Retour
          </Link>
        }
      />
      <section className="grille-detail-obligation-sre">
        <article className="carte-sre carte-montant-obligation-sre">
          <span className="sur-titre-sre">MONTANT ENREGISTRÉ · MGA</span>
          <strong>{formatMoney(obligation.montant)}</strong>
          <StatusBadge statut={obligation.statut} />
          <small>Valeur transmise par le serveur</small>
        </article>
        <article className="carte-sre">
          <h2>Détails de l’obligation</h2>
          <dl className="liste-details-sre">
            <div>
              <dt>Catégorie</dt>
              <dd>{type?.categorie || "Non renseignée"}</dd>
            </div>
            <div>
              <dt>Type d’impôt</dt>
              <dd>{obligation.typeImpotNom}</dd>
            </div>
            <div>
              <dt>Période</dt>
              <dd>{obligation.periode}</dd>
            </div>
            <div>
              <dt>Échéance enregistrée</dt>
              <dd>
                <CalendarDays size={14} /> {formatDate(obligation.echeance)}
              </dd>
            </div>
            <div>
              <dt>Référence</dt>
              <dd>{obligation.referenceFiscale}</dd>
            </div>
            <div>
              <dt>Périodicité configurée</dt>
              <dd>{type?.periodicite || "Non renseignée"}</dd>
            </div>
          </dl>
        </article>
      </section>
      <section className="note-fiscale-sre">
        <span>i</span>
        <p>
          <strong>À noter :</strong> les données affichées reflètent les informations enregistrées
          dans le portail. Une déclaration de paiement restera « En vérification » et ne sera pas
          confirmée automatiquement.
        </p>
      </section>
      {obligation.statut !== "PAYE" && (
        <div className="actions-bas-page-sre">
          <Link
            className="bouton-sre bouton-sre--primaire"
            to={`/client/paiements/nouveau?obligationId=${encodeURIComponent(obligation.id)}`}
          >
            <CircleDollarSign size={16} /> Déclarer une opération
          </Link>
          <Link className="lien-action-sre" to="/client/paiements">
            Consulter l’historique <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
