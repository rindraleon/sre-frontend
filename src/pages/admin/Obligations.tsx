import { Select } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { CalendarDays, CirclePlus, FileText } from "lucide-react";
import type { TaxObligation } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi, mapApiObligation, type ApiObligation } from "@/services/api-client";
import {
  StatusBadge,
  Button,
  PageHeader,
  Modal,
  DataTable,
  type TableColumn,
} from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { obligationFormSchema, type ObligationFormValues } from "@/validation/admin.schema";
import { applyApiErrors, apiErrorMessage } from "@/validation/apiErrors";
import { FormField, SubmitButton, FormError } from "@/components/forms/form-field";
import { SearchableSelect } from "@/components/ui/searchable-select";

export function AdminObligationsPage() {
  const { etat, mettreAJourEtat, notifier } = useSre();
  const { session } = useAuth();
  const [recherche, definirRecherche] = useState("");
  const [statut, definirStatut] = useState("TOUS");
  const [page, definirPage] = useState(1);
  const [parPage, definirParPage] = useState(10);
  const [modal, definirModal] = useState(false);
  const [erreur, definirErreur] = useState("");
  const formulaire = useForm<ObligationFormValues>({
    resolver: zodResolver(obligationFormSchema),
    mode: "onTouched",
    defaultValues: {
      contribuableId: "",
      typeImpotId: "",
      periode: "",
      montant: undefined as unknown as number,
      echeance: "",
    },
  });
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = formulaire;
  const contribuableChoisi = watch("contribuableId");

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

  const colonnes: TableColumn<TaxObligation>[] = [
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
        <span className="montant-sre">{formatMoney(obligation.montant)}</span>
      ),
      valeurTri: (obligation) => obligation.montant,
    },
    {
      id: "echeance",
      titre: "Échéance",
      afficher: (obligation) => formatDate(obligation.echeance),
      valeurTri: (obligation) => obligation.echeance,
    },
    {
      id: "statut",
      titre: "Statut",
      afficher: (obligation) => <StatusBadge statut={obligation.statut} />,
      valeurTri: (obligation) => obligation.statut,
    },
  ];

  const ouvrir = () => {
    reset();
    definirErreur("");
    definirModal(true);
  };
  const creer = handleSubmit(async (valeurs) => {
    definirErreur("");
    if (!session?.jetonApi) {
      definirErreur("Session serveur introuvable. Reconnectez-vous.");
      return;
    }
    const contribuable = etat.contribuables.find((entree) => entree.id === valeurs.contribuableId);
    const type = etat.typesImpots.find(
      (entree) => entree.id === valeurs.typeImpotId && entree.actif,
    );
    if (!contribuable || !type) {
      definirErreur("Sélectionnez un contribuable et un type d’impôt actif.");
      return;
    }
    try {
      const reponse = await callApi<ApiObligation>("obligations", {
        method: "POST",
        token: session.jetonApi,
        body: {
          contribuableId: valeurs.contribuableId,
          typeImpotId: valeurs.typeImpotId,
          periode: valeurs.periode.trim(),
          montant: valeurs.montant,
          echeance: valeurs.echeance,
        },
      });
      const obligation = mapApiObligation(reponse);
      mettreAJourEtat((courant) => ({
        ...courant,
        obligations: [obligation, ...courant.obligations],
      }));
      notifier("Obligation enregistrée sur le serveur.", "succes");
      definirModal(false);
      reset();
    } catch (cause) {
      const globales = applyApiErrors(formulaire, cause);
      definirErreur(
        globales.length
          ? globales.join(" ")
          : apiErrorMessage(cause, "Le serveur n’a pas créé l’obligation."),
      );
    }
  });

  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Obligations fiscales"
        description="Consultez les obligations renvoyées par le serveur et créez un enregistrement validé."
        filAriane={["Back-office", "Obligations fiscales"]}
        actions={
          <Button onClick={ouvrir}>
            <CirclePlus size={15} /> Créer une obligation
          </Button>
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
      <DataTable
        lignes={obligations}
        colonnes={colonnes}
        obtenirId={(obligation) => obligation.id}
        recherche={recherche}
        rechercher={definirRecherche}
        placeholder="Référence, nom, NIF ou impôt…"
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
              <option value="PAIEMENT_EN_COURS">Paiement en cours</option>
              <option value="EN_VERIFICATION">En vérification</option>
              <option value="PAYE">Payé</option>
              <option value="EN_RETARD">En retard</option>
              <option value="REJETE">Rejeté</option>
              <option value="CORRECTION_DEMANDEE">Correction demandée</option>
            </Select>
          </label>
        }
        espaceVide="Aucune obligation"
        messageVide="Aucune obligation ne correspond à vos critères."
        page={page}
        parPage={parPage}
        changerPage={definirPage}
        changerParPage={definirParPage}
      />
      <Modal
        ouvert={modal}
        titre="Créer une obligation"
        description="Les valeurs seront persistées par le serveur et doivent correspondre aux règles validées."
        fermer={() => definirModal(false)}
        fermetureBloquee={isSubmitting}
        largeur="large"
        pied={
          <>
            <Button variante="contour" onClick={() => definirModal(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <SubmitButton
              form="formulaire-obligation-admin"
              enCours={isSubmitting}
              libelleEnCours="Enregistrement…"
            >
              Créer l’obligation
            </SubmitButton>
          </>
        }
      >
        <form
          id="formulaire-obligation-admin"
          className="formulaire-sre grille-formulaire-sre formulaire-compact-sre"
          onSubmit={creer}
          noValidate
        >
          <FormField
            libelle="Contribuable"
            erreur={errors.contribuableId}
            requis
            classeSupplementaire="champ-sre-large"
          >
            {(p) => (
              <SearchableSelect
                {...p}
                valeur={contribuableChoisi}
                onChoisir={(valeur) =>
                  setValue("contribuableId", valeur, { shouldValidate: true, shouldTouch: true })
                }
                placeholder="Rechercher un contribuable (nom, NIF, e-mail)…"
                options={etat.contribuables.map((contribuable) => ({
                  valeur: contribuable.id,
                  libelle:
                    contribuable.raisonSociale ||
                    `${contribuable.prenom ?? ""} ${contribuable.nom}`.trim(),
                  description: contribuable.nif || contribuable.courriel,
                }))}
              />
            )}
          </FormField>
          <FormField
            libelle="Type d’impôt"
            erreur={errors.typeImpotId}
            requis
            classeSupplementaire="champ-sre-large"
          >
            {(p) => (
              <Select {...p} className="champ-simple-sre" {...register("typeImpotId")}>
                <option value="">Choisir un type actif</option>
                {etat.typesImpots
                  .filter((type) => type.actif)
                  .map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.nom} · {type.categorie}
                    </option>
                  ))}
              </Select>
            )}
          </FormField>
          <FormField libelle="Période" erreur={errors.periode} requis>
            {(p) => <input {...p} className="champ-simple-sre" {...register("periode")} />}
          </FormField>
          <FormField libelle="Montant validé (MGA)" erreur={errors.montant} requis>
            {(p) => (
              <input
                {...p}
                className="champ-simple-sre"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                {...register("montant", { valueAsNumber: true })}
              />
            )}
          </FormField>
          <FormField
            libelle="Échéance"
            erreur={errors.echeance}
            requis
            classeSupplementaire="champ-sre-large"
          >
            {(p) => (
              <input {...p} className="champ-simple-sre" type="date" {...register("echeance")} />
            )}
          </FormField>
          <div className="champ-sre-large">
            <FormError message={erreur} />
          </div>
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
      </Modal>
    </div>
  );
}
