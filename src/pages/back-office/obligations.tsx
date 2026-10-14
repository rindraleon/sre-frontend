import { useMemo, useState, type FormEvent } from "react";
import { CalendarDays, CirclePlus, FileText } from "lucide-react";
import type { ObligationFiscaleSre } from "@/types/sre";
import { utiliserAuthentificationSre } from "@/contexte/contexte-authentification-sre";
import { utiliserSre } from "@/contexte/contexte-sre";
import { appelerApiSre, mapperObligation, type ObligationApiSre } from "@/services/api-sre";
import {
  BadgeSre,
  BoutonSre,
  EntetePageSre,
  ModalSre,
  TableauSre,
  type ColonneTableauSre,
} from "@/composants/ui/composants-sre";
import { formaterArgent, formaterDate } from "@/utilitaires/formatage";

export function ObligationsAdministrationSre() {
  const { etat, mettreAJourEtat, notifier } = utiliserSre();
  const { session } = utiliserAuthentificationSre();
  const [recherche, definirRecherche] = useState("");
  const [statut, definirStatut] = useState("TOUS");
  const [page, definirPage] = useState(1);
  const [parPage, definirParPage] = useState(10);
  const [modal, definirModal] = useState(false);
  const [contribuableId, definirContribuableId] = useState("");
  const [typeId, definirTypeId] = useState("");
  const [periode, definirPeriode] = useState("");
  const [montant, definirMontant] = useState("");
  const [echeance, definirEcheance] = useState("");
  const [erreur, definirErreur] = useState("");
  const [chargement, definirChargement] = useState(false);

  const obligations = useMemo(
    () =>
      etat.obligations
        .filter(
          (obligation) =>
            (statut === "TOUS" || obligation.statut === statut) &&
            `${obligation.referenceFiscale} ${obligation.typeImpotNom} ${obligation.periode} ${etat.contribuables.find((c) => c.id === obligation.contribuableId)?.raisonSociale ?? ""} ${etat.contribuables.find((c) => c.id === obligation.contribuableId)?.nif ?? ""}`
              .toLowerCase()
              .includes(recherche.toLowerCase()),
        )
        .sort((a, b) => b.creeLe.localeCompare(a.creeLe)),
    [etat.obligations, etat.contribuables, recherche, statut],
  );

  const colonnes: ColonneTableauSre<ObligationFiscaleSre>[] = [
    {
      id: "ref",
      titre: "Référence",
      afficher: (obligation) => <strong>{obligation.referenceFiscale}</strong>,
      valeurTri: (obligation) => obligation.referenceFiscale,
    },
    {
      id: "contribuable",
      titre: "Contribuable",
      afficher: (obligation) => {
        const c = etat.contribuables.find((entree) => entree.id === obligation.contribuableId);
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
      valeurTri: (obligation) =>
        etat.contribuables.find((e) => e.id === obligation.contribuableId)?.raisonSociale ?? "",
    },
    {
      id: "impot",
      titre: "Impôt / catégorie",
      afficher: (obligation) => obligation.typeImpotNom,
      valeurTri: (obligation) => obligation.typeImpotNom,
    },
    {
      id: "periode",
      titre: "Période",
      afficher: (obligation) => obligation.periode,
      valeurTri: (obligation) => obligation.periode,
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
      id: "echeance",
      titre: "Échéance",
      afficher: (obligation) => formaterDate(obligation.echeance),
      valeurTri: (obligation) => obligation.echeance,
    },
    {
      id: "statut",
      titre: "Statut",
      afficher: (obligation) => <BadgeSre statut={obligation.statut} />,
      valeurTri: (obligation) => obligation.statut,
    },
  ];

  const ouvrir = () => {
    definirContribuableId("");
    definirTypeId("");
    definirPeriode("");
    definirMontant("");
    definirEcheance("");
    definirErreur("");
    definirModal(true);
  };
  const creer = async (event: FormEvent) => {
    event.preventDefault();
    definirErreur("");
    const contribuable = etat.contribuables.find((entree) => entree.id === contribuableId);
    const type = etat.typesImpots.find((entree) => entree.id === typeId && entree.actif);
    const valeurMontant = Number(montant);
    if (!session?.jetonApi) {
      definirErreur("Session serveur introuvable. Reconnectez-vous.");
      return;
    }
    if (!contribuable || !type) {
      definirErreur("Sélectionnez un contribuable et un type d’impôt actif.");
      return;
    }
    if (!periode.trim() || !echeance) {
      definirErreur("Renseignez la période et la date d’échéance validées.");
      return;
    }
    if (!Number.isSafeInteger(valeurMontant) || valeurMontant <= 0) {
      definirErreur("Saisissez un montant valide conformément à la règle confirmée.");
      return;
    }
    definirChargement(true);
    try {
      const reponse = await appelerApiSre<ObligationApiSre>("obligations", {
        method: "POST",
        token: session.jetonApi,
        body: {
          contribuableId,
          typeImpotId: typeId,
          periode: periode.trim(),
          montant: valeurMontant,
          echeance,
        },
      });
      const obligation = mapperObligation(reponse);
      mettreAJourEtat((courant) => ({
        ...courant,
        obligations: [obligation, ...courant.obligations],
      }));
      notifier("Obligation enregistrée sur le serveur.", "succes");
      definirModal(false);
    } catch (cause) {
      definirErreur(
        cause instanceof Error ? cause.message : "Le serveur n’a pas créé l’obligation.",
      );
    } finally {
      definirChargement(false);
    }
  };

  return (
    <div className="page-contenu-sre">
      <EntetePageSre
        titre="Obligations fiscales"
        description="Consultez les obligations renvoyées par le serveur et créez un enregistrement validé."
        filAriane={["Back-office", "Obligations fiscales"]}
        actions={
          <BoutonSre onClick={ouvrir}>
            <CirclePlus size={15} /> Créer une obligation
          </BoutonSre>
        }
      />
      <div className="bandeau-info-sre">
        <span>
          <FileText size={17} />
        </span>
        <div>
          <strong>{etat.obligations.length} obligation(s) · MGA</strong>
          <p>
            Les montants et échéances sont saisis par l’administration; aucun barème ou calendrier
            n’est prérempli.
          </p>
        </div>
      </div>
      <TableauSre
        lignes={obligations}
        colonnes={colonnes}
        obtenirId={(obligation) => obligation.id}
        recherche={recherche}
        rechercher={definirRecherche}
        placeholder="Référence, nom, NIF ou impôt…"
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
              <option value="PAIEMENT_EN_COURS">Paiement en cours</option>
              <option value="EN_VERIFICATION">En vérification</option>
              <option value="PAYE">Payé</option>
              <option value="EN_RETARD">En retard</option>
              <option value="REJETE">Rejeté</option>
              <option value="CORRECTION_DEMANDEE">Correction demandée</option>
            </select>
          </label>
        }
        espaceVide="Aucune obligation"
        messageVide="Aucune obligation ne correspond à vos critères."
        page={page}
        parPage={parPage}
        changerPage={definirPage}
        changerParPage={definirParPage}
      />
      <ModalSre
        ouvert={modal}
        titre="Créer une obligation"
        description="Les valeurs seront persistées par le serveur et doivent correspondre aux règles validées."
        fermer={() => definirModal(false)}
        largeur="large"
        pied={
          <>
            <BoutonSre variante="contour" onClick={() => definirModal(false)} disabled={chargement}>
              Annuler
            </BoutonSre>
            <BoutonSre type="submit" form="formulaire-obligation-admin" disabled={chargement}>
              {chargement ? "Enregistrement…" : "Créer l’obligation"}
            </BoutonSre>
          </>
        }
      >
        <form
          id="formulaire-obligation-admin"
          className="formulaire-sre grille-formulaire-sre formulaire-compact-sre"
          onSubmit={creer}
        >
          <label className="champ-sre-large">
            Contribuable
            <select
              className="champ-simple-sre"
              value={contribuableId}
              onChange={(event) => definirContribuableId(event.target.value)}
              required
            >
              <option value="">Choisir un profil</option>
              {etat.contribuables.map((contribuable) => (
                <option key={contribuable.id} value={contribuable.id}>
                  {contribuable.raisonSociale ||
                    `${contribuable.prenom ?? ""} ${contribuable.nom}`.trim()}{" "}
                  · {contribuable.nif || contribuable.courriel}
                </option>
              ))}
            </select>
          </label>
          <label className="champ-sre-large">
            Type d’impôt
            <select
              className="champ-simple-sre"
              value={typeId}
              onChange={(event) => definirTypeId(event.target.value)}
              required
            >
              <option value="">Choisir un type actif</option>
              {etat.typesImpots
                .filter((type) => type.actif)
                .map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.nom} · {type.categorie}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Période
            <input
              className="champ-simple-sre"
              value={periode}
              onChange={(event) => definirPeriode(event.target.value)}
              required
            />
          </label>
          <label>
            Montant validé (MGA)
            <input
              className="champ-simple-sre"
              type="number"
              min="1"
              step="1"
              value={montant}
              onChange={(event) => definirMontant(event.target.value)}
              required
            />
          </label>
          <label className="champ-sre-large">
            Échéance
            <input
              className="champ-simple-sre"
              type="date"
              value={echeance}
              onChange={(event) => definirEcheance(event.target.value)}
              required
            />
          </label>
          {erreur && (
            <p className="message-erreur-sre champ-sre-large" role="alert">
              {erreur}
            </p>
          )}
          <div className="note-fiscale-sre champ-sre-large">
            <span>
              <CalendarDays size={15} />
            </span>
            <p>
              Seules les données saisies ici sont enregistrées. L’échéance et le montant ne sont pas
              calculés automatiquement par le portail.
            </p>
          </div>
        </form>
      </ModalSre>
    </div>
  );
}
