import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CircleDollarSign,
  Clock3,
  FileText,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { StatusBadge, StatCard, PageHeader, EmptyState } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

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
  const outstandingAmount = openObligations.reduce(
    (sum, obligation) => sum + obligation.amount,
    0,
  );
  const confirmedDecisions = payments.filter((payment) => payment.status === "CONFIRME");
  const confirmedDecisionsTotal = confirmedDecisions.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const pendingDeclarations = payments.filter((payment) =>
    ["EN_VERIFICATION", "CORRECTION_DEMANDEE"].includes(payment.status),
  ).length;
  const rejectedDeclarations = payments.filter((payment) => payment.status === "REJETE").length;

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
    <div className="page-content-sre">
      <PageHeader
        title={`Bonjour, ${taxpayer?.type === "ENTREPRISE" ? taxpayer.legalName : (taxpayer?.firstName ?? session?.name ?? "Contribuable")}`}
        description="Retrouvez les obligations et déclarations enregistrées pour votre compte."
        breadcrumb={["Accueil", "Vue d’ensemble"]}
        actions={
          <Link className="button-sre button-sre--primary" to="/client/paiements/nouveau">
            <CircleDollarSign size={16} /> Déclarer une opération
          </Link>
        }
      />

      

      <section className="statistics-grid-sre">
        <StatCard
          title="Obligations à suivre"
          value={openObligations.length}
          note={formatMoney(outstandingAmount)}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Déclarations en cours"
          value={pendingDeclarations}
          note="En attente d’une décision administrative"
          icon={Clock3}
          color="orange"
        />
        <StatCard
          title="Décisions confirmées en interne"
          value={confirmedDecisions.length}
          note={formatMoney(confirmedDecisionsTotal)}
          icon={BadgeCheck}
          color="green"
        />
        <StatCard
          title="Déclarations rejetées"
          value={rejectedDeclarations}
          note="Consultez le motif de décision"
          icon={Bell}
          color="violet"
        />
      </section>

      <div className="content-grid-sre">
        <section className="card-sre chart-sre">
          <div className="card-sre__header">
            <div>
              <h2>Décisions administratives</h2>
              <p>Montants associés aux décisions explicites · MGA</p>
            </div>
            <WalletCards size={19} />
          </div>
          {confirmedDecisions.length ? (
            <div className="chart-sre__content">
              <div className="chart-sre__value">{formatMoney(confirmedDecisionsTotal)}</div>
              <div className="month-bars-sre">
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

        <section className="card-sre quick-actions-sre">
          <div className="card-sre__header">
            <div>
              <h2>Accès rapides</h2>
              <p>Gérez vos démarches</p>
            </div>
          </div>
          <Link to="/client/obligations" className="shortcut-sre">
            <span>
              <FileText size={17} />
            </span>
            <div>
              <strong>Consulter mes impôts</strong>
              <small>Obligations et échéances enregistrées</small>
            </div>
            <ArrowRight size={15} />
          </Link>
          <Link to="/client/paiements/nouveau" className="shortcut-sre">
            <span>
              <CircleDollarSign size={17} />
            </span>
            <div>
              <strong>Déclarer une opération</strong>
              <small>Référence soumise hors du portail</small>
            </div>
            <ArrowRight size={15} />
          </Link>
          <Link to="/client/profil" className="shortcut-sre">
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

      <section className="card-sre">
        <div className="card-sre__header">
          <div>
            <h2>Dernières déclarations</h2>
            <p>Historique des éléments liés à votre compte</p>
          </div>
          <Link className="subtle-link-sre" to="/client/paiements">
            Tout l’historique <ArrowRight size={14} />
          </Link>
        </div>
        {payments.length ? (
          <div className="table-scroll-sre">
            <table className="table-sre">
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
                      <Link className="reference-sre" to={`/client/paiements/${payment.id}`}>
                        {payment.internalReference}
                      </Link>
                    </td>
                    <td data-label="Impôt / catégorie">{payment.taxTypeName}</td>
                    <td data-label="Période">{payment.period}</td>
                    <td data-label="Montant déclaré" className="amount-sre">{formatMoney(payment.amount)}</td>
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
                className="button-sre button-sre--primary button-sre--small"
                to="/client/paiements/nouveau"
              >
                Déclarer une opération
              </Link>
            }
          />
        )}
      </section>

      <section className="tip-banner-sre">
        <span>
          <ShieldCheck size={18} />
        </span>
        <div>
          <strong>La soumission n’est pas une confirmation de paiement.</strong>
          <p>
            Une déclaration reste « En vérification » jusqu’à une décision explicite. Ne communiquez
            jamais votre code PIN ni un code secret.
          </p>
        </div>
      </section>

      {notifications.length > 0 && (
        <section className="card-sre recent-notifications-sre">
          <div className="card-sre__header">
            <div>
              <h2>Notifications récentes</h2>
              <p>Messages adressés à votre compte uniquement</p>
            </div>
            <Link className="subtle-link-sre" to="/client/notifications">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          {notifications.map((notification) => (
            <div className="notification-mini-sre" key={notification.id}>
              <i className={notification.isRead ? "" : "notification-mini-sre__dot"} />
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
