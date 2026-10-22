import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Building2,
  CircleDollarSign,
  Clock3,
  FileSpreadsheet,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import { useSre } from "@/context/SreContext";
import { useAuth } from "@/context/AuthContext";
import { ROUTES_ADMIN } from "@/constants";
import { StatusBadge, StatCard, PageHeader, EmptyState } from "@/components/ui";
import { loadActivityLogApi } from "@/services/api-client";
import type { ActivityLogEntry } from "@/types";
import { formatMoney, formatDate } from "@/utils/format";

export function AdminDashboardPage() {
  const { state } = useSre();
  const { session } = useAuth();
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);
  const activeTaxpayers = state.taxpayers.filter(
    (taxpayer) => taxpayer.status === "ACTIF",
  );
  const people = activeTaxpayers.filter(
    (taxpayer) => taxpayer.type === "PARTICULIER",
  ).length;
  const businesses = activeTaxpayers.filter(
    (taxpayer) => taxpayer.type === "ENTREPRISE",
  ).length;
  const pendingPayments = state.payments.filter(
    (payment) => payment.status === "EN_VERIFICATION",
  );
  const paymentsConfirmedInInternal = state.payments.filter(
    (payment) => payment.status === "CONFIRME",
  );
  const internalConfirmedTotal = paymentsConfirmedInInternal.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const sixMonths = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - index));
        const total = paymentsConfirmedInInternal
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
    [paymentsConfirmedInInternal],
  );
  const maxMonths = Math.max(...sixMonths.map((month) => month.total), 1);
  const recentPayments = [...state.payments]
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, 5);

  useEffect(() => {
    if (!session?.apiToken) return;
    let ignore = false;
    loadActivityLogApi(session.apiToken, 8)
      .then((entries) => {
        if (!ignore) setActivity(entries);
      })
      .catch(() => {
        // The log may be unavailable: the dashboard remains viewable.
      });
    return () => {
      ignore = true;
    };
  }, [session?.apiToken]);

  const lastActivity = activity.slice(0, 4);

  return (
    <div className="page-content-sre">
      <PageHeader
        title="Tableau de bord"
        description="Suivi des données enregistrées pour le périmètre Haute Matsiatra."
        breadcrumb={["Accueil", "Tableau de bord"]}
        actions={
          <Link className="button-sre button-sre--primary" to={ROUTES_ADMIN.excelImport}>
            <FileSpreadsheet size={15} /> Importer un fichier
          </Link>
        }
      />

      <section className="statistics-grid-sre">
        <StatCard
          title="Contribuables actifs"
          value={activeTaxpayers.length}
          note={`${people} particuliers · ${businesses} entreprises`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Déclarations à examiner"
          value={pendingPayments.length}
          note="En attente d’une décision administrative"
          icon={Clock3}
          color="orange"
        />
        <StatCard
          title="Décisions confirmées en interne"
          value={formatMoney(internalConfirmedTotal)}
          note="Sans vérification bancaire indépendante"
          icon={BadgeCheck}
          color="green"
        />
        <StatCard
          title="Comptes utilisateurs"
          value={state.users.length}
          note={`${state.users.filter((account) => account.role === "ADMIN").length} administrateur(s)`}
          icon={UserRound}
          color="violet"
        />
      </section>

      {pendingPayments.length > 0 && (
        <Link className="alert-action-sre" to={ROUTES_ADMIN.paymentsToVerify}>
          <span>
            <Clock3 size={18} />
          </span>
          <div>
            <strong>
              {pendingPayments.length} déclaration{pendingPayments.length === 1 ? "" : "s"} en
              attente d’examen
            </strong>
            <small>
              Consultez les éléments déclarés et enregistrez une décision administrative.
            </small>
          </div>
          <ArrowRight size={17} />
        </Link>
      )}

      <div className="content-grid-sre">
        <section className="card-sre chart-sre">
          <div className="card-sre__header">
            <div>
              <h2>Montants des décisions internes</h2>
              <p>Six derniers mois · aucun contrôle bancaire n’est effectué par le portail</p>
            </div>
            <CircleDollarSign size={18} />
          </div>
          {paymentsConfirmedInInternal.length ? (
            <div className="chart-sre__content">
              <div className="chart-sre__value">{formatMoney(internalConfirmedTotal)}</div>
              <div className="month-bars-sre">
                {sixMonths.map((month) => (
                  <div key={month.nom}>
                    <span
                      title={formatMoney(month.total)}
                      style={{ height: `${Math.max(6, (month.total / maxMonths) * 100)}%` }}
                    />
                    <small>{month.nom}</small>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="Aucune décision confirmée"
              description="Les données apparaîtront après l’enregistrement d’une décision explicite par l’administration."
            />
          )}
        </section>

        <section className="card-sre quick-actions-sre">
          <div className="card-sre__header">
            <div>
              <h2>Actions rapides</h2>
              <p>Outils de gestion</p>
            </div>
          </div>
          <Link to={ROUTES_ADMIN.paymentsToVerify} className="shortcut-sre">
            <span>
              <WalletCards size={17} />
            </span>
            <div>
              <strong>Examiner les déclarations</strong>
              <small>{pendingPayments.length} en attente</small>
            </div>
            <ArrowRight size={15} />
          </Link>
          <Link to={ROUTES_ADMIN.taxpayers} className="shortcut-sre">
            <span>
              <Building2 size={17} />
            </span>
            <div>
              <strong>Gérer les contribuables</strong>
              <small>{activeTaxpayers.length} profils actifs</small>
            </div>
            <ArrowRight size={15} />
          </Link>
          <Link to={ROUTES_ADMIN.excelImport} className="shortcut-sre">
            <span>
              <FileSpreadsheet size={17} />
            </span>
            <div>
              <strong>Importer un fichier Excel</strong>
              <small>Analyser et valider avant import</small>
            </div>
            <ArrowRight size={15} />
          </Link>
          <Link to={ROUTES_ADMIN.activityLog} className="shortcut-sre">
            <span>
              <Activity size={17} />
            </span>
            <div>
              <strong>Journal d’activité</strong>
              <small>Consulter les événements disponibles</small>
            </div>
            <ArrowRight size={15} />
          </Link>
        </section>
      </div>

      <div className="content-grid-sre">
        <section className="card-sre">
          <div className="card-sre__header">
            <div>
              <h2>Déclarations récentes</h2>
              <p>Chaque déclaration nécessite un examen explicite.</p>
            </div>
            <Link className="subtle-link-sre" to={ROUTES_ADMIN.payments}>
              Tout afficher <ArrowRight size={14} />
            </Link>
          </div>
          {recentPayments.length ? (
            <div className="table-scroll-sre">
              <table className="table-sre">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Contribuable</th>
                    <th>Impôt</th>
                    <th>Montant déclaré</th>
                    <th>Soumis le</th>
                    <th>Statut</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => {
                    const taxpayer = state.taxpayers.find(
                      (entry) => entry.id === payment.taxpayerId,
                    );
                    const name =
                      taxpayer?.legalName ||
                      `${taxpayer?.firstName ?? ""} ${taxpayer?.lastName ?? ""}`.trim() ||
                      "Profil indisponible";
                    return (
                      <tr key={payment.id}>
                        <td data-label="Référence"><strong>{payment.internalReference}</strong></td>
                        <td data-label="Contribuable">{name}</td>
                        <td data-label="Impôt">{payment.taxTypeName}</td>
                        <td data-label="Montant déclaré">{formatMoney(payment.amount)}</td>
                        <td data-label="Soumis le">{formatDate(payment.submittedAt)}</td>
                        <td data-label="Statut">
                          <StatusBadge status={payment.status} />
                        </td>
                        <td data-label="Action">
                          <Link className="action-link-sre" to={ROUTES_ADMIN.payment(payment.id)}>
                            Détails <ArrowRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Aucune déclaration"
              description="Les déclarations soumises par les comptes contribuables apparaîtront ici."
            />
          )}
        </section>

        <section className="card-sre recent-activity-sre">
          <div className="card-sre__header">
            <div>
              <h2>Activité récente</h2>
              <p>Événements transmis par le serveur</p>
            </div>
            <Link className="subtle-link-sre" to={ROUTES_ADMIN.activityLog}>
              Journal <ArrowRight size={14} />
            </Link>
          </div>
          {lastActivity.length ? (
            lastActivity.map((row) => (
              <div className="activity-mini-sre" key={row.id}>
                <span>
                  {row.role === "ADMIN" ? <BadgeCheck size={15} /> : <UserRound size={15} />}
                </span>
                <div>
                  <strong>{row.action}</strong>
                  <small>
                    {row.acteur} · {formatDate(row.date, true)}
                  </small>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="Aucun événement disponible"
              description="Les actions réalisées par les comptes apparaîtront ici dès leur exécution."
            />
          )}
        </section>
      </div>
    </div>
  );
}
