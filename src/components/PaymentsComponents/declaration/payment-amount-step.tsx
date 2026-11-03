import { useMemo } from "react";
import {
  AMOUNT_INPUT_CLASS,
  AMOUNT_PRESETS_CLASS,
  FIELD_ERROR_CLASS,
  FIELD_SELECT_CLASS,
  FISCAL_PERIOD_PICKER_CLASS,
  FormField,
  Select,
} from "@/components";
import { formatMoney } from "@/utils";
import { formatAmountInput, MONTANT_MINIMUM, validateFiscalPeriod } from "@/schemas";
import { type StepProps } from "./declaration-steps";

export function PaymentAmountStep({ form, selectedTaxType }: Readonly<StepProps>) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;
  const montant = watch("montant");
  const periode = watch("periode");
  const periodError = selectedTaxType
    ? validateFiscalPeriod(selectedTaxType.periodicity, periode ?? "")
    : null;
  const fiscalYear = /^\d{4}/.exec(periode ?? "")?.[0] ?? String(new Date().getFullYear());
  const fiscalPart =
    selectedTaxType?.periodicity === "MENSUELLE"
      ? (periode?.split("-")[1] ?? "")
      : selectedTaxType?.periodicity === "TRIMESTRIELLE"
        ? (periode?.split("-")[1]?.slice(1) ?? "")
        : "";
  const fiscalYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, index) => String(currentYear - index));
    if (fiscalYear && !years.includes(fiscalYear)) years.push(fiscalYear);
    return years.sort((a, b) => Number(b) - Number(a));
  }, [fiscalYear]);
  const presets = useMemo(() => {
    const reference = selectedTaxType?.referenceAmount;
    if (!reference) return [] as number[];
    return [Math.round(reference / 2), reference, reference * 2].filter(
      (value) => value >= MONTANT_MINIMUM,
    );
  }, [selectedTaxType?.referenceAmount]);

  return (
    <>
      <FormField
        label="Montant à payer (MGA)"
        error={errors.montant}
        help={`Montant entier, minimum ${formatMoney(MONTANT_MINIMUM)}.`}
        required
      >
        {(p) => (
          <span className={AMOUNT_INPUT_CLASS}>
            <input
              {...p}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              aria-label="Montant à payer en ariary"
              value={montant ? formatAmountInput(montant) : ""}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, "").slice(0, 15);
                setValue("montant", digits, {
                  shouldValidate: digits.length > 0,
                  shouldDirty: true,
                });
              }}
            />
            <span>MGA</span>
          </span>
        )}
      </FormField>
      {presets.length > 0 && (
        <div className={AMOUNT_PRESETS_CLASS}>
          {presets.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setValue("montant", String(value), { shouldValidate: true, shouldDirty: true })
              }
            >
              {formatMoney(value)}
            </button>
          ))}
          {montant && (
            <button
              type="button"
              onClick={() => setValue("montant", "", { shouldValidate: false, shouldDirty: true })}
            >
              Effacer
            </button>
          )}
        </div>
      )}
      {selectedTaxType && selectedTaxType.periodicity !== "PONCTUELLE" && (
        <div className={FISCAL_PERIOD_PICKER_CLASS}>
          <FormField
            label="Année fiscale"
            error={errors.periode}
            help="Choisissez la période dans les listes."
            required
          >
            {(p) => (
              <Select
                {...p}
                className={FIELD_SELECT_CLASS}
                value={fiscalYear}
                onChange={(event) => {
                  const year = event.target.value;
                  const part = fiscalPart;
                  const nextPeriod =
                    selectedTaxType.periodicity === "ANNUELLE"
                      ? year
                      : part
                        ? `${year}-${selectedTaxType.periodicity === "TRIMESTRIELLE" ? `T${part}` : part}`
                        : "";
                  setValue("periode", nextPeriod, { shouldValidate: true, shouldDirty: true });
                }}
              >
                {fiscalYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
          {selectedTaxType.periodicity !== "ANNUELLE" && (
            <FormField
              label={selectedTaxType.periodicity === "MENSUELLE" ? "Mois" : "Trimestre"}
              error={errors.periode}
              required
            >
              {(p) => (
                <Select
                  {...p}
                  className={FIELD_SELECT_CLASS}
                  value={fiscalPart}
                  onChange={(event) => {
                    const part = event.target.value;
                    const nextPeriod = part
                      ? `${fiscalYear}-${selectedTaxType.periodicity === "TRIMESTRIELLE" ? `T${part}` : part}`
                      : "";
                    setValue("periode", nextPeriod, { shouldValidate: true, shouldDirty: true });
                  }}
                >
                  <option value="" disabled>
                    Choisir{" "}
                    {selectedTaxType.periodicity === "MENSUELLE" ? "un mois" : "un trimestre"}
                  </option>
                  {(selectedTaxType.periodicity === "MENSUELLE"
                    ? [
                        ["01", "Janvier"],
                        ["02", "Février"],
                        ["03", "Mars"],
                        ["04", "Avril"],
                        ["05", "Mai"],
                        ["06", "Juin"],
                        ["07", "Juillet"],
                        ["08", "Août"],
                        ["09", "Septembre"],
                        ["10", "Octobre"],
                        ["11", "Novembre"],
                        ["12", "Décembre"],
                      ]
                    : [
                        ["1", "1er trimestre"],
                        ["2", "2e trimestre"],
                        ["3", "3e trimestre"],
                        ["4", "4e trimestre"],
                      ]
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          )}
        </div>
      )}
      {periodError && (
        <p className={FIELD_ERROR_CLASS} role="alert">
          {periodError}
        </p>
      )}
    </>
  );
}
