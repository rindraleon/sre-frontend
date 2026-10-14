import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, CircleDollarSign, FileText } from "lucide-react";
import { utiliserAuthentificationSre } from "@/contexte/contexte-authentification-sre";
import { utiliserSre } from "@/contexte/contexte-sre";
import {
  BadgeSre,
  EntetePageSre,
  EtatVideSre,
  TableauSre,
  type ColonneTableauSre,
} from "@/composants/ui/composants-sre";
import type { ObligationFiscaleSre } from "@/types/sre";
import { formaterArgent, formaterDate } from "@/utilitaires/formatage";

export function ObligationsContribuableSre() {
  const { session } = utiliserAuthentificationSre();
  const { etat } = utiliserSre();
  const [recherche, definirRecherche] = useState("");
  const [statut, definirStatut] = useState("TOUS");
  const [page, definirPage] = useState(1);
  const [parPage, definirParPage] = useState(10);
  const obligationsPersonnelles = useMemo(
    () =>
      etat.obligations.filter(
        (obligation) => obligation.contribuableId === session?.contribuableId,
      ),
    [etat.obligations, session?.contribuableId],
  );

  const colonnes: ColonneTableauSre<ObligationFiscaleSre>[] = [
    {
      id: "reference",
      titre: "Référence",
      afficher: (obligation) => (
        <Link className="reference-sre" to={`/client/obligations/${obligation.id}`}>
          {obligation.referenceFiscale}
        </Link>
      ),
      valeurTri: (obligation) => obligation.referenceFiscale,
    },
    {
      id: "impot",
      titre: "Impôt / catégorie",
      afficher: (obligation) => <strong>{obligation.typeImpotNom}</strong>,
      valeurTri: (obligation) => obligation.typeImpotNom,
    },
    {
      id: "periode",
      titre: "Période",
      afficher: (obligation) => obligation.periode,
      valeurTri: (obligation) => obligation.periode,
    },
    {
      id: "echeance",
      titre: "Échéance enregistrée",
      afficher: (obligation) => formaterDate(obligation.echeance),
      valeurTri: (obligation) => obligation.echeance,
    },
    {
      id: "montant",
      titre: "Montant enregistré",
      afficher: (obligation) => (
        <span className="montant-sre">{formaterArgent(obligation.montant)}</span>
      ),
      valeurTri: (obligation) => obligation.montant,
    },
    {
      id: "statut",
      titre: "Statut",
      afficher: (obligation) => <BadgeSre statut={obligation.statut} />,
      valeurTri: (obligation) => obligation.statut,
    },
    {
      id: "action",
      titre: "Action",
      afficher: (obligation) => (
        <Link className="lien-action-sre" to={`/client/obligations/${obligation.id}`}>
          Détails <ArrowRight size={13} />
        </Link>
      ),
    },
  ];

  const montantOuvert = obligationsPersonnelles
    .filter((obligation) => obligation.statut !== "PAYE")
    .reduce((somme, obligation) => somme + obligation.montant, 0);

  return (
    <div className="page-contenu-sre">
      <EntetePageSre
        titre="Mes obligations fiscales"
        description="Consultez les données enregistrées pour votre compte."
        filAriane={["Mon espace", "Mes impôts"]}
      />
      <div className="bandeau-info-sre">
        <span>
          <FileText size={17} />
        </span>
        <div>
          <strong>
            {obligationsPersonnelles.length} obligation
            {obligationsPersonnelles.length === 1 ? "" : "s"} · {formaterArgent(montantOuvert)} à
            suivre
          </strong>
          <p>
            Les montants et échéances présentés sont ceux enregistrés dans le portail. Aucun barème
            fiscal n’est calculé automatiquement.
          </p>
        </div>
      </div>
      <TableauSre
        lignes={obligationsPersonnelles.filter(
          (obligation) => statut === "TOUS" || obligation.statut === statut,
        )}
        colonnes={colonnes}
        obtenirId={(obligation) => obligation.id}
        recherche={recherche}
        rechercher={definirRecherche}
        placeholder="Référence, impôt ou période…"
        actionsEntete={
          <label className="filtre-compact-sre">
            Statut
            <select
              value={statut}
              onChange={(event) => {
                definirStatut(event.target.value);
                definirPage(1);
              }}
            >
              <option value="TOUS">Tous</option>
              <option value="A_PAYER">À payer</option>
              <option value="EN_RETARD">En retard</option>
              <option value="PAIEMENT_EN_COURS">Paiement en cours</option>
              <option value="EN_VERIFICATION">En vérification</option>
              <option value="REJETE">Rejeté</option>
              <option value="PAYE">Décision confirmée en interne</option>
            </select>
          </label>
        }
        espaceVide="Aucune obligation"
        messageVide="Aucune obligation ne correspond à votre recherche."
        page={page}
        parPage={parPage}
        changerPage={definirPage}
        changerParPage={definirParPage}
      />
      <section className="note-fiscale-sre">
        <span>i</span>
        <p>
          <strong>À noter :</strong> une déclaration de paiement créée dans le portail reste « En
          vérification » jusqu’à une décision explicite. L’application ne traite aucun mouvement de
          fonds.
        </p>
      </section>
    </div>
  );
}

export function DetailObligationContribuableSre() {
  const { id } = useParams();
  const { session } = utiliserAuthentificationSre();
  const { etat } = utiliserSre();
  const obligation = etat.obligations.find(
    (entree) => entree.id === id && entree.contribuableId === session?.contribuableId,
  );

  if (!obligation) {
    return (
      <div className="page-contenu-sre">
        <EntetePageSre titre="Obligation introuvable" filAriane={["Mon espace", "Mes impôts"]} />
        <EtatVideSre
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
      <EntetePageSre
        titre={obligation.typeImpotNom}
        description={`Référence ${obligation.referenceFiscale}`}
        filAriane={["Mon espace", "Mes impôts", obligation.referenceFiscale]}
        actions={
          <Link className="bouton-sre bouton-sre--contour" to="/client/obligations">
            <ArrowLeft size={15} /> Retour
          </Link>
        }
      />
      <section className="grille-detail-obligation-sre">
        <article className="carte-sre carte-montant-obligation-sre">
          <span className="sur-titre-sre">MONTANT ENREGISTRÉ · MGA</span>
          <strong>{formaterArgent(obligation.montant)}</strong>
          <BadgeSre statut={obligation.statut} />
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
                <CalendarDays size={14} /> {formaterDate(obligation.echeance)}
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
