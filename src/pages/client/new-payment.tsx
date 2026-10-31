import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDollarSign,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader, EmptyState } from "@/components/ui";
import { formatDate, formatMoney } from "@/utils/format";
import { formatFiscalPeriod } from "@/utils/montant-en-lettres";
import { paymentDeclarationSchema, validateFiscalPeriod, type PaymentDeclarationFormValues } from "@/validation/payment.schema";
import { MSG_SESSION_MISSING, PAYMENT_METHOD_MOBILE_MONEY, ROUTES_CLIENT } from "@/constants";
import { useApiForm } from "@/hooks";
import { SubmitButton } from "@/components/forms/form-field";
import { FormError } from "@/components/forms/form-field";
import {
  DECLARATION_PAYMENT_EMPTY,
  currentLocalDate,
  PAYMENT_STEPS,
  PaymentAmountStep,
  PaymentChannelStep,
  PaymentNatureStep,
  PaymentReferenceStep,
  selectApplicableTaxTypes,
  type PaymentStepId,
} from "@/components/forms/client/payment-declaration-form";
import { createAutonomousPaymentApi } from "@/services/api-payments";
import { PAYMENT_STATUS_LABELS } from "@/constants/payment-statuses";

function newIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? `idem-${Date.now()}-${Math.random()}`;
}

export function ClientNewPaymentPage() {
  const navigation = useNavigate();
  const { session } = useAuth();
  const { state, updateState, notify } = useSre();
  const taxpayer = state.taxpayers.find((entry) => entry.id === session?.taxpayerId);
  const taxTypes = useMemo(
    () => selectApplicableTaxTypes(state.taxTypes, taxpayer),
    [state.taxTypes, taxpayer],
  );
  const [step, setStep] = useState<PaymentStepId>("nature");
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey);

  const form = useApiForm<PaymentDeclarationFormValues>({
    schema: paymentDeclarationSchema,
    initialValues: DECLARATION_PAYMENT_EMPTY,
    fallbackMessage: "Le serveur n’a pas accepté la déclaration.",
  });

  const values = form.watch();
  const selectedTaxType = taxTypes.find((entry) => entry.id === values.typeImpotId);
  const stepIndex = PAYMENT_STEPS.findIndex((entry) => entry.id === step);
  const periodError = selectedTaxType
    ? validateFiscalPeriod(selectedTaxType.periodicity, values.periode ?? "")
    : null;

  const payerLabel =
    taxpayer?.legalName ||
    [taxpayer?.firstName, taxpayer?.lastName].filter(Boolean).join(" ") ||
    "Contribuable";

  const goToStep = useCallback(
    async (target: PaymentStepId) => {
      const targetIndex = PAYMENT_STEPS.findIndex((entry) => entry.id === target);
      if (targetIndex <= stepIndex) {
        setStep(target);
        return;
      }
      const fieldsByStep: Record<PaymentStepId, Array<keyof PaymentDeclarationFormValues>> = {
        nature: ["typeImpotId"],
        montant: ["montant", "periode"],
        reglement: ["mode", "operateur", "telephoneUtilise", "banqueOuCanal"],
        reference: ["referenceTransaction", "dateTransaction"],
      };
      const current = PAYMENT_STEPS[stepIndex]?.id;
      if (!current) return;
      const valid = await form.trigger(fieldsByStep[current], { shouldFocus: true });
      if (!valid) return;
      if (current === "montant" && periodError) {
        form.setError("periode", { type: "manual", message: periodError });
        return;
      }
      setStep(target);
    },
    [form, periodError, stepIndex],
  );

  const handleSubmit = form.handleSubmit(async (formValues) => {
    form.resetError();
    if (!session?.apiToken) {
      form.setError(MSG_SESSION_MISSING);
      return;
    }
    const deadline = selectedTaxType
      ? validateFiscalPeriod(selectedTaxType.periodicity, formValues.periode)
      : null;
    if (deadline) {
      form.setError("periode", { type: "manual", message: deadline });
      setStep("montant");
      return;
    }
    try {
      const payment = await createAutonomousPaymentApi(session.apiToken, {
        typeImpotId: formValues.typeImpotId,
        montant: Number(formValues.montant.replaceAll(" ", "")),
        ...(formValues.periode.trim() ? { periode: formValues.periode.trim() } : {}),
        mode: formValues.mode,
        ...(formValues.mode === PAYMENT_METHOD_MOBILE_MONEY
          ? {
              operateur: formValues.operateur,
              telephoneUtilise: formValues.telephoneUtilise.trim(),
            }
          : {
              banqueOuCanal: formValues.banqueOuCanal.trim(),
            }),
        referenceTransaction: formValues.referenceTransaction.trim(),
        dateTransaction: currentLocalDate(),
        cleIdempotence: idempotencyKey,
      });
      updateState((current) => ({
        ...current,
        payments: [payment, ...current.payments.filter((entry) => entry.id !== payment.id)],
      }));
      const receiptLabel = payment.receipt?.number
        ? ` Reçu officiel ${payment.receipt.number} émis.`
        : "";
      notify(
        `Déclaration validée automatiquement · statut « ${PAYMENT_STATUS_LABELS[payment.status] ?? payment.status} ».${receiptLabel}`,
        "success",
      );
      setIdempotencyKey(newIdempotencyKey());
      void navigation(ROUTES_CLIENT.payment(payment.id), { replace: true });
    } catch (cause) {
      form.handleFailure(cause);
    }
  });

  if (!taxTypes.length)
    return (
      <div className="page-content-sre">
        <PageHeader
          title="Déclarer un paiement"
          description="Paiement autonome : vous choisissez la nature d’impôt et le montant."
          breadcrumb={["Accueil", "Déclarer un paiement"]}
        />
        <EmptyState
          title="Aucune nature d’impôt disponible"
          description="L’administration n’a publié aucune nature d’impôt applicable à votre profil. Contactez le service des impôts pour la suite."
          action={
            <Link className="button-sre button-sre--outline" to={ROUTES_CLIENT.payments}>
              Retour à l’historique
            </Link>
          }
        />
      </div>
    );

  const stepProps = { form, taxTypes, selectedTaxType, payerLabel };
  const canSubmit = step === "reference" && !form.isSubmitting;
  const channelLabel =
    values.mode === PAYMENT_METHOD_MOBILE_MONEY
      ? values.operateur ?? "Mobile Money"
      : values.mode
        ? "Virement / dépôt bancaire"
        : null;

  return (
    <div className="page-content-sre">
      <PageHeader
        title="Déclarer un paiement"
        description="Paiement autonome : nature d’impôt, montant et période saisis par vos soins."
        breadcrumb={["Accueil", "Déclarer un paiement"]}
        actions={
          <Link className="button-sre button-sre--outline" to={ROUTES_CLIENT.payments}>
            <ArrowLeft size={14} /> Mes paiements
          </Link>
        }
      />
      <div className="security-alert-banner-sre">
        <ShieldCheck size={18} />
        <div>
          <strong>Aucune obligation préalable n’est exigée.</strong>
          <p>
            Le portail n’effectue aucun prélèvement : vous déclarez une opération déjà réalisée. Le
            reçu définitif est généré automatiquement dès que le paiement est confirmé.
          </p>
        </div>
      </div>
      <div className="payment-form-grid-sre">
        <form className="card-sre payment-form-sre" onSubmit={handleSubmit} noValidate>
          <nav className="payment-steps-sre" aria-label="Étapes de la déclaration">
            {PAYMENT_STEPS.map((entry, index) => (
              <button
                key={entry.id}
                type="button"
                aria-current={entry.id === step ? "step" : undefined}
                className={index < stepIndex ? "is-done" : undefined}
                onClick={() => void goToStep(entry.id)}
              >
                <span data-step-index>{index < stepIndex ? <Check size={11} /> : index + 1}</span>
                <strong>{entry.label}</strong>
              </button>
            ))}
          </nav>
          {step === "nature" && <PaymentNatureStep {...stepProps} />}
          {step === "montant" && <PaymentAmountStep {...stepProps} />}
          {step === "reglement" && <PaymentChannelStep {...stepProps} />}
          {step === "reference" && <PaymentReferenceStep {...stepProps} />}
          <FormError message={form.error} />
          <div className="form-actions-sre">
            {stepIndex === 0 ? (
              <Link to={ROUTES_CLIENT.payments} className="button-sre button-sre--outline">
                Annuler
              </Link>
            ) : (
              <button
                type="button"
                className="button-sre button-sre--outline"
                onClick={() => setStep(PAYMENT_STEPS[stepIndex - 1].id)}
              >
                <ArrowLeft size={14} /> Précédent
              </button>
            )}
            {step !== "reference" ? (
              <button
                type="button"
                className="button-sre button-sre--primary"
                onClick={() => void goToStep(PAYMENT_STEPS[stepIndex + 1].id)}
              >
                Continuer <ArrowRight size={15} />
              </button>
            ) : (
              <SubmitButton inProgress={form.isSubmitting} pendingLabel="Enregistrement…">
                {form.isSubmitting ? <Loader2 size={15} /> : <Check size={15} />} Confirmer et
                soumettre
              </SubmitButton>
            )}
          </div>
          {!canSubmit && step === "reference" && (
            <p className="text-help-sre">
              La déclaration sera enregistrée au statut « En attente » puis suivie jusqu’à
              confirmation.
            </p>
          )}
        </form>
        <aside className="card-sre payment-summary-sre is-sticky" aria-live="polite">
          <div className="card-sre__header">
            <div>
              <h2>Récapitulatif</h2>
              <p>Vérifiez avant de soumettre</p>
            </div>
            <CircleDollarSign size={18} />
          </div>
          <dl className="summary-lines-sre">
            <div>
              <dt>Contribuable</dt>
              <dd>{payerLabel}</dd>
            </div>
            <div>
              <dt>Nature d’impôt</dt>
              <dd>{selectedTaxType?.name ?? "Non choisie"}</dd>
            </div>
            <div>
              <dt>Période fiscale</dt>
              <dd>
                {(values.periode?.trim() && formatFiscalPeriod(values.periode)) ||
                  (selectedTaxType?.periodicity === "PONCTUELLE" ? "Opération ponctuelle" : "—")}
              </dd>
            </div>
            <div className={values.montant ? "" : "summary-empty"}>
              <dt>Montant déclaré</dt>
              <dd>{values.montant ? formatMoney(Number(values.montant.replaceAll(" ", ""))) : "—"}</dd>
            </div>
            <div>
              <dt>Canal</dt>
              <dd>{channelLabel ?? "—"}</dd>
            </div>
            <div>
              <dt>Référence</dt>
              <dd>{values.referenceTransaction?.trim() || "—"}</dd>
            </div>
            <div>
              <dt>Date de l’opération</dt>
              <dd>{values.dateTransaction ? formatDate(values.dateTransaction) : "—"}</dd>
            </div>
          </dl>
          <div className="payment-total-sre">
            <span>Total déclaré</span>
            <strong>
              {values.montant ? formatMoney(Number(values.montant.replaceAll(" ", ""))) : "0 MGA"}
            </strong>
          </div>
          <div className="security-note-sre">
            <ShieldCheck size={16} />
            <p>
              <strong>Rappel sécurité</strong>
              <span>
                Ne saisissez jamais votre code PIN, mot de passe bancaire ou code à usage unique.
              </span>
            </p>
          </div>
          <div className="tax-note-sre">
            <span>i</span>
            <p>
              Statut initial « {PAYMENT_STATUS_LABELS.EN_ATTENTE} » : aucun reçu définitif n’est
              affiché avant la confirmation réelle du paiement.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
