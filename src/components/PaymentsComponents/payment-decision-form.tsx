import type { UseFormReturn } from "react-hook-form";
import { Textarea, FormField, FormError, COMPACT_FORM_CLASS, FORM_CLASS } from "@/components";
import type { DecisionReasonFormValues } from "@/schemas";
import { cn } from "@/utils";

export const REASON_EMPTY: DecisionReasonFormValues = { motif: "" };

export function PaymentDecisionFormFields({
  form,
  error,
}: Readonly<{ form: UseFormReturn<DecisionReasonFormValues>; error?: string }>) {
  const {
    register,
    formState: { errors },
  } = form;
  return (
    <div className={cn(COMPACT_FORM_CLASS, FORM_CLASS)}>
      <FormField label="Motif détaillé" error={errors.motif} required>
        {(p) => (
          <Textarea
            {...p}
            rows={4}
            placeholder="Expliquez la décision et les éléments qui la motivent…"
            {...register("motif")}
          />
        )}
      </FormField>
      <FormError message={error} />
    </div>
  );
}
