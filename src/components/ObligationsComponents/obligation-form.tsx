import { cn } from "@/utils";
import type { UseFormReturn } from "react-hook-form";
import { CalendarDays } from "lucide-react";
import {
  Select,
  SearchableSelect,
  FormField,
  FormError,
  FIELD_SELECT_CLASS,
  FIELD_INPUT_CLASS,
  COMPACT_FORM_CLASS,
  FORM_GRID_CLASS,
  FORM_CLASS,
  FIELD_WIDE_CLASS,
} from "@/components";
import { useSre } from "@/contexts";
import type { ObligationFormValues } from "@/schemas";

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
    <div className={cn(FORM_GRID_CLASS, COMPACT_FORM_CLASS, FORM_CLASS)}>
      <FormField
        label="Contribuable"
        error={errors.contribuableId}
        required
        className={cn(FIELD_WIDE_CLASS)}
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
                taxpayer.legalName || `${taxpayer.firstName ?? ""} ${taxpayer.lastName}`.trim(),
              description: taxpayer.nif || taxpayer.email,
            }))}
          />
        )}
      </FormField>
      <FormField
        label="Type d’impôt"
        error={errors.typeImpotId}
        required
        className={cn(FIELD_WIDE_CLASS)}
      >
        {(p) => (
          <Select {...p} className={FIELD_SELECT_CLASS} {...register("typeImpotId")}>
            <option value="" disabled>
              Choisir un type actif
            </option>
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
        {(p) => (
          <input
            {...p}
            className={FIELD_INPUT_CLASS}
            placeholder="Ex. 2026-03 ou 2026-T1"
            {...register("periode")}
          />
        )}
      </FormField>
      <FormField label="Montant validé (MGA)" error={errors.montant} required>
        {(p) => (
          <input
            {...p}
            className={FIELD_INPUT_CLASS}
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            placeholder="0"
            {...register("montant", { valueAsNumber: true })}
          />
        )}
      </FormField>
      <FormField label="Échéance" error={errors.echeance} required className={cn(FIELD_WIDE_CLASS)}>
        {(p) => (
          <input {...p} className={FIELD_INPUT_CLASS} type="date" {...register("echeance")} />
        )}
      </FormField>
      <div className={cn(FIELD_WIDE_CLASS)}>
        <FormError message={error} />
      </div>
      <div className={FIELD_WIDE_CLASS}>
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
