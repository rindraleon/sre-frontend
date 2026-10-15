import { Select } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { StatusBadge, PageHeader, DataTable, type TableColumn } from "@/components/ui";
import type { TaxObligation } from "@/types";
import { formatMoney, formatDate } from "@/utils/format";

export function ClientObligationsPage() {
  const { session } = useAuth();
  const { etat } = useSre();
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

  const colonnes: TableColumn<TaxObligation>[] = [
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
      afficher: (obligation) => formatDate(obligation.echeance),
      valeurTri: (obligation) => obligation.echeance,
    },
    {
      id: "montant",
      titre: "Montant enregistré",
      afficher: (obligation) => (
        <span className="montant-sre">{formatMoney(obligation.montant)}</span>
      ),
      valeurTri: (obligation) => obligation.montant,
    },
    {
      id: "statut",
      titre: "Statut",
      afficher: (obligation) => <StatusBadge statut={obligation.statut} />,
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
      <PageHeader
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
            {obligationsPersonnelles.length === 1 ? "" : "s"} · {formatMoney(montantOuvert)} à
            suivre
          </strong>
          <p>
            Les montants et échéances présentés sont ceux enregistrés dans le portail. Aucun barème
            fiscal n’est calculé automatiquement.
          </p>
        </div>
      </div>
      <DataTable
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
            <Select
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
            </Select>
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
