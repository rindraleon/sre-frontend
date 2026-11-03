import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  FileCheck2,
  CircleDollarSign,
  Clock3,
  FileText,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import { useAuth } from "@/contexts";
import { useSre } from "@/contexts";
import {
  AMOUNT_CLASS,
  CARD_CLASS,
  CARD_HEADER_CLASS,
  CHART_CLASS,
  CHART_CONTENT_CLASS,
  CHART_VALUE_CLASS,
  CONTENT_GRID_CLASS,
  EmptyState,
  MONTH_BARS_CLASS,
  NOTIFICATION_MINI_CLASS,
  NOTIFICATION_MINI_DOT_CLASS,
  PAGE_CONTENT_CLASS,
  PageHeader,
  QUICK_ACTIONS_CLASS,
  REFERENCE_CLASS,
  SHORTCUT_CLASS,
  STATISTICS_GRID_CLASS,
  SUBTLE_LINK_CLASS,
  StatCard,
  StatusBadge,
  TABLE_SCROLL_CLASS,
  TABLE_SRE_CLASS,
  TIP_BANNER_CLASS,
  buttonVariants,
} from "@/components";
import { formatMoney, formatDate, cn } from "@/utils";

export function ClientDashboardPage() {
  const { session } = useAuth();
  const { state } = useSre();
  const taxpayer = state.taxpayers.find((entry) => entry.id === session?.taxpayerId);
  const obligations = state.obligations.filter(
    (obligation) => obligation.taxpayerId === taxpayer?.id,
  );
  const payments = state.payments
    .filter((payment) => payment.taxpayerId === taxpayer?.id)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const notifications = state.notifications
    .filter((notification) => notification.userId === session?.userId)
    .slice(0, 4);
  const openObligations = obligations.filter((obligation) =>
    ["A_PAYER", "EN_RETARD", "PAIEMENT_EN_COURS", "EN_VERIFICATION", "REJETE"].includes(
      obligation.status,
    ),
  );
  const outstandingAmount = openObligations.reduce((sum, obligation) => sum + obligation.amount, 0);
  const confirmedDecisions = payments.filter((payment) => payment.status === "CONFIRME");
  const confirmedDecisionsTotal = confirmedDecisions.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const pendingDeclarations = payments.filter((payment) =>
    ["EN_ATTENTE", "EN_VERIFICATION", "CORRECTION_DEMANDEE"].includes(payment.status),
  ).length;
  const rejectedDeclarations = payments.filter((payment) =>
    ["REJETE", "ECHEC", "ANNULE"].includes(payment.status),
  ).length;
  const receipts = payments.filter((payment) => Boolean(payment.receipt));

  const chartMonth = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - index));
        const total = confirmedDecisions
          .filter((payment) => {
            const dateDecision = new Date(payment.validatedAt ?? payment.submittedAt);
            return (
              dateDecision.getMonth() === date.getMonth() &&
              dateDecision.getFullYear() === date.getFullYear()
            );
          })
          .reduce((sum, payment) => sum + payment.amount, 0);
        return { nom: new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date), total };
      }),
    [confirmedDecisions],
  );
  const maximumChart = Math.max(...chartMonth.map((month) => month.total), 1);

  return (
    <div className={PAGE_CONTENT_CLASS}>
      <PageHeader
        title={`Bonjour, ${taxpayer?.type === "ENTREPRISE" ? taxpayer.legalName : (taxpayer?.firstName ?? session?.name ?? "Contribuable")}`}
        description="Retrouvez les obligations et déclarations enregistrées pour votre compte."
        breadcrumb={["Accueil", "Vue d’ensemble"]}
        actions={
          <Link className={buttonVariants({ variant: "primary" })} to="/client/paiements/nouveau">
            <CircleDollarSign size={16} /> Déclarer une opération
          </Link>
        }
      />

      <section className={STATISTICS_GRID_CLASS}>
        <StatCard
          title="Obligations à suivre"
          value={openObligations.length}
          note={formatMoney(outstandingAmount)}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Paiements en attente"
          value={pendingDeclarations}
          note="Sans reçu définitif à ce stade"
          icon={Clock3}
          color="orange"
        />
        <StatCard
          title="Paiements confirmés"
          value={confirmedDecisions.length}
          note={formatMoney(confirmedDecisionsTotal)}
          icon={BadgeCheck}
          color="green"
        />
        <StatCard
          title={`Reçus disponibles`}
          value={receipts.length}
          note={
            rejectedDeclarations
              ? `${rejectedDeclarations} paiement(s) sans reçu (échec, annulation, rejet)`
              : "Téléchargeables et imprimables"
          }
          icon={FileCheck2}
          color="violet"
        />
      </section>

      <div className={CONTENT_GRID_CLASS}>
        <section className={cn(CARD_CLASS, CHART_CLASS)}>
          <div className={CARD_HEADER_CLASS}>
            <div>
              <h2>Paiements confirmés</h2>
              <p>Montants confirmés par mois · MGA</p>
            </div>
            <WalletCards size={19} />
          </div>
          {confirmedDecisions.length ? (
            <div className={CHART_CONTENT_CLASS}>
              <div className={CHART_VALUE_CLASS}>{formatMoney(confirmedDecisionsTotal)}</div>
              <div className={MONTH_BARS_CLASS}>
                {chartMonth.map((month) => (
                  <div key={month.nom}>
                    <span
                      title={formatMoney(month.total)}
                      style={{ height: `${Math.max(6, (month.total / maximumChart) * 100)}%` }}
                    />
                    <small>{month.nom}</small>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="Aucune décision enregistrée"
              description="Les éléments apparaîtront après une décision explicite de l’administration."
            />
          )}
        </section>

        <section className={cn(CARD_CLASS, QUICK_ACTIONS_CLASS)}>
          <div className={CARD_HEADER_CLASS}>
            <div>
              <h2>Accès rapides</h2>
              <p>Gérez vos démarches</p>
            </div>
          </div>
          <Link to="/client/obligations" className={SHORTCUT_CLASS}>
            <span>
              <FileText size={17} />
            </span>
            <div>
              <strong>Consulter mes impôts</strong>
              <small>Obligations et échéances enregistrées</small>
            </div>
            <ArrowRight size={15} />
          </Link>
          <Link to="/client/paiements/nouveau" className={SHORTCUT_CLASS}>
            <span>
              <CircleDollarSign size={17} />
            </span>
            <div>
              <strong>Déclarer une opération</strong>
              <small>Référence soumise hors du portail</small>
            </div>
            <ArrowRight size={15} />
          </Link>
          <Link to="/client/profil" className={SHORTCUT_CLASS}>
            <span>
              <Users size={17} />
            </span>
            <div>
              <strong>Vérifier mon profil fiscal</strong>
              <small>Coordonnées et identifiants</small>
            </div>
            <ArrowRight size={15} />
          </Link>
        </section>
      </div>

      <section className={CARD_CLASS}>
        <div className={CARD_HEADER_CLASS}>
          <div>
            <h2>Dernières déclarations</h2>
            <p>Historique des éléments liés à votre compte</p>
          </div>
          <Link className={SUBTLE_LINK_CLASS} to="/client/paiements">
            Tout l’historique <ArrowRight size={14} />
          </Link>
        </div>
        {payments.length ? (
          <div className={TABLE_SCROLL_CLASS}>
            <table className={TABLE_SRE_CLASS}>
              <thead>
                <tr>
                  <th>Référence interne</th>
                  <th>Impôt / catégorie</th>
                  <th>Période</th>
                  <th>Montant déclaré</th>
                  <th>Mode déclaré</th>
                  <th>Soumis le</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 5).map((payment) => (
                  <tr key={payment.id}>
                    <td data-label="Référence interne">
                      <Link className={REFERENCE_CLASS} to={`/client/paiements/${payment.id}`}>
                        {payment.internalReference}
                      </Link>
                    </td>
                    <td data-label="Impôt / catégorie">{payment.taxTypeName}</td>
                    <td data-label="Période">{payment.period}</td>
                    <td data-label="Montant déclaré" className={AMOUNT_CLASS}>
                      {formatMoney(payment.amount)}
                    </td>
                    <td data-label="Mode déclaré">
                      <StatusBadge status={payment.mode} />
                    </td>
                    <td data-label="Soumis le">{formatDate(payment.submittedAt)}</td>
                    <td data-label="Statut">
                      <StatusBadge status={payment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Aucune déclaration"
            description="Lorsqu’une déclaration sera soumise, son suivi apparaîtra ici. La soumission ne confirme pas le règlement."
            action={
              <Link
                className={buttonVariants({ variant: "primary", size: "small" })}
                to="/client/paiements/nouveau"
              >
                Déclarer une opération
              </Link>
            }
          />
        )}
      </section>

      <section className={TIP_BANNER_CLASS}>
        <span>
          <ShieldCheck size={18} />
        </span>
        <div>
          <strong>Votre déclaration est validée automatiquement à la soumission.</strong>
          <p>
            Le reçu officiel est émis immédiatement, sans démarche supplémentaire. Ne communiquez
            jamais votre code PIN ni un code secret.
          </p>
        </div>
      </section>

      {notifications.length > 0 && (
        <section className={cn(CARD_CLASS, "")}>
          <div className={CARD_HEADER_CLASS}>
            <div>
              <h2>Notifications récentes</h2>
              <p>Messages adressés à votre compte uniquement</p>
            </div>
            <Link className={SUBTLE_LINK_CLASS} to="/client/notifications">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          {notifications.map((notification) => (
            <div className={NOTIFICATION_MINI_CLASS} key={notification.id}>
              <i className={notification.isRead ? "" : NOTIFICATION_MINI_DOT_CLASS} />
              <div>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
                <small>{formatDate(notification.date, true)}</small>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
