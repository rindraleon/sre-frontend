import type { UseFormReturn } from "react-hook-form";
import { Check, FileCheck2, WalletCards } from "lucide-react";
import type { TaxObligation } from "@/types";
import {
  PAYMENT_METHOD_MOBILE_MONEY,
  PAYMENT_METHOD_BANK_TRANSFER,
  OPERATORS_MOBILE_MONEY,
} from "@/constants";
import { Select } from "@/components/ui/select";
import { OptionsSelect } from "@/components/forms/options-select";
import { FormField, FormError } from "@/components/forms/form-field";
import { formatMoney, formatDate } from "@/utils/format";
import type { PaymentDeclarationFormValues } from "@/validation/payment.schema";

/** Default values of the payment declaration form. */
export const DECLARATION_PAYMENT_EMPTY: PaymentDeclarationFormValues = {
  obligationId: "",
  mode: undefined as unknown as PaymentDeclarationFormValues["mode"],
  operateur: undefined,
  telephoneUtilise: "",
  banqueOuCanal: "",
  titulairePayeur: "",
  referenceTransaction: "",
  dateTransaction: "",
};

/** Fields of the operation declaration form (without the <form> or its submission). */
export function PaymentDeclarationFormFields({
  form,
  error,
  availableObligations,
  obligation,
}: Readonly<{
  form: UseFormReturn<PaymentDeclarationFormValues>;
  error?: string;
  availableObligations: TaxObligation[];
  obligation?: TaxObligation;
}>) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const mode = watch("mode");
  return (
    <>
      <div className="form-step-sre">
        <span>1</span>
        <div>
          <h2>Obligation à régulariser</h2>
          <p>Sélectionnez une obligation associée à votre compte.</p>
        </div>
      </div>
      <FormField label="Impôt / obligation" error={errors.obligationId} required>
        {(p) => (
          <Select {...p} className="field-simple-sre" {...register("obligationId")}>
            <option value="">Choisir une obligation</option>
            {availableObligations.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.taxTypeName} · {entry.period} · {formatMoney(entry.amount)}
              </option>
            ))}
          </Select>
        )}
      </FormField>
      {obligation && (
        <div className="payment-obligation-summary-sre">
          <div>
            <small>Référence d’obligation</small>
            <strong>{obligation.taxReference}</strong>
          </div>
          <div>
            <small>Échéance</small>
            <strong>{formatDate(obligation.dueDate)}</strong>
          </div>
          <div>
            <small>Montant de l’obligation</small>
            <strong>{formatMoney(obligation.amount)}</strong>
          </div>
        </div>
      )}
      <div className="form-step-sre">
        <span>2</span>
        <div>
          <h2>Canal déclaré</h2>
          <p>Il s’agit d’une information déclarative, pas d’une intégration de paiement.</p>
        </div>
      </div>
      <div className="payment-mode-choice-sre">
        <button
          type="button"
          aria-pressed={mode === PAYMENT_METHOD_MOBILE_MONEY}
          className={
            mode === PAYMENT_METHOD_MOBILE_MONEY
              ? "payment-mode-sre payment-mode-sre--active"
              : "payment-mode-sre"
          }
          onClick={() => setValue("mode", PAYMENT_METHOD_MOBILE_MONEY, { shouldValidate: true })}
        >
          <WalletCards size={18} />
          <span>
            <strong>Mobile Money</strong>
            <small>Déclaration d’une opération déjà effectuée</small>
          </span>
          {mode === PAYMENT_METHOD_MOBILE_MONEY && <Check size={16} />}
        </button>
        <button
          type="button"
          aria-pressed={mode === PAYMENT_METHOD_BANK_TRANSFER}
          className={
            mode === PAYMENT_METHOD_BANK_TRANSFER
              ? "payment-mode-sre payment-mode-sre--active"
              : "payment-mode-sre"
          }
          onClick={() => setValue("mode", PAYMENT_METHOD_BANK_TRANSFER, { shouldValidate: true })}
        >
          <FileCheck2 size={18} />
          <span>
            <strong>Virement / canal bancaire</strong>
            <small>Déclaration d’une opération déjà effectuée</small>
          </span>
          {mode === PAYMENT_METHOD_BANK_TRANSFER && <Check size={16} />}
        </button>
      </div>
      {errors.mode && (
        <p className="field-error-sre" role="alert">
          {errors.mode.message}
        </p>
      )}
      {mode === PAYMENT_METHOD_MOBILE_MONEY ? (
        <div className="form-grid-sre">
          <FormField label="Opérateur indiqué" error={errors.operateur} required>
            {(p) => (
              <Select {...p} className="field-simple-sre" {...register("operateur")}>
                <option value="" disabled>
                  Choisir un opérateur
                </option>
                <OptionsSelect options={OPERATORS_MOBILE_MONEY} />
              </Select>
            )}
          </FormField>
          <FormField label="Numéro utilisé" error={errors.telephoneUtilise} required>
            {(p) => (
              <input
                {...p}
                className="field-simple-sre"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+261 …"
                {...register("telephoneUtilise")}
              />
            )}
          </FormField>
        </div>
      ) : mode === PAYMENT_METHOD_BANK_TRANSFER ? (
        <div className="form-grid-sre">
          <FormField label="Établissement / canal indiqué" error={errors.banqueOuCanal} required>
            {(p) => <input {...p} className="field-simple-sre" {...register("banqueOuCanal")} />}
          </FormField>
          <FormField label="Titulaire payeur" error={errors.titulairePayeur} help="Facultatif">
            {(p) => (
              <input
                {...p}
                className="field-simple-sre"
                autoComplete="name"
                {...register("titulairePayeur")}
              />
            )}
          </FormField>
        </div>
      ) : (
        <p className="text-help-sre">Choisissez un canal déclaré pour poursuivre.</p>
      )}
      <div className="form-step-sre">
        <span>3</span>
        <div>
          <h2>Référence de l’opération</h2>
          <p>Ces éléments sont transmis pour examen administratif.</p>
        </div>
      </div>
      <div className="form-grid-sre">
        <FormField label="Référence saisie" error={errors.referenceTransaction} required>
          {(p) => (
            <input {...p} className="field-simple-sre" {...register("referenceTransaction")} />
          )}
        </FormField>
        <FormField label="Date de l’opération" error={errors.dateTransaction} required>
          {(p) => (
            <input
              {...p}
              className="field-simple-sre"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              {...register("dateTransaction")}
            />
          )}
        </FormField>
      </div>
      <FormError message={error} />
    </>
  );
}
