import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CirclePlus } from "lucide-react";
import type { Taxpayer } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi, mapApiTaxpayer, type ApiTaxpayer } from "@/services/api-client";
import {
  SRE_REGION,
  TAXPAYER_TYPE_OPTIONS,
  MSG_SESSION_MISSING_ADMIN,
  ALL,
} from "@/constants";
import {
  Button,
  ConfirmDialog,
  PageHeader,
  Modal,
  DataTable,
  toTanstackColumns,
} from "@/components/ui";
import { OptionsSelect } from "@/components/forms/options-select";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/forms/form-field";
import { TaxpayerFormFields, PROFILE_EMPTY } from "@/components/forms/admin/taxpayer-form";
import { createTaxpayerColumns } from "@/components/tables/admin/taxpayers-columns";
import { useApiForm, useTableState, useConfirmation } from "@/hooks";
import { taxpayerFormSchema, type TaxpayerFormValues } from "@/validation/profile.schema";

const PROFILE_STEP_FIELDS = [
  ["type", "nom", "prenom", "raisonSociale", "nomCommercial"],
  ["nif", "stat", "representantLegal"],
  ["courriel", "telephone", "adresse", "region", "ville"],
] as const;
type FormStep = 0 | 1 | 2;

export function AdminTaxpayersPage({
  typeInitial = ALL,
}: { typeInitial?: "TOUS" | "ENTREPRISE" } = {}) {
  const { state, updateState, notify } = useSre();
  const { session } = useAuth();
  const table = useTableState();
  const [typeFilter, setTypeFilter] = useState<string>(typeInitial);
  const [modal, setModal] = useState(false);
  const [formStep, setStepForm] = useState<FormStep>(0);
  const deletion = useConfirmation<Taxpayer>();
  const form = useApiForm<TaxpayerFormValues>({
    schema: taxpayerFormSchema,
    initialValues: PROFILE_EMPTY,
    fallbackMessage: "Le serveur n’a pas enregistré le profil.",
  });

  const taxpayers = useMemo(
    () =>
      state.taxpayers.filter(
        (taxpayer) => typeFilter === ALL || taxpayer.type === typeFilter,
      ),
    [state.taxpayers, typeFilter],
  );

  const columns = createTaxpayerColumns({ onDelete: deletion.open });

  const close = () => {
    setModal(false);
    setStepForm(0);
    form.resetForm();
  };

  const advanceStep = async () => {
    const valid = await form.trigger([...PROFILE_STEP_FIELDS[formStep]], {
      shouldFocus: true,
    });
    if (valid) {
      setStepForm((current) => {
        if (current === 0 && form.getValues("type") === "PARTICULIER") return 2;
        return Math.min(2, current + 1) as 0 | 1 | 2;
      });
    }
  };

  const create = form.handleSubmit(async (values) => {
    form.resetError();
    if (!session?.apiToken) {
      form.setError(MSG_SESSION_MISSING_ADMIN);
      return;
    }
    try {
      const body = {
        type: values.type,
        nom: values.nom.trim() || values.raisonSociale?.trim() || "",
        ...(values.prenom?.trim() ? { prenom: values.prenom.trim() } : {}),
        ...(values.raisonSociale?.trim() ? { raisonSociale: values.raisonSociale.trim() } : {}),
        ...(values.nomCommercial?.trim() ? { nomCommercial: values.nomCommercial.trim() } : {}),
        ...(values.nif.trim() ? { nif: values.nif.trim() } : {}),
        ...(values.stat?.trim() ? { stat: values.stat.trim() } : {}),
        adresse: values.adresse.trim(),
        region: SRE_REGION,
        ville: values.ville.trim(),
        courriel: values.courriel.trim().toLowerCase(),
        telephone: values.telephone.trim(),
        ...(values.representantLegal?.trim()
          ? { representantLegal: values.representantLegal.trim() }
          : {}),
        ...(values.nomContact?.trim() ? { nomContact: values.nomContact.trim() } : {}),
        ...(values.prenomContact?.trim() ? { prenomContact: values.prenomContact.trim() } : {}),
        ...(values.fonctionContact?.trim()
          ? { fonctionContact: values.fonctionContact.trim() }
          : {}),
      };
      const response = await callApi<ApiTaxpayer>("contribuables", {
        method: "POST",
        token: session.apiToken,
        body: body,
      });
      const newTaxpayer = mapApiTaxpayer(response);
      updateState((current) => ({
        ...current,
        taxpayers: [newTaxpayer, ...current.taxpayers],
      }));
      notify("Profil contribuable enregistré.", "success");
      close();
    } catch (cause) {
      form.handleFailure(cause);
    }
  });

  const remove = async (target: Taxpayer) => {
    if (!session?.apiToken) throw new Error(MSG_SESSION_MISSING_ADMIN);
    await callApi<{ message: string }>(`contribuables/${encodeURIComponent(target.id)}`, {
      method: "DELETE",
      token: session.apiToken,
    });
    updateState((current) => ({
      ...current,
      taxpayers: current.taxpayers.filter((entry) => entry.id !== target.id),
    }));
    notify("Profil contribuable supprimé.", "success");
  };

  const business = typeInitial === "ENTREPRISE";
  const taxpayerNameToDelete =
    deletion.target?.legalName ||
    [deletion.target?.firstName, deletion.target?.lastName].filter(Boolean).join(" ");

  return (
    <div className="page-content-sre">
      <PageHeader
        title={business ? "Entreprises" : "Contribuables"}
        description={`Profils du périmètre ${SRE_REGION}.`}
        breadcrumb={["Accueil", business ? "Entreprises" : "Contribuables"]}
      />
      
      <DataTable
        data={taxpayers}
        columns={toTanstackColumns(columns)}
        label="Profils contribuables"
        getRowId={(entry) => entry.id}
        getSearchText={(taxpayer) =>
          `${taxpayer.lastName} ${taxpayer.firstName ?? ""} ${taxpayer.legalName ?? ""} ${taxpayer.nif} ${taxpayer.stat ?? ""} ${taxpayer.email}`
        }
        searchPlaceholder="Nom, NIF, STAT ou e-mail…"
        searchValue={table.search}
        onSearchChange={table.changeSearch}
        toolbarActions={
          <label className="compact-filter-sre">
            Type
            <Select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                table.resetPage();
              }}
            >
              <OptionsSelect options={TAXPAYER_TYPE_OPTIONS} />
            </Select>
          </label>
        }
        actionPrimary={
          <Button
            onClick={() => {
              setStepForm(0);
              setModal(true);
              form.resetError();
            }}
          >
            <CirclePlus size={15} /> Ajouter un profil
          </Button>
        }
        columnToggle
        emptyTitle="Aucun contribuable"
        emptyDescription="Aucun profil ne correspond à votre recherche."
        page={table.page}
        rowsPerPage={table.perPage}
        onPageChange={table.changePage}
        onRowsPerPageChange={table.changePerPage}
      />
      <Modal
        open={modal}
        title="Ajouter un profil contribuable"
        description={`Dossier rattaché à ${SRE_REGION}. Formulaire en trois étapes ; aucun compte ni mot de passe ne sera créé.`}
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
                onClick={() => {
                  if (formStep === 2 && form.getValues("type") === "PARTICULIER")
                    setStepForm(0);
                  else setStepForm((current) => Math.max(0, current - 1) as 0 | 1 | 2);
                }}
                disabled={form.isSubmitting}
              >
                <ArrowLeft size={15} /> Précédent
              </Button>
            )}
            {formStep < 2 ? (
              <Button onClick={() => void advanceStep()} disabled={form.isSubmitting}>
                Suivant <ArrowRight size={15} />
              </Button>
            ) : (
              <SubmitButton
                form="formulaire-contribuable-admin"
                inProgress={form.isSubmitting}
                pendingLabel="Enregistrement…"
              >
                Enregistrer le profil
              </SubmitButton>
            )}
          </>
        }
      >
        <form
          id="formulaire-contribuable-admin"
          onSubmit={
            formStep === 2
              ? create
              : (event) => {
                  event.preventDefault();
                  void advanceStep();
                }
          }
          noValidate
        >
          <TaxpayerFormFields
            form={form}
            error={form.error}
            step={formStep}
          />
        </form>
      </Modal>
      <ConfirmDialog
        open={!!deletion.target}
        title="Supprimer ce profil ?"
        description={`Le profil « ${taxpayerNameToDelete} » sera supprimé définitivement si aucun compte, paiement ou historique fiscal ne lui est lié. Cette action est irréversible.`}
        close={deletion.close}
        confirm={() => void deletion.execute(remove)}
        confirmLabel="Supprimer le profil"
        danger
        loading={deletion.inProgress}
        error={deletion.error}
      />
    </div>
  );
}

export function AdminBusinessesPage() {
  return <AdminTaxpayersPage typeInitial="ENTREPRISE" />;
}
