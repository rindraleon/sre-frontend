import { useMemo, useState } from "react";
import { Calculator, CirclePlus } from "lucide-react";
import type { TaxType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi, mapApiTaxType, type ApiTaxType } from "@/services/api-client";
import { Button, ConfirmDialog, PageHeader, Modal, DataTable } from "@/components/ui";
import { SubmitButton } from "@/components/forms/form-field";
import { TaxTypeFormFields, TAX_TYPE_VIDE } from "@/components/forms/admin/tax-type-form";
import { creerColonnesTypesImpot } from "@/components/tables/admin/tax-types-columns";
import { useApiForm, useTableState, useConfirmation } from "@/hooks";
import { taxTypeFormSchema, type TaxTypeFormValues } from "@/validation/admin.schema";

export function AdminTaxTypesPage() {
  const { etat, mettreAJourEtat, notifier } = useSre();
  const { session } = useAuth();
  const table = useTableState();
  const [modal, definirModal] = useState(false);
  const [typeModifie, definirTypeModifie] = useState<string | null>(null);
  const basculement = useConfirmation<TaxType>();
  const formulaire = useApiForm<TaxTypeFormValues>({
    schema: taxTypeFormSchema,
    valeursInitiales: TAX_TYPE_VIDE,
    messageRepli: "Le serveur n’a pas enregistré le type d’impôt.",
  });

  const types = useMemo(
    () =>
      etat.typesImpots.filter((type) =>
        `${type.code} ${type.nom} ${type.categorie} ${type.description}`
          .toLowerCase()
          .includes(table.recherche.toLowerCase()),
      ),
    [etat.typesImpots, table.recherche],
  );

  const ouvrirEdition = (type?: TaxType) => {
    formulaire.reinitialiserErreur();
    definirTypeModifie(type?.id ?? null);
    formulaire.reinitialiserFormulaire(
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
        : TAX_TYPE_VIDE,
    );
    definirModal(true);
  };

  const fermer = () => {
    definirModal(false);
    definirTypeModifie(null);
    formulaire.reinitialiserFormulaire();
  };

  const colonnes = creerColonnesTypesImpot({
    onModifier: ouvrirEdition,
    onBasculer: basculement.ouvrir,
  });

  const enregistrer = formulaire.handleSubmit(async (valeurs) => {
    formulaire.reinitialiserErreur();
    if (!session?.jetonApi) {
      formulaire.definirErreur("Session serveur introuvable. Reconnectez-vous.");
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
      fermer();
    } catch (cause) {
      formulaire.traiterEchec(cause);
    }
  });

  const basculer = async (type: TaxType) => {
    if (!session?.jetonApi) throw new Error("Session serveur introuvable. Reconnectez-vous.");
    const actif = !type.actif;
    try {
      const reponse = await callApi<ApiTaxType>(
        `types-impots/${encodeURIComponent(type.id)}/activite`,
        { method: "PATCH", token: session.jetonApi, body: { actif } },
      );
      const typeSauvegarde = mapApiTaxType(reponse);
      mettreAJourEtat((courant) => ({
        ...courant,
        typesImpots: courant.typesImpots.map((entree) =>
          entree.id === type.id ? typeSauvegarde : entree,
        ),
      }));
      notifier(
        actif
          ? "Type d’impôt réactivé sur le serveur."
          : "Type d’impôt désactivé. L’historique associé est conservé.",
        "succes",
      );
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Le serveur n’a pas modifié le statut.";
      notifier(message, "erreur");
      throw new Error(message);
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
        recherche={table.recherche}
        rechercher={table.rechercher}
        placeholder="Code, nom ou catégorie…"
        espaceVide="Aucun type d’impôt"
        messageVide="Les types enregistrés par l’administration apparaîtront ici."
        page={table.page}
        parPage={table.parPage}
        changerPage={table.changerPage}
        changerParPage={table.changerParPage}
      />
      <Modal
        ouvert={modal}
        titre={typeModifie ? "Modifier le type d’impôt" : "Ajouter un type d’impôt"}
        description="Saisissez uniquement des règles fiscales approuvées et applicables."
        fermer={fermer}
        fermetureBloquee={formulaire.isSubmitting}
        largeur="large"
        pied={
          <>
            <Button variante="contour" onClick={fermer} disabled={formulaire.isSubmitting}>
              Annuler
            </Button>
            <SubmitButton
              form="formulaire-type-impot"
              enCours={formulaire.isSubmitting}
              libelleEnCours="Enregistrement…"
            >
              Enregistrer
            </SubmitButton>
          </>
        }
      >
        <form id="formulaire-type-impot" onSubmit={enregistrer} noValidate>
          <TaxTypeFormFields formulaire={formulaire} erreur={formulaire.erreur} />
        </form>
      </Modal>
      <ConfirmDialog
        ouvert={!!basculement.cible}
        titre={basculement.cible?.actif ? "Désactiver ce type ?" : "Réactiver ce type ?"}
        description={
          basculement.cible?.actif
            ? `Le type « ${basculement.cible?.nom} » ne sera plus proposé dans les nouvelles opérations. Son historique sera conservé.`
            : `Le type « ${basculement.cible?.nom} » sera réactivé.`
        }
        fermer={basculement.fermer}
        confirmer={() => void basculement.executer(basculer)}
        libelleConfirmer={basculement.cible?.actif ? "Désactiver" : "Réactiver"}
        danger={!!basculement.cible?.actif}
        chargement={basculement.enCours}
        erreur={basculement.erreur}
      />
    </div>
  );
}
