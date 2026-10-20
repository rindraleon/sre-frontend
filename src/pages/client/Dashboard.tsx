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
  const { etat } = useSre();
  const contribuable = etat.contribuables.find((entree) => entree.id === session?.contribuableId);
  const obligations = etat.obligations.filter(
    (obligation) => obligation.contribuableId === contribuable?.id,
  );
  const paiements = etat.paiements
    .filter((paiement) => paiement.contribuableId === contribuable?.id)
    .sort((a, b) => b.soumisLe.localeCompare(a.soumisLe));
  const notifications = etat.notifications
    .filter((notification) => notification.utilisateurId === session?.utilisateurId)
    .slice(0, 4);
  const obligationsOuvertes = obligations.filter((obligation) =>
    ["A_PAYER", "EN_RETARD", "PAIEMENT_EN_COURS", "EN_VERIFICATION", "REJETE"].includes(
      obligation.statut,
    ),
  );
  const montantOuvert = obligationsOuvertes.reduce(
    (somme, obligation) => somme + obligation.montant,
    0,
  );
  const decisionsConfirmees = paiements.filter((paiement) => paiement.statut === "CONFIRME");
  const totalDecisionsConfirmees = decisionsConfirmees.reduce(
    (somme, paiement) => somme + paiement.montant,
    0,
  );
  const declarationsEnAttente = paiements.filter((paiement) =>
    ["EN_VERIFICATION", "CORRECTION_DEMANDEE"].includes(paiement.statut),
  ).length;
  const declarationsRejetees = paiements.filter((paiement) => paiement.statut === "REJETE").length;

  const moisGraphique = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - index));
        const total = decisionsConfirmees
          .filter((paiement) => {
            const dateDecision = new Date(paiement.valideLe ?? paiement.soumisLe);
            return (
              dateDecision.getMonth() === date.getMonth() &&
              dateDecision.getFullYear() === date.getFullYear()
            );
          })
          .reduce((somme, paiement) => somme + paiement.montant, 0);
        return { nom: new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date), total };
      }),
    [decisionsConfirmees],
  );
  const maximumGraphique = Math.max(...moisGraphique.map((mois) => mois.total), 1);

  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre={`Bonjour, ${contribuable?.type === "ENTREPRISE" ? contribuable.raisonSociale : (contribuable?.prenom ?? session?.nom ?? "Contribuable")}`}
        description="Retrouvez les obligations et déclarations enregistrées pour votre compte."
        filAriane={["Accueil", "Vue d’ensemble"]}
        actions={
          <Link className="bouton-sre bouton-sre--primaire" to="/client/paiements/nouveau">
            <CircleDollarSign size={16} /> Déclarer une opération
          </Link>
        }
      />

      

      <section className="grille-statistiques-sre">
        <StatCard
          titre="Obligations à suivre"
          valeur={obligationsOuvertes.length}
          note={formatMoney(montantOuvert)}
          icone={FileText}
          couleur="bleu"
        />
        <StatCard
          titre="Déclarations en cours"
          valeur={declarationsEnAttente}
          note="En attente d’une décision administrative"
          icone={Clock3}
          couleur="orange"
        />
        <StatCard
          titre="Décisions confirmées en interne"
          valeur={decisionsConfirmees.length}
          note={formatMoney(totalDecisionsConfirmees)}
          icone={BadgeCheck}
          couleur="vert"
        />
        <StatCard
          titre="Déclarations rejetées"
          valeur={declarationsRejetees}
          note="Consultez le motif de décision"
          icone={Bell}
          couleur="violet"
        />
      </section>

      <div className="grille-contenu-sre">
        <section className="carte-sre graphique-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Décisions administratives</h2>
              <p>Montants associés aux décisions explicites · MGA</p>
            </div>
            <WalletCards size={19} />
          </div>
          {decisionsConfirmees.length ? (
            <div className="graphique-sre__contenu">
              <div className="graphique-sre__valeur">{formatMoney(totalDecisionsConfirmees)}</div>
              <div className="barres-mois-sre">
                {moisGraphique.map((mois) => (
                  <div key={mois.nom}>
                    <span
                      title={formatMoney(mois.total)}
                      style={{ height: `${Math.max(6, (mois.total / maximumGraphique) * 100)}%` }}
                    />
                    <small>{mois.nom}</small>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              titre="Aucune décision enregistrée"
              description="Les éléments apparaîtront après une décision explicite de l’administration."
            />
          )}
        </section>

        <section className="carte-sre actions-rapides-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Accès rapides</h2>
              <p>Gérez vos démarches</p>
            </div>
          </div>
          <Link to="/client/obligations" className="raccourci-sre">
            <span>
              <FileText size={17} />
            </span>
            <div>
              <strong>Consulter mes impôts</strong>
              <small>Obligations et échéances enregistrées</small>
            </div>
            <ArrowRight size={15} />
          </Link>
          <Link to="/client/paiements/nouveau" className="raccourci-sre">
            <span>
              <CircleDollarSign size={17} />
            </span>
            <div>
              <strong>Déclarer une opération</strong>
              <small>Référence soumise hors du portail</small>
            </div>
            <ArrowRight size={15} />
          </Link>
          <Link to="/client/profil" className="raccourci-sre">
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

      <section className="carte-sre">
        <div className="carte-sre__entete">
          <div>
            <h2>Dernières déclarations</h2>
            <p>Historique des éléments liés à votre compte</p>
          </div>
          <Link className="lien-discret-sre" to="/client/paiements">
            Tout l’historique <ArrowRight size={14} />
          </Link>
        </div>
        {paiements.length ? (
          <div className="tableau-defilement-sre">
            <table className="tableau-sre">
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
                {paiements.slice(0, 5).map((paiement) => (
                  <tr key={paiement.id}>
                    <td data-label="Référence interne">
                      <Link className="reference-sre" to={`/client/paiements/${paiement.id}`}>
                        {paiement.referenceInterne}
                      </Link>
                    </td>
                    <td data-label="Impôt / catégorie">{paiement.typeImpotNom}</td>
                    <td data-label="Période">{paiement.periode}</td>
                    <td data-label="Montant déclaré" className="montant-sre">{formatMoney(paiement.montant)}</td>
                    <td data-label="Mode déclaré">
                      <StatusBadge statut={paiement.mode} />
                    </td>
                    <td data-label="Soumis le">{formatDate(paiement.soumisLe)}</td>
                    <td data-label="Statut">
                      <StatusBadge statut={paiement.statut} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            titre="Aucune déclaration"
            description="Lorsqu’une déclaration sera soumise, son suivi apparaîtra ici. La soumission ne confirme pas le règlement."
            action={
              <Link
                className="bouton-sre bouton-sre--primaire bouton-sre--petit"
                to="/client/paiements/nouveau"
              >
                Déclarer une opération
              </Link>
            }
          />
        )}
      </section>

      <section className="bandeau-conseil-sre">
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
        <section className="carte-sre notifications-recentes-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Notifications récentes</h2>
              <p>Messages adressés à votre compte uniquement</p>
            </div>
            <Link className="lien-discret-sre" to="/client/notifications">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          {notifications.map((notification) => (
            <div className="notification-mini-sre" key={notification.id}>
              <i className={notification.lue ? "" : "notification-mini-sre__point"} />
              <div>
                <strong>{notification.titre}</strong>
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
