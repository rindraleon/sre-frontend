import { FileCheck2, ReceiptText } from "lucide-react";
import {
  FormField,
  FIELD_INPUT_CLASS,
  FORM_GRID_CLASS,
  TAX_NOTE_CLASS,
  TEXT_HELP_CLASS,
} from "@/components";
import { currentLocalDate, type StepProps } from "./declaration-steps";
import { cn } from "@/utils";

export function PaymentReferenceStep({ form, payerLabel }: Readonly<StepProps>) {
  const {
    register,
    formState: { errors },
  } = form;
  return (
    <>
      <div className={cn(FORM_GRID_CLASS)}>
        <FormField
          label="Référence de l’opération"
          error={errors.referenceTransaction}
          help="Identifiant du transfert, du dépôt ou du message mobile money."
          required
        >
          {(p) => (
            <input
              {...p}
              className={FIELD_INPUT_CLASS}
              autoComplete="off"
              placeholder="Ex. MP260312456789"
              {...register("referenceTransaction")}
            />
          )}
        </FormField>
        <FormField label="Date de l’opération" error={errors.dateTransaction} required>
          {(p) => (
            <input
              {...p}
              className={FIELD_INPUT_CLASS}
              type="date"
              max={currentLocalDate()}
              readOnly
              aria-readonly="true"
              {...register("dateTransaction")}
            />
          )}
        </FormField>
      </div>
      <div className={TAX_NOTE_CLASS}>
        <FileCheck2 size={15} />
        <p>
          Payeur déclaré : <strong>{payerLabel}</strong>. Le reçu officiel est émis automatiquement
          dès la soumission ; une référence saisie ne prouve pas à elle seule le règlement.
        </p>
      </div>
      <p className={TEXT_HELP_CLASS}>
        <ReceiptText size={13} aria-hidden="true" /> Votre reçu est disponible immédiatement après
        la soumission, dans « Historique des paiements ».
      </p>
    </>
  );
}
