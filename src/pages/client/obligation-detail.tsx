import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, CircleDollarSign } from "lucide-react";
import { useAuth } from "@/contexts";
import { useSre } from "@/contexts";
import {
  ACTION_LINK_CLASS,
  CARD_CLASS,
  DETAILS_LIST_CLASS,
  DETAIL_GRID_CLASS,
  EmptyState,
  OBLIGATION_AMOUNT_CARD_CLASS,
  OVERLINE_CLASS,
  PAGE_BOTTOM_ACTIONS_CLASS,
  PAGE_CONTENT_CLASS,
  PageHeader,
  StatusBadge,
  TAX_NOTE_CLASS,
  buttonVariants,
} from "@/components";
import { formatMoney, formatDate, cn } from "@/utils";

export function ClientObligationDetailPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { state } = useSre();
  const obligation = state.obligations.find(
    (entry) => entry.id === id && entry.taxpayerId === session?.taxpayerId,
  );

  if (!obligation) {
    return (
      <div className={PAGE_CONTENT_CLASS}>
        <PageHeader title="Obligation introuvable" breadcrumb={["Accueil", "Mes impôts"]} />
        <EmptyState
          title="Cette obligation n’est pas accessible"
          description="Elle n’existe pas ou ne fait pas partie des données de votre compte."
          action={
            <Link className={buttonVariants({ variant: "outline" })} to="/client/obligations">
              <ArrowLeft size={15} /> Retour aux obligations
            </Link>
          }
        />
      </div>
    );
  }

  const type = state.taxTypes.find((entry) => entry.id === obligation.taxTypeId);
  return (
    <div className={PAGE_CONTENT_CLASS}>
      <PageHeader
        title={obligation.taxTypeName}
        description={`Référence ${obligation.taxReference}`}
        breadcrumb={["Accueil", "Mes impôts", obligation.taxReference]}
        actions={
          <Link className={buttonVariants({ variant: "outline" })} to="/client/obligations">
            <ArrowLeft size={15} /> Retour
          </Link>
        }
      />
      <section className={DETAIL_GRID_CLASS}>
        <article className={cn(CARD_CLASS, OBLIGATION_AMOUNT_CARD_CLASS)}>
          <span className={OVERLINE_CLASS}>MONTANT ENREGISTRÉ · MGA</span>
          <strong>{formatMoney(obligation.amount)}</strong>
          <StatusBadge status={obligation.status} />
          <small>Valeur transmise par le serveur</small>
        </article>
        <article className={CARD_CLASS}>
          <h2>Détails de l’obligation</h2>
          <dl className={DETAILS_LIST_CLASS}>
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
      <section className={TAX_NOTE_CLASS}>
        <span>i</span>
        <p>
          <strong>À noter :</strong> les données affichées reflètent les informations enregistrées
          dans le portail. Une déclaration de paiement est validée automatiquement et son reçu
          officiel est émis immédiatement.
        </p>
      </section>
      {obligation.status !== "PAYE" && (
        <div className={PAGE_BOTTOM_ACTIONS_CLASS}>
          <Link
            className={buttonVariants({ variant: "primary" })}
            to={`/client/paiements/nouveau?obligationId=${encodeURIComponent(obligation.id)}`}
          >
            <CircleDollarSign size={16} /> Déclarer une opération
          </Link>
          <Link className={ACTION_LINK_CLASS} to="/client/paiements">
            Consulter l’historique <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
