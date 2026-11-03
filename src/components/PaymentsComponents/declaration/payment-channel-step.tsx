import { Check, CreditCard, WalletCards } from "lucide-react";
import {
  OPERATORS_MOBILE_MONEY,
  PAYMENT_METHOD_BANK_TRANSFER,
  PAYMENT_METHOD_MOBILE_MONEY,
} from "@/data";
import {
  FIELD_ERROR_CLASS,
  FIELD_INPUT_CLASS,
  FIELD_SELECT_CLASS,
  FORM_GRID_CLASS,
  FormField,
  OptionsSelect,
  PAYMENT_MODE_ACTIVE_CLASS,
  PAYMENT_MODE_CHOICE_CLASS,
  PAYMENT_MODE_CLASS,
  Select,
  TEXT_HELP_CLASS,
} from "@/components";
import type { StepProps } from "./declaration-steps";
import { cn } from "@/utils";

export function PaymentChannelStep({ form }: Readonly<StepProps>) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const mode = watch("mode");
  return (
    <>
      <div className={PAYMENT_MODE_CHOICE_CLASS}>
        <button
          type="button"
          aria-pressed={mode === PAYMENT_METHOD_MOBILE_MONEY}
          className={
            mode === PAYMENT_METHOD_MOBILE_MONEY ? PAYMENT_MODE_ACTIVE_CLASS : PAYMENT_MODE_CLASS
          }
          onClick={() => setValue("mode", PAYMENT_METHOD_MOBILE_MONEY, { shouldValidate: true })}
        >
          <WalletCards size={18} />
          <span>
            <strong>Mobile Money</strong>
            <small>MVola, Orange Money, Airtel Money</small>
          </span>
          {mode === PAYMENT_METHOD_MOBILE_MONEY && <Check size={16} />}
        </button>
        <button
          type="button"
          aria-pressed={mode === PAYMENT_METHOD_BANK_TRANSFER}
          className={
            mode === PAYMENT_METHOD_BANK_TRANSFER ? PAYMENT_MODE_ACTIVE_CLASS : PAYMENT_MODE_CLASS
          }
          onClick={() => setValue("mode", PAYMENT_METHOD_BANK_TRANSFER, { shouldValidate: true })}
        >
          <CreditCard size={18} />
          <span>
            <strong>Virement / dépôt bancaire</strong>
            <small>Guichet ou virement interbancaire</small>
          </span>
          {mode === PAYMENT_METHOD_BANK_TRANSFER && <Check size={16} />}
        </button>
      </div>
      {errors.mode && (
        <p className={FIELD_ERROR_CLASS} role="alert">
          {errors.mode.message}
        </p>
      )}
      {mode === PAYMENT_METHOD_MOBILE_MONEY ? (
        <div className={cn(FORM_GRID_CLASS)}>
          <FormField label="Opérateur utilisé" error={errors.operateur} required>
            {(p) => (
              <Select {...p} className={FIELD_SELECT_CLASS} {...register("operateur")}>
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
                className={FIELD_INPUT_CLASS}
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
        <div className={cn(FORM_GRID_CLASS)}>
          <FormField label="Établissement / canal" error={errors.banqueOuCanal} required>
            {(p) => (
              <input
                {...p}
                className={FIELD_INPUT_CLASS}
                autoComplete="organization"
                placeholder="Ex. Banque ou agence"
                {...register("banqueOuCanal")}
              />
            )}
          </FormField>
        </div>
      ) : (
        <p className={TEXT_HELP_CLASS}>Choisissez le canal utilisé pour poursuivre.</p>
      )}
    </>
  );
}
