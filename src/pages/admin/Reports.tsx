import { Select } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { ArrowDownToLine, ChartNoAxesCombined, CircleDollarSign, Users } from "lucide-react";
import { useSre } from "@/context/SreContext";
import { StatusBadge, Button, PageHeader, EmptyState } from "@/components/ui";
import { OptionsSelect } from "@/components/forms/options-select";
import { TAXPAYER_TYPE_OPTIONS, ALL } from "@/constants";
import { formatMoney } from "@/utils/format";
import { matchesFiscalPeriod, listFiscalPeriods } from "@/utils/fiscal-periods";

function protectCsv(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}
export function AdminReportsPage() {
  const { state, notify } = useSre();
  const today = new Date().toISOString().slice(0, 10);
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
  const [start, setStart] = useState(twelveMonthsAgo.toISOString().slice(0, 10));
  const [end, setEnd] = useState(today);
  const [taxpayerType, setTaxpayerType] = useState<string>(ALL);
  const [fiscalPeriod, setFiscalPeriod] = useState("");
  const fiscalPeriods = useMemo(
    () => listFiscalPeriods(state.payments.map((payment) => payment.period)),
    [state.payments],
  );
  const filteredTaxpayers = useMemo(
    () =>
      state.taxpayers
        .filter(
          (taxpayer) => taxpayerType === "TOUS" || taxpayer.type === taxpayerType,
        )
        .filter((taxpayer) => !start || taxpayer.accountCreatedAt.slice(0, 10) >= start)
        .filter((taxpayer) => !end || taxpayer.accountCreatedAt.slice(0, 10) <= end),
    [state.taxpayers, taxpayerType, start, end],
  );
  const filteredPayments = useMemo(
    () =>
      state.payments
        .filter((payment) => {
          const taxpayer = state.taxpayers.find(
            (entry) => entry.id === payment.taxpayerId,
          );
          return (
            taxpayer && (taxpayerType === "TOUS" || taxpayer.type === taxpayerType)
          );
        })
        .filter((payment) => matchesFiscalPeriod(payment.period, fiscalPeriod))
        .filter((payment) => !start || payment.submittedAt.slice(0, 10) >= start)
        .filter((payment) => !end || payment.submittedAt.slice(0, 10) <= end),
    [state.payments, state.taxpayers, taxpayerType, fiscalPeriod, start, end],
  );
  const confirmed = filteredPayments.filter((payment) => payment.status === "CONFIRME");
  const waiting = filteredPayments.filter((payment) => payment.status === "EN_VERIFICATION");
  const confirmedAmount = confirmed.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = waiting.reduce((sum, payment) => sum + payment.amount, 0);
  const dataByType = ["PARTICULIER", "ENTREPRISE"].map((type) => {
    const accounts = filteredTaxpayers.filter((taxpayer) => taxpayer.type === type);
    const payments = filteredPayments.filter((payment) =>
      accounts.some((taxpayer) => taxpayer.id === payment.taxpayerId),
    );
    return {
      type,
      accounts: accounts.length,
      payments: payments.length,
      confirmedAmount: payments
        .filter((payment) => payment.status === "CONFIRME")
        .reduce((sum, payment) => sum + payment.amount, 0),
    };
  });
  const dataByStatus = ["EN_VERIFICATION", "CONFIRME", "REJETE", "CORRECTION_DEMANDEE"].map(
    (status) => ({
      status,
      count: filteredPayments.filter((payment) => payment.status === status).length,
      amount: filteredPayments
        .filter((payment) => payment.status === status)
        .reduce((sum, payment) => sum + payment.amount, 0),
    }),
  );
  const exportCsv = () => {
    const rows = [
      ["Période début", start],
      ["Période fin", end],
      ["Période fiscale", fiscalPeriod || "Toutes les périodes"],
      [],
      ["Type contribuable", "Comptes", "Déclarations", "Montant confirmé en interne (MGA)"],
      ...dataByType.map((entry) => [
        entry.type,
        entry.accounts,
        entry.payments,
        entry.confirmedAmount,
      ]),
      [],
      ["Statut déclaration", "Nombre", "Montant déclaré (MGA)"],
      ...dataByStatus.map((entry) => [entry.status, entry.count, entry.amount]),
    ];
    const csv =
      "\uFEFF" +
      rows
        .map((row) => row.map((cell) => protectCsv(cell ?? "")).join(";"))
        .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `rapport-sre-${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify("Rapport agrégé exporté en CSV.", "success");
  };
  const monthlySeries = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - index));
        const rows = filteredPayments.filter((payment) => {
          const dateRef = new Date(payment.validatedAt ?? payment.submittedAt);
          return (
            dateRef.getMonth() === date.getMonth() &&
            dateRef.getFullYear() === date.getFullYear() &&
            payment.status === "CONFIRME"
          );
        });
        return {
          month: new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date),
          amount: rows.reduce((sum, payment) => sum + payment.amount, 0),
        };
      }),
    [filteredPayments],
  );
  const maximum = Math.max(...monthlySeries.map((entry) => entry.amount), 1);
  return (
    <div className="page-content-sre">
      <PageHeader
        title="Rapports & statistiques"
        description="Indicateurs calculés à partir des données transmises par le serveur."
        breadcrumb={["Accueil", "Rapports & statistiques"]}
        actions={
          <Button variant="outline" onClick={exportCsv}>
            <ArrowDownToLine size={15} /> Exporter CSV
          </Button>
        }
      />
      <div className="card-sre report-filters-sre">
        <label>
          Période du
          <input
            className="field-simple-sre"
            type="date"
            value={start}
            max={end || today}
            onChange={(event) => setStart(event.target.value)}
          />
        </label>
        <label>
          Au
          <input
            className="field-simple-sre"
            type="date"
            value={end}
            min={start}
            max={today}
            onChange={(event) => setEnd(event.target.value)}
          />
        </label>
        <label>
          Période fiscale
          <Select
            className="field-simple-sre"
            value={fiscalPeriod}
            onChange={(event) => setFiscalPeriod(event.target.value)}
            aria-label="Période fiscale"
          >
            <option value="">Toutes les périodes</option>
            {fiscalPeriods.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </Select>
        </label>
        <label>
          Type de contribuable
          <Select
            className="field-simple-sre"
            value={taxpayerType}
            onChange={(event) => setTaxpayerType(event.target.value)}
          >
            <OptionsSelect options={TAXPAYER_TYPE_OPTIONS} />
          </Select>
        </label>
        <span aria-live="polite">
          {filteredTaxpayers.length} contribuable(s) · {filteredPayments.length} déclaration(s)
        </span>
      </div>
      <section className="statistics-grid-sre">
        <article className="stat-card-sre">
          <span className="stat-card-sre__icon stat-card-sre__icon--blue">
            <Users size={18} />
          </span>
          <div>
            <span>Comptes créés</span>
            <strong>{filteredTaxpayers.length}</strong>
            <small>Profils dans la période choisie</small>
          </div>
        </article>
        <article className="stat-card-sre">
          <span className="stat-card-sre__icon stat-card-sre__icon--green">
            <CircleDollarSign size={18} />
          </span>
          <div>
            <span>Montants confirmés</span>
            <strong className="stat-text-value-sre">{formatMoney(confirmedAmount)}</strong>
            <small>{confirmed.length} décision(s) explicite(s)</small>
          </div>
        </article>
        <article className="stat-card-sre">
          <span className="stat-card-sre__icon stat-card-sre__icon--orange">
            <ChartNoAxesCombined size={18} />
          </span>
          <div>
            <span>En vérification</span>
            <strong>{waiting.length}</strong>
            <small>{formatMoney(pendingAmount)} déclaré(s), non confirmé(s)</small>
          </div>
        </article>
      </section>
      <div className="content-grid-sre">
        <section className="card-sre chart-sre">
          <div className="card-sre__header">
            <div>
              <h2>Montants confirmés par mois</h2>
              <p>Six derniers mois de la période · MGA</p>
            </div>
            <ChartNoAxesCombined size={18} />
          </div>
          {filteredPayments.length ? (
            <div className="chart-sre__content">
              <div className="chart-sre__value">{formatMoney(confirmedAmount)}</div>
              <div className="month-bars-sre">
                {monthlySeries.map((month) => (
                  <div key={month.month}>
                    <span
                      title={formatMoney(month.amount)}
                      style={{ height: `${Math.max(6, (month.amount / maximum) * 100)}%` }}
                    />
                    <small>{month.month}</small>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="Aucune déclaration sur la période"
              description="Modifiez les dates ou consultez le rapport lorsque des déclarations seront enregistrées."
            />
          )}
        </section>
        <section className="card-sre">
          <div className="card-sre__header">
            <div>
              <h2>Répartition par statut</h2>
              <p>Montants déclarés, sans confirmation automatique</p>
            </div>
          </div>
          {dataByStatus.map((entry) => (
            <div className="report-status-row-sre" key={entry.status}>
              <StatusBadge status={entry.status} />
              <div>
                <strong>{entry.count}</strong>
                <small>{formatMoney(entry.amount)}</small>
              </div>
            </div>
          ))}
        </section>
      </div>
      <section className="card-sre">
        <div className="card-sre__header">
          <div>
            <h2>Répartition par profil</h2>
            <p>Comptes et décisions agrégés</p>
          </div>
        </div>
        <div className="table-scroll-sre">
          <table className="table-sre">
            <thead>
              <tr>
                <th>Type de contribuable</th>
                <th>Profils</th>
                <th>Déclarations</th>
                <th>Montant confirmé en interne</th>
              </tr>
            </thead>
            <tbody>
              {dataByType.map((entry) => (
                <tr key={entry.type}>
                  <td data-label="Type de contribuable">
                    <StatusBadge status={entry.type} />
                  </td>
                  <td data-label="Profils">{entry.accounts}</td>
                  <td data-label="Déclarations">{entry.payments}</td>
                  <td data-label="Montant confirmé en interne">{formatMoney(entry.confirmedAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="tax-note-sre">
        <span>i</span>
        <p>
          Les montants confirmés reflètent les décisions administratives enregistrées. Ils ne
          constituent ni une vérification bancaire, ni un état de recettes officiel.
        </p>
      </div>
    </div>
  );
}
