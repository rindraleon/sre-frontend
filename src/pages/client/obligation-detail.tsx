import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, CircleDollarSign } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { StatusBadge, PageHeader, EmptyState } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

export function ClientObligationDetailPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { state } = useSre();
  const obligation = state.obligations.find(
    (entry) => entry.id === id && entry.taxpayerId === session?.taxpayerId,
  );

  if (!obligation) {
    return (
      <div className="page-content-sre">
        <PageHeader title="Obligation introuvable" breadcrumb={["Accueil", "Mes impôts"]} />
        <EmptyState
          title="Cette obligation n’est pas accessible"
          description="Elle n’existe pas ou ne fait pas partie des données de votre compte."
          action={
            <Link className="button-sre button-sre--outline" to="/client/obligations">
              <ArrowLeft size={15} /> Retour aux obligations
            </Link>
          }
        />
      </div>
    );
  }

  const type = state.taxTypes.find((entry) => entry.id === obligation.taxTypeId);
  return (
    <div className="page-content-sre">
      <PageHeader
        title={obligation.taxTypeName}
        description={`Référence ${obligation.taxReference}`}
        breadcrumb={["Accueil", "Mes impôts", obligation.taxReference]}
        actions={
          <Link className="button-sre button-sre--outline" to="/client/obligations">
            <ArrowLeft size={15} /> Retour
          </Link>
        }
      />
      <section className="obligation-detail-grid-sre">
        <article className="card-sre obligation-amount-card-sre">
          <span className="overline-sre">MONTANT ENREGISTRÉ · MGA</span>
          <strong>{formatMoney(obligation.amount)}</strong>
          <StatusBadge status={obligation.status} />
          <small>Valeur transmise par le serveur</small>
        </article>
        <article className="card-sre">
          <h2>Détails de l’obligation</h2>
          <dl className="details-list-sre">
            <div>
              <dt>Catégorie</dt>
              <dd>{type?.category || "Non renseignée"}</dd>
            </div>
            <div>
              <dt>Type d’impôt</dt>
              <dd>{obligation.taxTypeName}</dd>
            </div>
            <div>
              <dt>Période</dt>
              <dd>{obligation.period}</dd>
            </div>
            <div>
              <dt>Échéance enregistrée</dt>
              <dd>
                <CalendarDays size={14} /> {formatDate(obligation.dueDate)}
              </dd>
            </div>
            <div>
              <dt>Référence</dt>
              <dd>{obligation.taxReference}</dd>
            </div>
            <div>
              <dt>Périodicité configurée</dt>
              <dd>{type?.periodicity || "Non renseignée"}</dd>
            </div>
          </dl>
        </article>
      </section>
      <section className="tax-note-sre">
        <span>i</span>
        <p>
          <strong>À noter :</strong> les données affichées reflètent les informations enregistrées
          dans le portail. Une déclaration de paiement restera « En vérification » et ne sera pas
          confirmée automatiquement.
        </p>
      </section>
      {obligation.status !== "PAYE" && (
        <div className="page-bottom-actions-sre">
          <Link
            className="button-sre button-sre--primary"
            to={`/client/paiements/nouveau?obligationId=${encodeURIComponent(obligation.id)}`}
          >
            <CircleDollarSign size={16} /> Déclarer une opération
          </Link>
          <Link className="action-link-sre" to="/client/paiements">
            Consulter l’historique <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
