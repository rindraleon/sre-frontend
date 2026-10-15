import { useMemo, useState } from "react";
import { Calculator, CirclePlus, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import type { TaxType } from "@/types/models";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi, mapApiTaxType, type ApiTaxType } from "@/services/api";
import {
  StatusBadge,
  Button,
  ConfirmDialog,
  PageHeader,
  Modal,
  DataTable,
  type TableColumn,
} from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taxTypeFormSchema, type TaxTypeFormValues } from "@/validation/admin.schema";
import { applyApiErrors, apiErrorMessage } from "@/validation/apiErrors";
import { FormField, SubmitButton, FormError } from "@/components/forms/FormField";

const libellesPeriodicite: Record<TaxType["periodicite"], string> = {
  MENSUELLE: "Mensuelle",
  TRIMESTRIELLE: "Trimestrielle",
  ANNUELLE: "Annuelle",
  PONCTUELLE: "Ponctuelle",
};

export function AdminTaxTypesPage() {
  const { etat, mettreAJourEtat, notifier } = useSre();
  const { session } = useAuth();
  const [recherche, definirRecherche] = useState("");
  const [page, definirPage] = useState(1);
  const [parPage, definirParPage] = useState(10);
  const [modal, definirModal] = useState(false);
  const formulaire = useForm<TaxTypeFormValues>({
    resolver: zodResolver(taxTypeFormSchema),
    mode: "onTouched",
    defaultValues: {
      code: "",
      nom: "",
      description: "",
      categorie: "",
      contribuablesConcernes: undefined as unknown as TaxTypeFormValues["contribuablesConcernes"],
      periodicite: undefined as unknown as TaxTypeFormValues["periodicite"],
      regleEcheance: "",
      modeMontant: undefined as unknown as TaxTypeFormValues["modeMontant"],
      montantReference: null,
      champsComplementairesTexte: "",
    },
  });
  const {
    register,
    handleSubmit,
    reset: reinitialiserFormulaire,
    formState: { errors, isSubmitting },
  } = formulaire;
  const [typeModifie, definirTypeModifie] = useState<string | null>(null);
  const [erreur, definirErreur] = useState("");
  const [cible, definirCible] = useState<TaxType | null>(null);

  const types = useMemo(
    () =>
      etat.typesImpots.filter((type) =>
        `${type.code} ${type.nom} ${type.categorie} ${type.description}`
          .toLowerCase()
          .includes(recherche.toLowerCase()),
      ),
    [etat.typesImpots, recherche],
  );
  const ouvrirEdition = (type?: TaxType) => {
    definirErreur("");
    definirTypeModifie(type?.id ?? null);
    reinitialiserFormulaire(
      type
        ? {
            code: type.code,
            nom: type.nom,
            description: type.description,
            categorie: type.categorie,
            contribuablesConcernes: type.contribuablesConcernes,
            periodicite: type.periodicite,
            regleEcheance: type.regleEcheance,
            modeMontant: type.modeMontant,
            montantReference: type.montantReference,
            champsComplementairesTexte: type.champsComplementaires.join(", "),
          }
        : {
            code: "",
            nom: "",
            description: "",
            categorie: "",
            contribuablesConcernes:
              undefined as unknown as TaxTypeFormValues["contribuablesConcernes"],
            periodicite: undefined as unknown as TaxTypeFormValues["periodicite"],
            regleEcheance: "",
            modeMontant: undefined as unknown as TaxTypeFormValues["modeMontant"],
            montantReference: null,
            champsComplementairesTexte: "",
          },
    );
    definirModal(true);
  };

  const colonnes: TableColumn<TaxType>[] = [
    {
      id: "nom",
      titre: "Type d’impôt",
      afficher: (type) => (
        <div>
          <strong>{type.nom}</strong>
          <small className="sous-ligne-sre">
            {type.code} · {type.description}
          </small>
        </div>
      ),
      valeurTri: (type) => type.nom,
    },
    {
      id: "categorie",
      titre: "Catégorie",
      afficher: (type) => type.categorie,
      valeurTri: (type) => type.categorie,
    },
    {
      id: "concernes",
      titre: "Contribuables concernés",
      afficher: (type) =>
        type.contribuablesConcernes === "TOUS"
          ? "Tous"
          : type.contribuablesConcernes === "ENTREPRISE"
            ? "Entreprises"
            : "Particuliers",
      valeurTri: (type) => type.contribuablesConcernes,
    },
    {
      id: "periodicite",
      titre: "Périodicité",
      afficher: (type) => libellesPeriodicite[type.periodicite],
      valeurTri: (type) => type.periodicite,
    },
    {
      id: "montant",
      titre: "Montant de référence",
      afficher: (type) =>
        type.montantReference == null ? "Non défini" : formatMoney(type.montantReference),
      valeurTri: (type) => type.montantReference ?? 0,
    },
    {
      id: "statut",
      titre: "Statut",
      afficher: (type) => <StatusBadge statut={type.actif ? "ACTIF" : "INACTIF"} />,
      valeurTri: (type) => String(type.actif),
    },
    {
      id: "date",
      titre: "Modifié le",
      afficher: (type) => formatDate(type.modifieLe),
      valeurTri: (type) => type.modifieLe,
    },
    {
      id: "action",
      titre: "Actions",
      afficher: (type) => (
        <div className="actions-tableau-sre">
          <Button variante="fantome" taille="petit" onClick={() => ouvrirEdition(type)}>
            <Pencil size={13} /> Modifier
          </Button>
          <Button variante="fantome" taille="petit" onClick={() => definirCible(type)}>
            {type.actif ? (
              <>
                <ToggleRight size={14} /> Désactiver
              </>
            ) : (
              <>
                <ToggleLeft size={14} /> Réactiver
              </>
            )}
          </Button>
        </div>
      ),
    },
  ];

  const enregistrer = handleSubmit(async (valeurs) => {
    definirErreur("");
    if (!session?.jetonApi) {
      definirErreur("Session serveur introuvable. Reconnectez-vous.");
      return;
    }
    if (
      etat.typesImpots.some(
        (type) =>
          type.code.toLowerCase() === valeurs.code.trim().toLowerCase() && type.id !== typeModifie,
      )
    ) {
      formulaire.setError("code", { type: "server", message: "Ce code est déjà utilisé." });
      return;
    }
    try {
      const corps = {
        periodicite: valeurs.periodicite,
        contribuablesConcernes: valeurs.contribuablesConcernes,
        modeMontant: valeurs.modeMontant,
        code: valeurs.code.trim().toUpperCase(),
        nom: valeurs.nom.trim(),
        description: valeurs.description.trim(),
        categorie: valeurs.categorie.trim(),
        regleEcheance: valeurs.regleEcheance.trim(),
        montantReference: valeurs.montantReference,
        champsComplementaires: valeurs.champsComplementairesTexte
          .split(",")
          .map((champ) => champ.trim())
          .filter(Boolean),
      };
      const reponse = await callApi<ApiTaxType>(
        typeModifie ? `types-impots/${encodeURIComponent(typeModifie)}` : "types-impots",
        { method: typeModifie ? "PATCH" : "POST", token: session.jetonApi, body: corps },
      );
      const typeSauvegarde = mapApiTaxType(reponse);
      mettreAJourEtat((courant) => ({
        ...courant,
        typesImpots: [
          typeSauvegarde,
          ...courant.typesImpots.filter((type) => type.id !== typeSauvegarde.id),
        ],
      }));
      notifier(
        typeModifie
          ? "Type d’impôt modifié sur le serveur."
          : "Type d’impôt enregistré sur le serveur.",
        "succes",
      );
      definirModal(false);
    } catch (cause) {
      const globales = applyApiErrors(formulaire, cause);
      definirErreur(
        globales.length
          ? globales.join(" ")
          : apiErrorMessage(cause, "Le serveur n’a pas enregistré le type d’impôt."),
      );
    }
  });

  const basculer = async () => {
    if (!cible || !session?.jetonApi) return;
    const actif = !cible.actif;
    try {
      const reponse = await callApi<ApiTaxType>(
        `types-impots/${encodeURIComponent(cible.id)}/activite`,
        { method: "PATCH", token: session.jetonApi, body: { actif } },
      );
      const typeSauvegarde = mapApiTaxType(reponse);
      mettreAJourEtat((courant) => ({
        ...courant,
        typesImpots: courant.typesImpots.map((type) =>
          type.id === cible.id ? typeSauvegarde : type,
        ),
      }));
      notifier(
        actif
          ? "Type d’impôt réactivé sur le serveur."
          : "Type d’impôt désactivé. L’historique associé est conservé.",
        "succes",
      );
    } catch (cause) {
      notifier(
        cause instanceof Error ? cause.message : "Le serveur n’a pas modifié le statut.",
        "erreur",
      );
    } finally {
      definirCible(null);
    }
  };

  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Types d’impôts"
        description="Gérez les paramètres fiscaux après validation par l’administration."
        filAriane={["Back-office", "Types d’impôts"]}
        actions={
          <Button onClick={() => ouvrirEdition()}>
            <CirclePlus size={15} /> Ajouter un type
          </Button>
        }
      />
      <div className="bandeau-info-sre">
        <span>
          <Calculator size={17} />
        </span>
        <div>
          <strong>Valeurs à saisir après validation par l’administration</strong>
          <p>
            Aucun taux, barème ou calendrier n’est fourni par défaut. Les champs doivent
            correspondre à des règles confirmées avant publication.
          </p>
        </div>
      </div>
      <DataTable
        lignes={types}
        colonnes={colonnes}
        obtenirId={(type) => type.id}
        recherche={recherche}
        rechercher={definirRecherche}
        placeholder="Code, nom ou catégorie…"
        espaceVide="Aucun type d’impôt"
        messageVide="Les types enregistrés par l’administration apparaîtront ici."
        page={page}
        parPage={parPage}
        changerPage={definirPage}
        changerParPage={definirParPage}
      />
      <Modal
        ouvert={modal}
        titre={typeModifie ? "Modifier le type d’impôt" : "Ajouter un type d’impôt"}
        description="Saisissez uniquement des règles fiscales approuvées et applicables."
        fermer={() => definirModal(false)}
        largeur="large"
        pied={
          <>
            <Button variante="contour" onClick={() => definirModal(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <SubmitButton
              form="formulaire-type-impot"
              enCours={isSubmitting}
              libelleEnCours="Enregistrement…"
            >
              Enregistrer
            </SubmitButton>
          </>
        }
      >
        <form
          id="formulaire-type-impot"
          className="formulaire-sre grille-formulaire-sre formulaire-compact-sre"
          onSubmit={enregistrer}
          noValidate
        >
          <FormField libelle="Code" erreur={errors.code} requis>
            {(p) => (
              <input {...p} className="champ-simple-sre" maxLength={32} {...register("code")} />
            )}
          </FormField>
          <FormField libelle="Nom du type" erreur={errors.nom} requis>
            {(p) => <input {...p} className="champ-simple-sre" {...register("nom")} />}
          </FormField>
          <FormField libelle="Catégorie" erreur={errors.categorie} requis>
            {(p) => <input {...p} className="champ-simple-sre" {...register("categorie")} />}
          </FormField>
          <FormField
            libelle="Contribuables concernés"
            erreur={errors.contribuablesConcernes}
            requis
          >
            {(p) => (
              <select {...p} className="champ-simple-sre" {...register("contribuablesConcernes")}>
                <option value="" disabled>
                  Choisir…
                </option>
                <option value="TOUS">Tous</option>
                <option value="PARTICULIER">Particuliers</option>
                <option value="ENTREPRISE">Entreprises</option>
              </select>
            )}
          </FormField>
          <FormField libelle="Périodicité" erreur={errors.periodicite} requis>
            {(p) => (
              <select {...p} className="champ-simple-sre" {...register("periodicite")}>
                <option value="" disabled>
                  Choisir…
                </option>
                <option value="MENSUELLE">Mensuelle</option>
                <option value="TRIMESTRIELLE">Trimestrielle</option>
                <option value="ANNUELLE">Annuelle</option>
                <option value="PONCTUELLE">Ponctuelle</option>
              </select>
            )}
          </FormField>
          <FormField libelle="Mode de montant" erreur={errors.modeMontant} requis>
            {(p) => (
              <select {...p} className="champ-simple-sre" {...register("modeMontant")}>
                <option value="" disabled>
                  Choisir…
                </option>
                <option value="MANUEL">À renseigner au cas par cas</option>
                <option value="FIXE">Montant de référence fixe</option>
                <option value="CALCULE">Calcul selon une règle validée</option>
              </select>
            )}
          </FormField>
          <FormField libelle="Montant de référence (MGA)" erreur={errors.montantReference}>
            {(p) => (
              <input
                {...p}
                className="champ-simple-sre"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                {...register("montantReference", {
                  setValueAs: (valeur: string) => (valeur === "" ? null : Number(valeur)),
                })}
              />
            )}
          </FormField>
          <FormField libelle="Règle d’échéance validée" erreur={errors.regleEcheance}>
            {(p) => <input {...p} className="champ-simple-sre" {...register("regleEcheance")} />}
          </FormField>
          <FormField
            libelle="Description"
            erreur={errors.description}
            classeSupplementaire="champ-sre-large"
          >
            {(p) => (
              <textarea
                {...p}
                className="champ-simple-sre champ-texte-sre"
                rows={2}
                {...register("description")}
              />
            )}
          </FormField>
          <FormField
            libelle="Champs complémentaires"
            erreur={errors.champsComplementairesTexte}
            aide="Séparés par des virgules"
            classeSupplementaire="champ-sre-large"
          >
            {(p) => (
              <input
                {...p}
                className="champ-simple-sre"
                {...register("champsComplementairesTexte")}
              />
            )}
          </FormField>
          <div className="champ-sre-large">
            <FormError message={erreur} />
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        ouvert={!!cible}
        titre={cible?.actif ? "Désactiver ce type ?" : "Réactiver ce type ?"}
        description={
          cible?.actif
            ? `Le type « ${cible?.nom} » ne sera plus proposé dans les nouvelles opérations. Son historique sera conservé.`
            : `Le type « ${cible?.nom} » sera réactivé.`
        }
        fermer={() => definirCible(null)}
        confirmer={() => void basculer()}
        libelleConfirmer={cible?.actif ? "Désactiver" : "Réactiver"}
        danger={!!cible?.actif}
      />
    </div>
  );
}
