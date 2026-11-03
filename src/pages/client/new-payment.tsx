import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, CircleDollarSign, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts";
import { useSre } from "@/contexts";
import {
  Button,
  CARD_CLASS,
  CARD_HEADER_CLASS,
  EmptyState,
  FORM_ACTIONS_CLASS,
  FormError,
  PAGE_CONTENT_CLASS,
  PAYMENT_FORM_CLASS,
  PAYMENT_FORM_GRID_CLASS,
  PAYMENT_FORM_ORDER_CLASS,
  PAYMENT_STEPS_CLASS,
  PAYMENT_STEP_ACTIVE_CLASS,
  PAYMENT_SUMMARY_STICKY_CLASS,
  PAYMENT_TOTAL_CLASS,
  PageHeader,
  SECURITY_ALERT_BANNER_CLASS,
  SECURITY_NOTE_CLASS,
  SUMMARY_EMPTY_VALUE_CLASS,
  SUMMARY_LINES_CLASS,
  SubmitButton,
  TAX_NOTE_CLASS,
  TEXT_HELP_CLASS,
  buttonVariants,
} from "@/components";
import { formatDate, formatMoney, formatFiscalPeriod, cn } from "@/utils";
import {
  DECLARATION_PAYMENT_EMPTY,
  currentLocalDate,
  PAYMENT_STEPS,
  selectApplicableTaxTypes,
  type PaymentStepId,
} from "@/components/PaymentsComponents/declaration";
import { PaymentAmountStep } from "@/components/PaymentsComponents/declaration";
import { PaymentChannelStep } from "@/components/PaymentsComponents/declaration";
import { PaymentNatureStep } from "@/components/PaymentsComponents/declaration";
import { PaymentReferenceStep } from "@/components/PaymentsComponents/declaration";
import { PAYMENT_STATUS_LABELS } from "@/data";
import {
  paymentDeclarationSchema,
  validateFiscalPeriod,
  type PaymentDeclarationFormValues,
} from "@/schemas";
import { createAutonomousPaymentApi } from "@/services/payments";
import { MSG_SESSION_MISSING, PAYMENT_METHOD_MOBILE_MONEY, ROUTES_CLIENT } from "@/data";
import { useApiForm } from "@/hooks";

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
      <div className={PAGE_CONTENT_CLASS}>
        <PageHeader
          title="Déclarer un paiement"
          description="Paiement autonome : vous choisissez la nature d’impôt et le montant."
          breadcrumb={["Accueil", "Déclarer un paiement"]}
        />
        <EmptyState
          title="Aucune nature d’impôt disponible"
          description="L’administration n’a publié aucune nature d’impôt applicable à votre profil. Contactez le service des impôts pour la suite."
          action={
            <Link className={buttonVariants({ variant: "outline" })} to={ROUTES_CLIENT.payments}>
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
      ? (values.operateur ?? "Mobile Money")
      : values.mode
        ? "Virement / dépôt bancaire"
        : null;

  return (
    <div className={PAGE_CONTENT_CLASS}>
      <PageHeader
        title="Déclarer un paiement"
        description="Paiement autonome : nature d’impôt, montant et période saisis par vos soins."
        breadcrumb={["Accueil", "Déclarer un paiement"]}
        actions={
          <Link className={buttonVariants({ variant: "outline" })} to={ROUTES_CLIENT.payments}>
            <ArrowLeft size={14} /> Mes paiements
          </Link>
        }
      />
      <div className={SECURITY_ALERT_BANNER_CLASS}>
        <ShieldCheck size={18} />
        <div>
          <strong>Aucune obligation préalable n’est exigée.</strong>
          <p>
            Le portail n’effectue aucun prélèvement : vous déclarez une opération déjà réalisée. Le
            reçu définitif est généré automatiquement dès que le paiement est confirmé.
          </p>
        </div>
      </div>
      <div className={PAYMENT_FORM_GRID_CLASS}>
        <form
          className={cn(CARD_CLASS, PAYMENT_FORM_CLASS, PAYMENT_FORM_ORDER_CLASS)}
          onSubmit={handleSubmit}
          noValidate
        >
          <nav className={PAYMENT_STEPS_CLASS} aria-label="Étapes de la déclaration">
            {PAYMENT_STEPS.map((entry, index) => (
              <button
                key={entry.id}
                type="button"
                aria-current={entry.id === step ? "step" : undefined}
                className={index <= stepIndex ? PAYMENT_STEP_ACTIVE_CLASS : undefined}
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
          <div className={cn(FORM_ACTIONS_CLASS)}>
            {stepIndex === 0 ? (
              <Link to={ROUTES_CLIENT.payments} className={buttonVariants({ variant: "outline" })}>
                Annuler
              </Link>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(PAYMENT_STEPS[stepIndex - 1].id)}
              >
                <ArrowLeft size={14} /> Précédent
              </Button>
            )}
            {step !== "reference" ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => void goToStep(PAYMENT_STEPS[stepIndex + 1].id)}
              >
                Continuer <ArrowRight size={15} />
              </Button>
            ) : (
              <SubmitButton inProgress={form.isSubmitting} pendingLabel="Enregistrement…">
                {form.isSubmitting ? <Loader2 size={15} /> : <Check size={15} />} Confirmer et
                soumettre
              </SubmitButton>
            )}
          </div>
          {!canSubmit && step === "reference" && (
            <p className={TEXT_HELP_CLASS}>
              La déclaration sera enregistrée au statut « En attente » puis suivie jusqu’à
              confirmation.
            </p>
          )}
        </form>
        <aside className={cn(CARD_CLASS, PAYMENT_SUMMARY_STICKY_CLASS)} aria-live="polite">
          <div className={CARD_HEADER_CLASS}>
            <div>
              <h2>Récapitulatif</h2>
              <p>Vérifiez avant de soumettre</p>
            </div>
            <CircleDollarSign size={18} />
          </div>
          <dl className={SUMMARY_LINES_CLASS}>
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
            <div>
              <dt>Montant déclaré</dt>
              <dd className={values.montant ? undefined : SUMMARY_EMPTY_VALUE_CLASS}>
                {values.montant ? formatMoney(Number(values.montant.replaceAll(" ", ""))) : "—"}
              </dd>
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
          <div className={PAYMENT_TOTAL_CLASS}>
            <span>Total déclaré</span>
            <strong>
              {values.montant ? formatMoney(Number(values.montant.replaceAll(" ", ""))) : "0 MGA"}
            </strong>
          </div>
          <div className={SECURITY_NOTE_CLASS}>
            <ShieldCheck size={16} />
            <p>
              <strong>Rappel sécurité</strong>
              <span>
                Ne saisissez jamais votre code PIN, mot de passe bancaire ou code à usage unique.
              </span>
            </p>
          </div>
          <div className={TAX_NOTE_CLASS}>
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
