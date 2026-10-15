import { Select } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CircleDollarSign } from "lucide-react";
import type { Payment } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { StatusBadge, PageHeader, DataTable, type TableColumn } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

export function ClientPaymentsPage() {
  const { session } = useAuth();
  const { etat } = useSre();
  const [recherche, definirRecherche] = useState("");
  const [statut, definirStatut] = useState("TOUS");
  const [page, definirPage] = useState(1);
  const [parPage, definirParPage] = useState(10);
  const paiements = useMemo(
    () =>
      etat.paiements
        .filter((paiement) => paiement.contribuableId === session?.contribuableId)
        .filter(
          (paiement) =>
            (statut === "TOUS" || paiement.statut === statut) &&
            `${paiement.referenceInterne} ${paiement.referenceTransaction} ${paiement.typeImpotNom} ${paiement.periode}`
              .toLowerCase()
              .includes(recherche.toLowerCase()),
        )
        .sort((a, b) => b.soumisLe.localeCompare(a.soumisLe)),
    [etat.paiements, session?.contribuableId, statut, recherche],
  );
  const colonnes: TableColumn<Payment>[] = [
    {
      id: "ref",
      titre: "Référence",
      afficher: (paiement) => (
        <Link className="reference-sre" to={`/client/paiements/${paiement.id}`}>
          {paiement.referenceInterne}
        </Link>
      ),
      valeurTri: (paiement) => paiement.referenceInterne,
    },
    {
      id: "impot",
      titre: "Impôt / période",
      afficher: (paiement) => (
        <>
          <strong>{paiement.typeImpotNom}</strong>
          <small className="sous-ligne-sre">{paiement.periode}</small>
        </>
      ),
      valeurTri: (paiement) => paiement.typeImpotNom,
    },
    {
      id: "montant",
      titre: "Montant déclaré",
      afficher: (paiement) => <span className="montant-sre">{formatMoney(paiement.montant)}</span>,
      valeurTri: (paiement) => paiement.montant,
    },
    {
      id: "mode",
      titre: "Mode déclaré",
      afficher: (paiement) => <StatusBadge statut={paiement.mode} />,
      valeurTri: (paiement) => paiement.mode,
    },
    {
      id: "soumis",
      titre: "Date de déclaration",
      afficher: (paiement) => formatDate(paiement.soumisLe),
      valeurTri: (paiement) => paiement.soumisLe,
    },
    {
      id: "statut",
      titre: "Statut",
      afficher: (paiement) => <StatusBadge statut={paiement.statut} />,
      valeurTri: (paiement) => paiement.statut,
    },
    {
      id: "actions",
      titre: "",
      afficher: (paiement) => (
        <Link className="lien-action-sre" to={`/client/paiements/${paiement.id}`}>
          Suivre <ArrowRight size={13} />
        </Link>
      ),
    },
  ];
  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Historique des paiements"
        description="Suivez les déclarations associées à votre compte."
        filAriane={["Mon espace", "Historique des paiements"]}
        actions={
          <Link className="bouton-sre bouton-sre--primaire" to="/client/paiements/nouveau">
            <CircleDollarSign size={16} /> Déclarer un paiement
          </Link>
        }
      />
      <DataTable
        lignes={paiements}
        colonnes={colonnes}
        obtenirId={(paiement) => paiement.id}
        recherche={recherche}
        rechercher={definirRecherche}
        placeholder="Référence, impôt, période…"
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
              <option value="TOUS">Tous les statuts</option>
              <option value="EN_VERIFICATION">En vérification</option>
              <option value="CONFIRME">Confirmé par l’administration</option>
              <option value="REJETE">Rejeté</option>
              <option value="CORRECTION_DEMANDEE">Correction demandée</option>
            </Select>
          </label>
        }
        espaceVide="Aucune déclaration"
        messageVide="Les déclarations enregistrées apparaîtront ici."
        page={page}
        parPage={parPage}
        changerPage={definirPage}
        changerParPage={definirParPage}
      />
    </div>
  );
}
