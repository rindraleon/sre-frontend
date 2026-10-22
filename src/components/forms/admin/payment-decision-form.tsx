import type { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormError } from "@/components/forms/form-field";
import type { DecisionReasonFormValues } from "@/validation/payment.schema";

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
    <div className="form-sre compact-form-sre">
      <FormField label="Motif détaillé" error={errors.motif} required>
        {(p) => <Textarea {...p} rows={4} {...register("motif")} />}
      </FormField>
      <FormError message={error} />
    </div>
  );
}
