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
  const { etat } = useSre();
  const { session } = useAuth();
  const [activite, setActivite] = useState<ActivityLogEntry[]>([]);
  const contribuablesActifs = etat.contribuables.filter(
    (contribuable) => contribuable.statut === "ACTIF",
  );
  const personnes = contribuablesActifs.filter(
    (contribuable) => contribuable.type === "PARTICULIER",
  ).length;
  const entreprises = contribuablesActifs.filter(
    (contribuable) => contribuable.type === "ENTREPRISE",
  ).length;
  const paiementsEnAttente = etat.paiements.filter(
    (paiement) => paiement.statut === "EN_VERIFICATION",
  );
  const paiementsConfirmesEnInterne = etat.paiements.filter(
    (paiement) => paiement.statut === "CONFIRME",
  );
  const totalConfirmeEnInterne = paiementsConfirmesEnInterne.reduce(
    (somme, paiement) => somme + paiement.montant,
    0,
  );

  const sixMois = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - index));
        const total = paiementsConfirmesEnInterne
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
    [paiementsConfirmesEnInterne],
  );
  const maximumMois = Math.max(...sixMois.map((mois) => mois.total), 1);
  const paiementsRecents = [...etat.paiements]
    .sort((a, b) => b.soumisLe.localeCompare(a.soumisLe))
    .slice(0, 5);

  useEffect(() => {
    if (!session?.jetonApi) return;
    let ignore = false;
    loadActivityLogApi(session.jetonApi, 8)
      .then((entrees) => {
        if (!ignore) setActivite(entrees);
      })
      .catch(() => {
        // Le journal peut être indisponible : le tableau de bord reste consultable.
      });
    return () => {
      ignore = true;
    };
  }, [session?.jetonApi]);

  const derniereActivite = activite.slice(0, 4);

  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Tableau de bord"
        description="Suivi des données enregistrées pour le périmètre Haute Matsiatra."
        filAriane={["Accueil", "Tableau de bord"]}
        actions={
          <Link className="bouton-sre bouton-sre--primaire" to={ROUTES_ADMIN.importExcel}>
            <FileSpreadsheet size={15} /> Importer un fichier
          </Link>
        }
      />

      <section className="grille-statistiques-sre">
        <StatCard
          titre="Contribuables actifs"
          valeur={contribuablesActifs.length}
          note={`${personnes} particuliers · ${entreprises} entreprises`}
          icone={Users}
          couleur="bleu"
        />
        <StatCard
          titre="Déclarations à examiner"
          valeur={paiementsEnAttente.length}
          note="En attente d’une décision administrative"
          icone={Clock3}
          couleur="orange"
        />
        <StatCard
          titre="Décisions confirmées en interne"
          valeur={formatMoney(totalConfirmeEnInterne)}
          note="Sans vérification bancaire indépendante"
          icone={BadgeCheck}
          couleur="vert"
        />
        <StatCard
          titre="Comptes utilisateurs"
          valeur={etat.utilisateurs.length}
          note={`${etat.utilisateurs.filter((compte) => compte.role === "ADMIN").length} administrateur(s)`}
          icone={UserRound}
          couleur="violet"
        />
      </section>

      {paiementsEnAttente.length > 0 && (
        <Link className="alerte-action-sre" to={ROUTES_ADMIN.paiementsAVerifier}>
          <span>
            <Clock3 size={18} />
          </span>
          <div>
            <strong>
              {paiementsEnAttente.length} déclaration{paiementsEnAttente.length === 1 ? "" : "s"} en
              attente d’examen
            </strong>
            <small>
              Consultez les éléments déclarés et enregistrez une décision administrative.
            </small>
          </div>
          <ArrowRight size={17} />
        </Link>
      )}

      <div className="grille-contenu-sre">
        <section className="carte-sre graphique-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Montants des décisions internes</h2>
              <p>Six derniers mois · aucun contrôle bancaire n’est effectué par le portail</p>
            </div>
            <CircleDollarSign size={18} />
          </div>
          {paiementsConfirmesEnInterne.length ? (
            <div className="graphique-sre__contenu">
              <div className="graphique-sre__valeur">{formatMoney(totalConfirmeEnInterne)}</div>
              <div className="barres-mois-sre">
                {sixMois.map((mois) => (
                  <div key={mois.nom}>
                    <span
                      title={formatMoney(mois.total)}
                      style={{ height: `${Math.max(6, (mois.total / maximumMois) * 100)}%` }}
                    />
                    <small>{mois.nom}</small>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              titre="Aucune décision confirmée"
              description="Les données apparaîtront après l’enregistrement d’une décision explicite par l’administration."
            />
          )}
        </section>

        <section className="carte-sre actions-rapides-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Actions rapides</h2>
              <p>Outils de gestion</p>
            </div>
          </div>
          <Link to={ROUTES_ADMIN.paiementsAVerifier} className="raccourci-sre">
            <span>
              <WalletCards size={17} />
            </span>
            <div>
              <strong>Examiner les déclarations</strong>
              <small>{paiementsEnAttente.length} en attente</small>
            </div>
            <ArrowRight size={15} />
          </Link>
          <Link to={ROUTES_ADMIN.contribuables} className="raccourci-sre">
            <span>
              <Building2 size={17} />
            </span>
            <div>
              <strong>Gérer les contribuables</strong>
              <small>{contribuablesActifs.length} profils actifs</small>
            </div>
            <ArrowRight size={15} />
          </Link>
          <Link to={ROUTES_ADMIN.importExcel} className="raccourci-sre">
            <span>
              <FileSpreadsheet size={17} />
            </span>
            <div>
              <strong>Importer un fichier Excel</strong>
              <small>Analyser et valider avant import</small>
            </div>
            <ArrowRight size={15} />
          </Link>
          <Link to={ROUTES_ADMIN.journal} className="raccourci-sre">
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

      <div className="grille-contenu-sre">
        <section className="carte-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Déclarations récentes</h2>
              <p>Chaque déclaration nécessite un examen explicite.</p>
            </div>
            <Link className="lien-discret-sre" to={ROUTES_ADMIN.paiements}>
              Tout afficher <ArrowRight size={14} />
            </Link>
          </div>
          {paiementsRecents.length ? (
            <div className="tableau-defilement-sre">
              <table className="tableau-sre">
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
                  {paiementsRecents.map((paiement) => {
                    const contribuable = etat.contribuables.find(
                      (entree) => entree.id === paiement.contribuableId,
                    );
                    const nom =
                      contribuable?.raisonSociale ||
                      `${contribuable?.prenom ?? ""} ${contribuable?.nom ?? ""}`.trim() ||
                      "Profil indisponible";
                    return (
                      <tr key={paiement.id}>
                        <td data-label="Référence"><strong>{paiement.referenceInterne}</strong></td>
                        <td data-label="Contribuable">{nom}</td>
                        <td data-label="Impôt">{paiement.typeImpotNom}</td>
                        <td data-label="Montant déclaré">{formatMoney(paiement.montant)}</td>
                        <td data-label="Soumis le">{formatDate(paiement.soumisLe)}</td>
                        <td data-label="Statut">
                          <StatusBadge statut={paiement.statut} />
                        </td>
                        <td data-label="Action">
                          <Link className="lien-action-sre" to={ROUTES_ADMIN.paiement(paiement.id)}>
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
              titre="Aucune déclaration"
              description="Les déclarations soumises par les comptes contribuables apparaîtront ici."
            />
          )}
        </section>

        <section className="carte-sre activite-recente-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Activité récente</h2>
              <p>Événements transmis par le serveur</p>
            </div>
            <Link className="lien-discret-sre" to={ROUTES_ADMIN.journal}>
              Journal <ArrowRight size={14} />
            </Link>
          </div>
          {derniereActivite.length ? (
            derniereActivite.map((ligne) => (
              <div className="activite-mini-sre" key={ligne.id}>
                <span>
                  {ligne.role === "ADMIN" ? <BadgeCheck size={15} /> : <UserRound size={15} />}
                </span>
                <div>
                  <strong>{ligne.action}</strong>
                  <small>
                    {ligne.acteur} · {formatDate(ligne.date, true)}
                  </small>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              titre="Aucun événement disponible"
              description="Les actions réalisées par les comptes apparaîtront ici dès leur exécution."
            />
          )}
        </section>
      </div>
    </div>
  );
}
