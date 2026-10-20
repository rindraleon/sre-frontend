import { useCallback, useEffect, useMemo, useState } from "react";
import { BellRing, History, Send, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import {
  Button,
  DataTable,
  Modal,
  PageHeader,
  Select,
  StatusBadge,
  convertirColonnesTanstack,
  type TableColumn,
} from "@/components/ui";
import { OptionsSelect } from "@/components/forms/options-select";
import { FormField, FormError } from "@/components/forms/form-field";
import {
  creerColonnesRetards,
  LIBELLES_SITUATION,
} from "@/components/tables/admin/retards-columns";
import { useTableState } from "@/hooks";
import { callApi } from "@/services/api-client";
import type { BilanCampagne, EntreeHistoriqueEnvois, LigneRetard } from "@/types";
import { formatDate, formatMoney } from "@/utils/format";

const MODELE_DEFAUT =
  "Bonjour {nom},\n\nLe dossier {reference} ({typeImpot}, période {periode}) présente un retard de {joursRetard} jour(s) au {echeance}, pour un montant de {montant}.\nMerci de régulariser votre situation en suivant les démarches indiquées dans votre espace.\n\nService Régional des Impôts — Haute Matsiatra";

const OPTIONS_SITUATION = [
  { valeur: "TOUS", libelle: "Toutes les situations" },
  ...Object.entries(LIBELLES_SITUATION).map(([valeur, libelle]) => ({ valeur, libelle })),
];

const OPTIONS_TYPE_ENTITE = [
  { valeur: "TOUS", libelle: "Toutes les entités" },
  { valeur: "PARTICULIER", libelle: "Particuliers" },
  { valeur: "ENTREPRISE", libelle: "Entreprises" },
];

const colonnesHistorique: TableColumn<EntreeHistoriqueEnvois>[] = [
  {
    id: "date",
    titre: "Date",
    afficher: (entree) => formatDate(entree.dateEnvoi),
    valeurTri: (entree) => entree.dateEnvoi,
  },
  {
    id: "destinataire",
    titre: "Destinataire",
    afficher: (entree) => (
      <div>
        <strong>{entree.destinataire.nom}</strong>
        <small className="sous-ligne-sre">{entree.destinataire.courriel}</small>
      </div>
    ),
    valeurTri: (entree) => entree.destinataire.nom,
  },
  {
    id: "dossier",
    titre: "Dossier",
    afficher: (entree) => entree.dossier.reference,
    valeurTri: (entree) => entree.dossier.reference,
  },
  {
    id: "auteur",
    titre: "Initiée par",
    afficher: (entree) => entree.initiePar,
    valeurTri: (entree) => entree.initiePar,
  },
  {
    id: "statut",
    titre: "Statut d’envoi",
    afficher: (entree) => <StatusBadge statut={entree.statutCourriel} />,
    valeurTri: (entree) => entree.statutCourriel,
  },
  {
    id: "erreur",
    titre: "Détail",
    afficher: (entree) => entree.derniereErreurCourriel ?? "—",
  },
];

export function AdminRetardsPage() {
  const { session } = useAuth();
  const { notifier } = useSre();
  const table = useTableState();
  const [lignes, setLignes] = useState<LigneRetard[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreurChargement, setErreurChargement] = useState<string | null>(null);
  const [situation, setSituation] = useState("TOUS");
  const [typeEntite, setTypeEntite] = useState("TOUS");
  const [inclureRegularises, setInclureRegularises] = useState(false);
  const [selectionnes, setSelectionnes] = useState<ReadonlySet<string>>(new Set());
  const [modalEnvoi, setModalEnvoi] = useState(false);
  const [titreNotification, setTitreNotification] = useState(
    "Notification de retard — dossier fiscal",
  );
  const [modeleMessage, setModeleMessage] = useState(MODELE_DEFAUT);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [bilan, setBilan] = useState<BilanCampagne | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEnvois[]>([]);

  const chargerRetards = useCallback(async () => {
    if (!session?.jetonApi) return;
    setChargement(true);
    setErreurChargement(null);
    try {
      const parametres = new URLSearchParams();
      if (inclureRegularises) parametres.set("inclureRegularises", "true");
      const query = parametres.toString();
      const reponse = await callApi<LigneRetard[]>(
        "admin/retards" + (query ? `?${query}` : ""),
        { token: session.jetonApi },
      );
      setLignes(reponse);
    } catch (cause) {
      setErreurChargement(
        cause instanceof Error ? cause.message : "Impossible de charger les dossiers en retard.",
      );
    } finally {
      setChargement(false);
    }
  }, [session?.jetonApi, inclureRegularises]);

  const chargerHistorique = useCallback(async () => {
    if (!session?.jetonApi) return;
    try {
      setHistorique(
        await callApi<EntreeHistoriqueEnvois[]>("admin/notifications/historique-envois", {
          token: session.jetonApi,
        }),
      );
    } catch {
      // L'historique reste consultable même si son chargement échoue.
    }
  }, [session?.jetonApi]);

  useEffect(() => {
    void chargerRetards();
  }, [chargerRetards]);

  useEffect(() => {
    void chargerHistorique();
  }, [chargerHistorique]);

  const lignesFiltrees = useMemo(
    () =>
      lignes.filter((ligne) => {
        if (situation !== "TOUS" && ligne.situation !== situation) return false;
        if (typeEntite !== "TOUS" && ligne.entite.type !== typeEntite) return false;
        return true;
      }),
    [lignes, situation, typeEntite],
  );

  const selectionValides = useMemo(
    () =>
      lignesFiltrees
        .filter((ligne) => selectionnes.has(ligne.obligationId))
        .filter((ligne) => ligne.situation !== "REGULARISE"),
    [lignesFiltrees, selectionnes],
  );

  const envoyerCampagne = async () => {
    if (!session?.jetonApi || selectionValides.length === 0) return;
    setEnvoiEnCours(true);
    setErreurEnvoi(null);
    try {
      const resultat = await callApi<BilanCampagne>("admin/notifications/groupes", {
        method: "POST",
        token: session.jetonApi,
        body: {
          obligationIds: selectionValides.map((ligne) => ligne.obligationId),
          titre: titreNotification.trim() || undefined,
          message: modeleMessage,
        },
      });
      setBilan(resultat);
      setModalEnvoi(false);
      setSelectionnes(new Set());
      const message = `Campagne terminée : ${resultat.notificationsCreees} notification(s) créée(s), ${resultat.dejaEnvoyees} déjà envoyée(s), ${resultat.echecs} échec(s), ${resultat.ignorees} ignorée(s).`;
      notifier(message, resultat.echecs > 0 ? "avertissement" : "succes");
      await chargerHistorique();
    } catch (cause) {
      setErreurEnvoi(
        cause instanceof Error ? cause.message : "L’envoi groupé a échoué. Réessayez.",
      );
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const colonnes = creerColonnesRetards();

  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Retards & notifications"
        description="Dossiers en retard et notifications groupées aux entités concernées."
        filAriane={["Accueil", "Retards & notifications"]}
      />
      {erreurChargement && (
        <p className="message-erreur-sre" role="alert">
          {erreurChargement}
        </p>
      )}
      <DataTable
        data={lignesFiltrees}
        columns={convertirColonnesTanstack(colonnes)}
        label="Dossiers en retard"
        getRowId={(ligne) => ligne.obligationId}
        searchPlaceholder="Entité, STAT ou référence…"
        searchValue={table.recherche}
        onSearchChange={table.rechercher}
        selectable
        selectedRowIds={selectionnes}
        onSelectedRowIdsChange={(ids) => setSelectionnes(new Set(ids))}
        toolbarActions={
          <>
            <label className="filtre-compact-sre">
              Situation
              <Select
                value={situation}
                onChange={(event) => {
                  setSituation(event.target.value);
                  table.reinitialiserPage();
                }}
              >
                <OptionsSelect options={OPTIONS_SITUATION} />
              </Select>
            </label>
            <label className="filtre-compact-sre">
              Entité
              <Select
                value={typeEntite}
                onChange={(event) => {
                  setTypeEntite(event.target.value);
                  table.reinitialiserPage();
                }}
              >
                <OptionsSelect options={OPTIONS_TYPE_ENTITE} />
              </Select>
            </label>
            <label className="filtre-compact-sre inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={inclureRegularises}
                onChange={(event) => setInclureRegularises(event.target.checked)}
              />
              Inclure les régularisés
            </label>
          </>
        }
        actionPrimary={
          <Button
            onClick={() => {
              setErreurEnvoi(null);
              setModalEnvoi(true);
            }}
            disabled={selectionValides.length === 0 || envoiEnCours}
          >
            <Send size={15} /> Envoyer une notification
            {selectionValides.length > 0 && ` (${selectionValides.length})`}
          </Button>
        }
        columnToggle
        emptyTitle={chargement ? "Chargement…" : "Aucun dossier en retard"}
        emptyDescription={
          chargement
            ? "Récupération des dossiers depuis le serveur."
            : "Aucun dossier ne correspond à ces critères."
        }
        page={table.page}
        rowsPerPage={table.parPage}
        onPageChange={table.changerPage}
        onRowsPerPageChange={table.changerParPage}
      />

      <section className="mt-6">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <History size={15} /> Historique des envois groupés
        </h2>
        <DataTable
          data={historique}
          columns={convertirColonnesTanstack(colonnesHistorique)}
          label="Historique des envois groupés"
          getRowId={(entree) => entree.id}
          columnToggle
          emptyTitle="Aucun envoi"
          emptyDescription="Les campagnes envoyées apparaîtront ici."
          page={1}
          rowsPerPage={10}
          onPageChange={() => undefined}
          onRowsPerPageChange={() => undefined}
        />
      </section>

      <Modal
        ouvert={modalEnvoi}
        titre="Envoyer une notification groupée"
        description={`${selectionValides.length} destinataire(s) sélectionné(s). Vérifiez le récapitulatif avant l’envoi.`}
        fermer={() => {
          if (!envoiEnCours) setModalEnvoi(false);
        }}
        fermetureBloquee={envoiEnCours}
        largeur="large"
        pied={
          <>
            <Button
              variante="contour"
              onClick={() => setModalEnvoi(false)}
              disabled={envoiEnCours}
            >
              Annuler
            </Button>
            <Button
              variante="primaire"
              onClick={() => void envoyerCampagne()}
              chargement={envoiEnCours}
              disabled={envoiEnCours || selectionValides.length === 0}
            >
              {envoiEnCours ? (
                "Envoi en cours…"
              ) : (
                <>
                  <Send size={15} /> Confirmer l’envoi
                </>
              )}
            </Button>
          </>
        }
      >
        <div className="formulaire-sre">
          <FormField libelle="Titre de la notification" requis>
            {(p) => (
              <input
                {...p}
                className="champ-simple-sre"
                value={titreNotification}
                onChange={(event) => setTitreNotification(event.target.value)}
                maxLength={160}
              />
            )}
          </FormField>
          <FormField
            libelle="Message"
            aide="Variables par destinataire : {nom} {reference} {typeImpot} {periode} {echeance} {joursRetard} {montant}"
            requis
          >
            {(p) => (
              <textarea
                {...p}
                className="champ-simple-sre"
                rows={7}
                value={modeleMessage}
                onChange={(event) => setModeleMessage(event.target.value)}
              />
            )}
          </FormField>
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Users size={13} /> Destinataires ({selectionValides.length})
            </p>
            <ul className="max-h-40 overflow-y-auto rounded-md border border-border p-2 text-xs">
              {selectionValides.map((ligne) => (
                <li key={ligne.obligationId} className="flex items-center justify-between py-0.5">
                  <span>{ligne.entite.nom}</span>
                  <span className="text-muted-foreground">
                    {ligne.referenceFiscale} · {formatMoney(Number(ligne.montant))}
                  </span>
                </li>
              ))}
              {selectionValides.length === 0 && (
                <li className="text-muted-foreground">
                  Aucun destinataire valide (les dossiers régularisés sont exclus).
                </li>
              )}
            </ul>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BellRing size={13} />
            Les notifications in-app sont créées pour chaque entité ; les courriels dépendent de la
            configuration du transport. Les envois déjà effectués aujourd’hui pour un même dossier
            sont ignorés.
          </p>
          <FormError message={erreurEnvoi} />
        </div>
      </Modal>

      {bilan && (
        <section className="mt-6 rounded-md border border-border p-4">
          <h2 className="mb-2 text-sm font-bold">Résultat de la dernière campagne</h2>
          <p className="mb-2 text-xs text-muted-foreground">
            {bilan.notificationsCreees} créée(s) · {bilan.dejaEnvoyees} déjà envoyée(s) ·{" "}
            {bilan.ignorees} ignorée(s) · {bilan.echecs} échec(s) · {bilan.courrielsEnvoyes}{" "}
            courriel(s) remis · {bilan.courrielsNonConfigures} sans transport
          </p>
          <ul className="flex flex-col gap-1 text-xs">
            {bilan.details.map((detail) => (
              <li key={`${detail.obligationId}-${detail.resultat}`} className="flex gap-2">
                <StatusBadge statut={detail.resultat} />
                <span>
                  {detail.destinataire} ({detail.reference}) —{" "}
                  {detail.erreur ?? `courriel : ${detail.statutCourriel}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
