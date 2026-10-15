import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, ShieldCheck } from "lucide-react";
import type { Payment } from "@/types/models";
import { useSre } from "@/context/SreContext";
import { StatusBadge, PageHeader, DataTable, type TableColumn } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";

export function AdminPaymentsPage({ verificationSeule = false }: { verificationSeule?: boolean }) {
  const { etat } = useSre();
  const [recherche, definirRecherche] = useState("");
  const [statut, definirStatut] = useState(verificationSeule ? "EN_VERIFICATION" : "TOUS");
  const [page, definirPage] = useState(1);
  const [parPage, definirParPage] = useState(10);
  const paiements = useMemo(
    () =>
      etat.paiements
        .filter(
          (paiement) =>
            (statut === "TOUS" || paiement.statut === statut) &&
            (!verificationSeule || paiement.statut === "EN_VERIFICATION") &&
            `${paiement.referenceInterne} ${paiement.referenceTransaction} ${paiement.typeImpotNom} ${etat.contribuables.find((c) => c.id === paiement.contribuableId)?.raisonSociale ?? ""} ${etat.contribuables.find((c) => c.id === paiement.contribuableId)?.nif ?? ""}`
              .toLowerCase()
              .includes(recherche.toLowerCase()),
        )
        .sort((a, b) => b.soumisLe.localeCompare(a.soumisLe)),
    [etat.paiements, etat.contribuables, statut, recherche, verificationSeule],
  );
  const colonnes: TableColumn<Payment>[] = [
    {
      id: "ref",
      titre: "Référence",
      afficher: (paiement) => (
        <Link className="reference-sre" to={`/admin/paiements/${paiement.id}`}>
          {paiement.referenceInterne}
        </Link>
      ),
      valeurTri: (paiement) => paiement.referenceInterne,
    },
    {
      id: "contribuable",
      titre: "Contribuable",
      afficher: (paiement) => {
        const c = etat.contribuables.find((entree) => entree.id === paiement.contribuableId);
        return (
          <div>
            <strong>
              {c?.raisonSociale ||
                `${c?.prenom ?? ""} ${c?.nom ?? ""}`.trim() ||
                "Profil indisponible"}
            </strong>
            <small className="sous-ligne-sre">{c?.nif || c?.courriel || "—"}</small>
          </div>
        );
      },
      valeurTri: (paiement) =>
        etat.contribuables.find((e) => e.id === paiement.contribuableId)?.raisonSociale ?? "",
    },
    {
      id: "impot",
      titre: "Impôt / période",
      afficher: (paiement) => (
        <>
          {paiement.typeImpotNom}
          <small className="sous-ligne-sre">{paiement.periode}</small>
        </>
      ),
      valeurTri: (paiement) => paiement.typeImpotNom,
    },
    {
      id: "montant",
      titre: "Montant déclaré",
      afficher: (paiement) => <strong>{formatMoney(paiement.montant)}</strong>,
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
      titre: "Soumis le",
      afficher: (paiement) => formatDate(paiement.soumisLe, true),
      valeurTri: (paiement) => paiement.soumisLe,
    },
    {
      id: "statut",
      titre: "Statut",
      afficher: (paiement) => <StatusBadge statut={paiement.statut} />,
      valeurTri: (paiement) => paiement.statut,
    },
    {
      id: "action",
      titre: "",
      afficher: (paiement) => (
        <Link className="lien-action-sre" to={`/admin/paiements/${paiement.id}`}>
          {paiement.statut === "EN_VERIFICATION" ? "Examiner" : "Détails"} <ArrowRight size={13} />
        </Link>
      ),
    },
  ];
  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre={verificationSeule ? "Vérification des paiements" : "Historique des paiements"}
        description={
          verificationSeule
            ? "Examinez chaque déclaration avant d’enregistrer une décision."
            : "Historique partagé des déclarations et décisions."
        }
        filAriane={[
          "Back-office",
          verificationSeule ? "Vérification des paiements" : "Historique des paiements",
        ]}
        actions={
          verificationSeule && (
            <span className="badge-attente-gros-sre">
              <Clock3 size={14} />{" "}
              {etat.paiements.filter((paiement) => paiement.statut === "EN_VERIFICATION").length} à
              vérifier
            </span>
          )
        }
      />
      <div className="bandeau-alerte-securite-sre">
        <ShieldCheck size={18} />
        <div>
          <strong>Une référence déclarée ne confirme pas un paiement.</strong>
          <p>
            Le portail ne communique avec aucun établissement financier. Les décisions doivent
            reposer sur les contrôles administratifs applicables.
          </p>
        </div>
      </div>
      <DataTable
        lignes={paiements}
        colonnes={colonnes}
        obtenirId={(paiement) => paiement.id}
        recherche={recherche}
        rechercher={definirRecherche}
        placeholder="Référence, contribuable ou NIF…"
        actionsEntete={
          !verificationSeule ? (
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
                <option value="EN_VERIFICATION">En vérification</option>
                <option value="CONFIRME">Confirmé par l’administration</option>
                <option value="REJETE">Rejeté</option>
                <option value="CORRECTION_DEMANDEE">Correction demandée</option>
              </select>
            </label>
          ) : undefined
        }
        espaceVide={verificationSeule ? "Aucune déclaration en attente" : "Aucune déclaration"}
        messageVide={
          verificationSeule
            ? "La file de vérification est vide."
            : "Les déclarations enregistrées apparaîtront ici."
        }
        page={page}
        parPage={parPage}
        changerPage={definirPage}
        changerParPage={definirParPage}
      />
    </div>
  );
}
