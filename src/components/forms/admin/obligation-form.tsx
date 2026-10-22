import type { UseFormReturn } from "react-hook-form";
import { CalendarDays } from "lucide-react";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { FormField, FormError } from "@/components/forms/form-field";
import { useSre } from "@/context/SreContext";
import type { ObligationFormValues } from "@/validation/admin.schema";

export const OBLIGATION_EMPTY: ObligationFormValues = {
  contribuableId: "",
  typeImpotId: "",
  periode: "",
  montant: undefined as unknown as number,
  echeance: "",
};

export function ObligationFormFields({
  form,
  error,
}: Readonly<{ form: UseFormReturn<ObligationFormValues>; error?: string }>) {
  const { state } = useSre();
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const selectedTaxpayer = watch("contribuableId");
  return (
    <div className="form-sre form-grid-sre compact-form-sre">
      <FormField
        label="Contribuable"
        error={errors.contribuableId}
        required
        className="field-sre-wide"
      >
        {(p) => (
          <SearchableSelect
            {...p}
            value={selectedTaxpayer}
            onChoose={(value) =>
              setValue("contribuableId", value, { shouldValidate: true, shouldTouch: true })
            }
            placeholder="Rechercher un contribuable (nom, NIF, e-mail)…"
            options={state.taxpayers.map((taxpayer) => ({
              value: taxpayer.id,
              label:
                taxpayer.legalName ||
                `${taxpayer.firstName ?? ""} ${taxpayer.lastName}`.trim(),
              description: taxpayer.nif || taxpayer.email,
            }))}
          />
        )}
      </FormField>
      <FormField
        label="Type d’impôt"
        error={errors.typeImpotId}
        required
        className="field-sre-wide"
      >
        {(p) => (
          <Select {...p} className="field-simple-sre" {...register("typeImpotId")}>
            <option value="">Choisir un type actif</option>
            {state.taxTypes
              .filter((type) => type.isActive)
              .map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} · {type.category}
                </option>
              ))}
          </Select>
        )}
      </FormField>
      <FormField label="Période" error={errors.periode} required>
        {(p) => <input {...p} className="field-simple-sre" {...register("periode")} />}
      </FormField>
      <FormField label="Montant validé (MGA)" error={errors.montant} required>
        {(p) => (
          <input
            {...p}
            className="field-simple-sre"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            {...register("montant", { valueAsNumber: true })}
          />
        )}
      </FormField>
      <FormField
        label="Échéance"
        error={errors.echeance}
        required
        className="field-sre-wide"
      >
        {(p) => <input {...p} className="field-simple-sre" type="date" {...register("echeance")} />}
      </FormField>
      <div className="field-sre-wide">
        <FormError message={error} />
      </div>
      <div className="tax-note-sre field-sre-wide">
        <span>
          <CalendarDays size={15} />
        </span>
        <p>
          Seules les données saisies ici sont enregistrées. L’échéance et le montant ne sont pas
          calculés automatiquement par le portail.
        </p>
      </div>
    </div>
  );
}
