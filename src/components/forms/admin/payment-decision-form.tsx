import type { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormError } from "@/components/forms/form-field";
import type { DecisionReasonFormValues } from "@/validation/payment.schema";

export const MOTIF_VIDE: DecisionReasonFormValues = { motif: "" };

export function PaymentDecisionFormFields({
  formulaire,
  erreur,
}: Readonly<{ formulaire: UseFormReturn<DecisionReasonFormValues>; erreur?: string }>) {
  const {
    register,
    formState: { errors },
  } = formulaire;
  return (
    <div className="formulaire-sre formulaire-compact-sre">
      <FormField libelle="Motif détaillé" erreur={errors.motif} requis>
        {(p) => <Textarea {...p} rows={4} {...register("motif")} />}
      </FormField>
      <FormError message={erreur} />
    </div>
  );
}
