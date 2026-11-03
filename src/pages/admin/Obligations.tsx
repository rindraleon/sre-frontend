import {
  Select,
  Button,
  PageHeader,
  Modal,
  DataTable,
  toTanstackColumns,
  OptionsSelect,
  SubmitButton,
  PAGE_CONTENT_CLASS,
  COMPACT_FILTER_CLASS,
} from "@/components";
import { useMemo, useState } from "react";
import { CirclePlus } from "lucide-react";
import { useAuth } from "@/contexts";
import { useSre } from "@/contexts";
import { ObligationFormFields, OBLIGATION_EMPTY } from "@/components/ObligationsComponents";
import { createObligationColumns as createAdminObligationColumns } from "@/components/ObligationsComponents/tables/admin";
import { OBLIGATION_STATUS_FILTER_OPTIONS } from "@/data";
import { obligationFormSchema, type ObligationFormValues } from "@/schemas";
import { createObligationApi } from "@/services/obligations";
import { useApiForm, useTableState } from "@/hooks";
import { ALL } from "@/data";

export function AdminObligationsPage() {
  const { state, updateState, notify } = useSre();
  const { session } = useAuth();
  const table = useTableState();
  const [status, setStatus] = useState<string>(ALL);
  const [modal, setModal] = useState(false);
  const form = useApiForm<ObligationFormValues>({
    schema: obligationFormSchema,
    initialValues: OBLIGATION_EMPTY,
    fallbackMessage: "Le serveur n’a pas créé l’obligation.",
  });

  const obligations = useMemo(
    () =>
      state.obligations
        .filter((obligation) => status === ALL || obligation.status === status)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.obligations, status],
  );

  const columns = createAdminObligationColumns({ taxpayers: state.taxpayers });

  const open = () => {
    form.resetForm();
    setModal(true);
  };
  const close = () => {
    setModal(false);
    form.resetForm();
  };

  const create = form.handleSubmit(async (values) => {
    form.resetError();
    if (!session?.apiToken) {
      form.setError("Session serveur introuvable. Reconnectez-vous.");
      return;
    }
    const taxpayer = state.taxpayers.some((entry) => entry.id === values.contribuableId);
    const type = state.taxTypes.some((entry) => entry.id === values.typeImpotId && entry.isActive);
    if (!taxpayer || !type) {
      form.setError("Sélectionnez un contribuable et un type d’impôt actif.");
      return;
    }
    try {
      const obligation = await createObligationApi(session.apiToken, {
        contribuableId: values.contribuableId,
        typeImpotId: values.typeImpotId,
        periode: values.periode.trim(),
        montant: values.montant,
        echeance: values.echeance,
      });
      updateState((current) => ({
        ...current,
        obligations: [obligation, ...current.obligations],
      }));
      notify("Obligation enregistrée sur le serveur.", "success");
      close();
    } catch (cause) {
      form.handleFailure(cause);
    }
  });

  return (
    <div className={PAGE_CONTENT_CLASS}>
      <PageHeader
        title="Obligations fiscales"
        description="Obligations enregistrées dans le périmètre du service."
        breadcrumb={["Accueil", "Obligations fiscales"]}
      />

      <DataTable
        data={obligations}
        columns={toTanstackColumns(columns)}
        label="Obligations fiscales"
        getRowId={(obligation) => obligation.id}
        getSearchText={(obligation) => {
          const taxpayer = state.taxpayers.find((entry) => entry.id === obligation.taxpayerId);
          return `${obligation.taxReference} ${obligation.taxTypeName} ${obligation.period} ${taxpayer?.legalName ?? ""} ${taxpayer?.firstName ?? ""} ${taxpayer?.lastName ?? ""} ${taxpayer?.nif ?? ""} ${taxpayer?.email ?? ""}`;
        }}
        searchPlaceholder="Référence, nom, NIF ou impôt…"
        searchValue={table.search}
        onSearchChange={table.changeSearch}
        toolbarActions={
          <label className={COMPACT_FILTER_CLASS}>
            Statut
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                table.resetPage();
              }}
            >
              <OptionsSelect options={OBLIGATION_STATUS_FILTER_OPTIONS} />
            </Select>
          </label>
        }
        actionPrimary={
          <Button onClick={open}>
            <CirclePlus size={15} /> Créer une obligation
          </Button>
        }
        columnToggle
        emptyTitle="Aucune obligation"
        emptyDescription="Aucune obligation ne correspond à vos critères."
        page={table.page}
        rowsPerPage={table.perPage}
        onPageChange={table.changePage}
        onRowsPerPageChange={table.changePerPage}
      />
      <Modal
        open={modal}
        title="Créer une obligation"
        description="Les valeurs seront persistées par le serveur et doivent correspondre aux règles validées."
        close={close}
        disableClose={form.isSubmitting}
        width="large"
        footer={
          <>
            <Button variant="outline" onClick={close} disabled={form.isSubmitting}>
              Annuler
            </Button>
            <SubmitButton
              form="formulaire-obligation-admin"
              inProgress={form.isSubmitting}
              pendingLabel="Enregistrement…"
            >
              Créer l’obligation
            </SubmitButton>
          </>
        }
      >
        <form id="formulaire-obligation-admin" onSubmit={create} noValidate>
          <ObligationFormFields form={form} error={form.error} />
        </form>
      </Modal>
    </div>
  );
}
