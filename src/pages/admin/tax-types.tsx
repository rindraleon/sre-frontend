import { useState } from "react";
import { ArrowLeft, ArrowRight, CirclePlus } from "lucide-react";
import type { TaxType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi, mapApiTaxType, type ApiTaxType } from "@/services/api-client";
import {
  Button,
  ConfirmDialog,
  PageHeader,
  Modal,
  DataTable,
  toTanstackColumns,
} from "@/components/ui";
import { SubmitButton } from "@/components/forms/form-field";
import { TaxTypeFormFields, TAX_TYPE_EMPTY } from "@/components/forms/admin/tax-type-form";
import { createTaxTypeColumns } from "@/components/tables/admin/tax-types-columns";
import { useApiForm, useTableState, useConfirmation } from "@/hooks";
import { taxTypeFormSchema, type TaxTypeFormValues } from "@/validation/admin.schema";

const TAX_TYPE_STEP_FIELDS = [
  ["code", "nom", "categorie", "description"],
  [
    "contribuablesConcernes",
    "periodicite",
    "modeMontant",
    "montantReference",
    "regleEcheance",
    "champsComplementairesTexte",
  ],
] as const;

export function AdminTaxTypesPage() {
  const { state, updateState, notify } = useSre();
  const { session } = useAuth();
  const table = useTableState();
  const [modal, setModal] = useState(false);
  const [formStep, setStepForm] = useState<0 | 1>(0);
  const [typeModifie, setTypeModifie] = useState<string | null>(null);
  const toggleConfirmation = useConfirmation<TaxType>();
  const form = useApiForm<TaxTypeFormValues>({
    schema: taxTypeFormSchema,
    initialValues: TAX_TYPE_EMPTY,
    fallbackMessage: "Le serveur n’a pas enregistré le type d’impôt.",
  });

  const types = state.taxTypes;

  const openEditing = (type?: TaxType) => {
    setStepForm(0);
    form.resetError();
    setTypeModifie(type?.id ?? null);
    form.resetForm(
      type
        ? {
            code: type.code,
            nom: type.name,
            description: type.description,
            categorie: type.category,
            contribuablesConcernes: type.applicableTaxpayers,
            periodicite: type.periodicity,
            regleEcheance: type.dueDateRule,
            modeMontant: type.amountMode,
            montantReference: type.referenceAmount,
            champsComplementairesTexte: type.additionalFields.join(", "),
          }
        : TAX_TYPE_EMPTY,
    );
    setModal(true);
  };

  const close = () => {
    setModal(false);
    setStepForm(0);
    setTypeModifie(null);
    form.resetForm();
  };

  const advanceStep = async () => {
    const valid = await form.trigger([...TAX_TYPE_STEP_FIELDS[formStep]], {
      shouldFocus: true,
    });
    if (valid) setStepForm(1);
  };

  const columns = createTaxTypeColumns({
    onUpdate: openEditing,
    onToggle: toggleConfirmation.open,
  });

  const save = form.handleSubmit(async (values) => {
    form.resetError();
    if (!session?.apiToken) {
      form.setError("Session serveur introuvable. Reconnectez-vous.");
      return;
    }
    if (
      state.taxTypes.some(
        (type) =>
          type.code.toLowerCase() === values.code.trim().toLowerCase() && type.id !== typeModifie,
      )
    ) {
      form.setError("code", { type: "server", message: "Ce code est déjà utilisé." });
      setStepForm(0);
      return;
    }
    try {
      const body = {
        periodicite: values.periodicite,
        contribuablesConcernes: values.contribuablesConcernes,
        modeMontant: values.modeMontant,
        code: values.code.trim().toUpperCase(),
        nom: values.nom.trim(),
        description: values.description.trim(),
        categorie: values.categorie.trim(),
        regleEcheance: values.regleEcheance.trim(),
        montantReference: values.montantReference,
        champsComplementaires: values.champsComplementairesTexte
          .split(",")
          .map((field) => field.trim())
          .filter(Boolean),
      };
      const response = await callApi<ApiTaxType>(
        typeModifie ? `types-impots/${encodeURIComponent(typeModifie)}` : "types-impots",
        { method: typeModifie ? "PATCH" : "POST", token: session.apiToken, body: body },
      );
      const typeBackup = mapApiTaxType(response);
      updateState((current) => ({
        ...current,
        taxTypes: [
          typeBackup,
          ...current.taxTypes.filter((type) => type.id !== typeBackup.id),
        ],
      }));
      notify(
        typeModifie
          ? "Type d’impôt modifié sur le serveur."
          : "Type d’impôt enregistré sur le serveur.",
        "success",
      );
      close();
    } catch (cause) {
      form.handleFailure(cause);
    }
  });

  const toggleActive = async (type: TaxType) => {
    if (!session?.apiToken) throw new Error("Session serveur introuvable. Reconnectez-vous.");
    const isActive = !type.isActive;
    try {
      const response = await callApi<ApiTaxType>(
        `types-impots/${encodeURIComponent(type.id)}/activite`,
        { method: "PATCH", token: session.apiToken, body: { actif: isActive } },
      );
      const typeBackup = mapApiTaxType(response);
      updateState((current) => ({
        ...current,
        taxTypes: current.taxTypes.map((entry) =>
          entry.id === type.id ? typeBackup : entry,
        ),
      }));
      notify(
        isActive
          ? "Type d’impôt réactivé sur le serveur."
          : "Type d’impôt désactivé. L’historique associé est conservé.",
        "success",
      );
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Le serveur n’a pas modifié le statut.";
      notify(message, "error");
      throw new Error(message);
    }
  };

  return (
    <div className="page-content-sre">
      <PageHeader
        title="Types d’impôts"
        description="Paramètres fiscaux validés par l’administration."
        breadcrumb={["Accueil", "Types d’impôts"]}
      />
      <DataTable
        data={types}
        columns={toTanstackColumns(columns)}
        label="Types d’impôts"
        getRowId={(type) => type.id}
        getSearchText={(type) => `${type.code} ${type.name} ${type.category} ${type.description}`}
        searchPlaceholder="Code, nom ou catégorie…"
        searchValue={table.search}
        onSearchChange={table.changeSearch}
        actionPrimary={
          <Button onClick={() => openEditing()}>
            <CirclePlus size={15} /> Ajouter un type
          </Button>
        }
        columnToggle
        emptyTitle="Aucun type d’impôt"
        emptyDescription="Les types enregistrés par l’administration apparaîtront ici."
        page={table.page}
        rowsPerPage={table.perPage}
        onPageChange={table.changePage}
        onRowsPerPageChange={table.changePerPage}
      />
      <Modal
        open={modal}
        title={typeModifie ? "Modifier le type d’impôt" : "Ajouter un type d’impôt"}
        description="Formulaire en deux étapes. Saisissez uniquement des règles fiscales approuvées et applicables."
        close={close}
        disableClose={form.isSubmitting}
        width="large"
        footer={
          <>
            <Button variant="outline" onClick={close} disabled={form.isSubmitting}>
              Annuler
            </Button>
            {formStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setStepForm(0)}
                disabled={form.isSubmitting}
              >
                <ArrowLeft size={15} /> Précédent
              </Button>
            )}
            {formStep === 0 ? (
              <Button onClick={() => void advanceStep()} disabled={form.isSubmitting}>
                Suivant <ArrowRight size={15} />
              </Button>
            ) : (
              <SubmitButton
                form="formulaire-type-impot"
                inProgress={form.isSubmitting}
                pendingLabel="Enregistrement…"
              >
                Enregistrer
              </SubmitButton>
            )}
          </>
        }
      >
        <form
          id="formulaire-type-impot"
          onSubmit={
            formStep === 1
              ? save
              : (event) => {
                  event.preventDefault();
                  void advanceStep();
                }
          }
          noValidate
        >
          <TaxTypeFormFields
            form={form}
            error={form.error}
            step={formStep}
          />
        </form>
      </Modal>
      <ConfirmDialog
        open={!!toggleConfirmation.target}
        title={toggleConfirmation.target?.isActive ? "Désactiver ce type ?" : "Réactiver ce type ?"}
        description={
          toggleConfirmation.target?.isActive
            ? `Le type « ${toggleConfirmation.target?.name} » ne sera plus proposé dans les nouvelles opérations. Son historique sera conservé.`
            : `Le type « ${toggleConfirmation.target?.name} » sera réactivé.`
        }
        close={toggleConfirmation.close}
        confirm={() => void toggleConfirmation.execute(toggleActive)}
        confirmLabel={toggleConfirmation.target?.isActive ? "Désactiver" : "Réactiver"}
        danger={!!toggleConfirmation.target?.isActive}
        loading={toggleConfirmation.inProgress}
        error={toggleConfirmation.error}
      />
    </div>
  );
}
