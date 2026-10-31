import { useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Check, CreditCard, FileCheck2, ReceiptText, Search, WalletCards } from "lucide-react";
import type { TaxType, Taxpayer } from "@/types";
import {
  OPERATORS_MOBILE_MONEY,
  PAYMENT_METHOD_BANK_TRANSFER,
  PAYMENT_METHOD_MOBILE_MONEY,
} from "@/constants";
import { Select } from "@/components/ui/select";
import { OptionsSelect } from "@/components/forms/options-select";
import { FormField } from "@/components/forms/form-field";
import { formatMoney } from "@/utils/format";
import {
  formatAmountInput,
  MONTANT_MINIMUM,
  validateFiscalPeriod,
  type PaymentDeclarationFormValues,
} from "@/validation/payment.schema";

/** Étapes du parcours de déclaration autonome. */
export const PAYMENT_STEPS = [
  { id: "nature", label: "Nature d’impôt" },
  { id: "montant", label: "Montant / période" },
  { id: "reglement", label: "Règlement" },
  { id: "reference", label: "Référence" },
] as const;
export type PaymentStepId = (typeof PAYMENT_STEPS)[number]["id"];

/** Valeurs initiales du formulaire (aucune obligation fiscale requise). */
export const DECLARATION_PAYMENT_EMPTY: PaymentDeclarationFormValues = {
  typeImpotId: "",
  montant: "",
  periode: "",
  mode: undefined as unknown as PaymentDeclarationFormValues["mode"],
  operateur: undefined,
  telephoneUtilise: "",
  banqueOuCanal: "",
  referenceTransaction: "",
  dateTransaction: currentLocalDate(),
};

export function currentLocalDate(): string {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const PERIODICITY_LABELS: Record<string, string> = {
  MENSUELLE: "Mensuelle",
  TRIMESTRIELLE: "Trimestrielle",
  ANNUELLE: "Annuelle",
  PONCTUELLE: "Ponctuelle",
};

/** Natures d'impôt proposées : actives et applicables au type de contribuable. */
export function selectApplicableTaxTypes(taxTypes: TaxType[], taxpayer?: Taxpayer): TaxType[] {
  return taxTypes
    .filter((taxType) => taxType.isActive)
    .filter(
      (taxType) =>
        !taxpayer ||
        taxType.applicableTaxpayers === "TOUS" ||
        taxType.applicableTaxpayers === taxpayer.type,
    )
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

interface StepProps {
  form: UseFormReturn<PaymentDeclarationFormValues>;
  taxTypes: TaxType[];
  selectedTaxType?: TaxType;
  payerLabel: string;
}

/** Étape 1 — choix de la nature d'impôt parmi les natures publiées. */
export function PaymentNatureStep({ form, taxTypes, selectedTaxType }: Readonly<StepProps>) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = form;
  const typeImpotId = watch("typeImpotId");
  const [search, setSearch] = useState("");
  const filteredTaxTypes = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fr");
    if (!term) return taxTypes;
    return taxTypes.filter((taxType) =>
      [taxType.name, taxType.description, taxType.code]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase("fr").includes(term)),
    );
  }, [search, taxTypes]);
  const groupedTaxTypes = useMemo(
    () =>
      Object.entries(PERIODICITY_LABELS)
        .map(([periodicity, label]) => ({
          periodicity,
          label,
          taxTypes: filteredTaxTypes.filter((taxType) => taxType.periodicity === periodicity),
        }))
        .filter((group) => group.taxTypes.length > 0),
    [filteredTaxTypes],
  );

  return (
    <>
      <p className="text-help-sre">
        Seules les natures publiées par l’administration et applicables à votre profil sont
        proposées.
      </p>
      <label className="tax-type-search-sre">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher une nature d’impôt"
          aria-label="Rechercher une nature d’impôt"
        />
      </label>
      <div className="tax-type-groups-sre" role="group" aria-label="Natures d’impôt disponibles">
        {groupedTaxTypes.map((group) => (
          <section className="tax-type-group-sre" key={group.periodicity}>
            <div className="tax-type-group-sre__head">
              <h3>{group.label}</h3>
              <span>
                {group.taxTypes.length} nature{group.taxTypes.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="tax-type-grid-sre">
              {group.taxTypes.map((taxType) => (
                <button
                  key={taxType.id}
                  type="button"
                  aria-pressed={typeImpotId === taxType.id}
                  className="tax-type-card-sre"
                  onClick={() => {
                    setValue("typeImpotId", taxType.id, { shouldValidate: true });
                    setValue(
                      "periode",
                      taxType.periodicity === "PONCTUELLE"
                        ? ""
                        : currentFiscalPeriod(taxType.periodicity),
                      { shouldValidate: true },
                    );
                  }}
                >
                  <strong>{taxType.name}</strong>
                  {taxType.description && <small>{taxType.description}</small>}
                  <span className="tax-type-meta-sre">
                    <span>{group.label}</span>
                    {taxType.referenceAmount != null && (
                      <span>Réf. {formatMoney(taxType.referenceAmount)}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
        {groupedTaxTypes.length === 0 && (
          <p className="tax-type-empty-sre">
            Aucune nature d’impôt ne correspond à cette recherche.
          </p>
        )}
      </div>
      {errors.typeImpotId && (
        <p className="field-error-sre" role="alert">
          {errors.typeImpotId.message}
        </p>
      )}
      {selectedTaxType?.amountMode === "FIXE" && selectedTaxType.referenceAmount != null && (
        <div className="tax-note-sre">
          <span>i</span>
          <p>
            Montant de référence pour cet impôt :{" "}
            <strong>{formatMoney(selectedTaxType.referenceAmount)}</strong>. Vous pouvez l’ajuster
            si votre situation le justifie.
          </p>
        </div>
      )}
    </>
  );
}

function currentFiscalPeriod(periodicity: string): string {
  const now = new Date();
  const year = now.getFullYear();
  if (periodicity === "MENSUELLE") return `${year}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  if (periodicity === "TRIMESTRIELLE") return `${year}-T${Math.floor(now.getMonth() / 3) + 1}`;
  if (periodicity === "ANNUELLE") return String(year);
  return "";
}

/** Étape 2 — montant saisi par l'utilisateur et période fiscale. */
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
          <span className="amount-input-sre">
            <input
              {...p}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              aria-label="Montant à payer en ariary"
              value={montant ? formatAmountInput(montant) : ""}
              onChange={(event) => {
                // Seuls les chiffres sont conservés : le montant reste un entier d'ariary.
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
        <div className="amount-presets-sre">
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
        <div className="fiscal-period-picker-sre">
          <FormField
            label="Année fiscale"
            error={errors.periode}
            help="Choisissez la période dans les listes."
            required
          >
            {(p) => (
              <Select
                {...p}
                className="field-simple-sre"
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
                  className="field-simple-sre"
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
        <p className="field-error-sre" role="alert">
          {periodError}
        </p>
      )}
    </>
  );
}

/** Étape 3 — canal de règlement réellement utilisé. */
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
            <small>MVola, Orange Money, Airtel Money</small>
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
          <CreditCard size={18} />
          <span>
            <strong>Virement / dépôt bancaire</strong>
            <small>Guichet ou virement interbancaire</small>
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
          <FormField label="Opérateur utilisé" error={errors.operateur} required>
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
          <FormField label="Établissement / canal" error={errors.banqueOuCanal} required>
            {(p) => (
              <input
                {...p}
                className="field-simple-sre"
                autoComplete="organization"
                placeholder="Ex. Banque ou agence"
                {...register("banqueOuCanal")}
              />
            )}
          </FormField>
        </div>
      ) : (
        <p className="text-help-sre">Choisissez le canal utilisé pour poursuivre.</p>
      )}
    </>
  );
}

/** Étape 4 — référence de la transaction et pièce éventuelle. */
export function PaymentReferenceStep({ form, payerLabel }: Readonly<StepProps>) {
  const {
    register,
    formState: { errors },
  } = form;
  return (
    <>
      <div className="form-grid-sre">
        <FormField
          label="Référence de l’opération"
          error={errors.referenceTransaction}
          help="Identifiant du transfert, du dépôt ou du message mobile money."
          required
        >
          {(p) => (
            <input
              {...p}
              className="field-simple-sre"
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
              className="field-simple-sre"
              type="date"
              max={currentLocalDate()}
              readOnly
              aria-readonly="true"
              {...register("dateTransaction")}
            />
          )}
        </FormField>
      </div>
      <div className="tax-note-sre">
        <FileCheck2 size={15} />
        <p>
          Payeur déclaré : <strong>{payerLabel}</strong>. Le reçu officiel est émis automatiquement
          dès la soumission ; une référence saisie ne prouve pas à elle seule le règlement.
        </p>
      </div>
      <p className="text-help-sre">
        <ReceiptText size={13} aria-hidden="true" /> Votre reçu est disponible immédiatement après
        la soumission, dans « Historique des paiements ».
      </p>
    </>
  );
}
