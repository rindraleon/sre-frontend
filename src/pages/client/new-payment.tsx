import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CircleDollarSign, ShieldCheck } from "lucide-react";
import {
  callApi,
  mapApiPaymentDocuments,
  mapApiPayment,
  type ApiPayment,
} from "@/services/api-client";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader, EmptyState } from "@/components/ui";
import { formatMoney } from "@/utils/format";
import {
  paymentDeclarationSchema,
  type PaymentDeclarationFormValues,
} from "@/validation/payment.schema";
import {
  MSG_SESSION_MISSING,
  PAYMENT_METHOD_MOBILE_MONEY,
  PAYMENT_METHOD_BANK_TRANSFER,
  ROUTES_CLIENT,
  DECLARABLE_OBLIGATION_STATUSES,
} from "@/constants";
import { useApiForm } from "@/hooks";
import { SubmitButton } from "@/components/forms/form-field";
import {
  PaymentDeclarationFormFields,
  DECLARATION_PAYMENT_EMPTY,
} from "@/components/forms/client/payment-declaration-form";

export function ClientNewPaymentPage() {
  const [params] = useSearchParams();
  const navigation = useNavigate();
  const { session } = useAuth();
  const { state, updateState, notify } = useSre();
  const availableObligations = useMemo(
    () =>
      state.obligations.filter(
        (obligation) =>
          obligation.taxpayerId === session?.taxpayerId &&
          (DECLARABLE_OBLIGATION_STATUSES as readonly string[]).includes(obligation.status),
      ),
    [state.obligations, session?.taxpayerId],
  );
  const form = useApiForm<PaymentDeclarationFormValues>({
    schema: paymentDeclarationSchema,
    initialValues: {
      ...DECLARATION_PAYMENT_EMPTY,
      obligationId: params.get("obligationId") ?? "",
    },
    fallbackMessage: "Le serveur n’a pas accepté la déclaration.",
  });
  const obligationId = form.watch("obligationId");
  const mode = form.watch("mode");
  const operator = form.watch("operateur");
  const obligation = availableObligations.find((entry) => entry.id === obligationId);
  let declaredChannel = "Non sélectionné";
  if (mode === PAYMENT_METHOD_MOBILE_MONEY) {
    declaredChannel = operator || "Opérateur non choisi";
  } else if (mode === PAYMENT_METHOD_BANK_TRANSFER) {
    declaredChannel = "Virement / canal bancaire";
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    form.resetError();
    if (!session?.apiToken) {
      form.setError(MSG_SESSION_MISSING);
      return;
    }
    const selectedObligation = availableObligations.find(
      (entry) => entry.id === values.obligationId,
    );
    if (!selectedObligation) {
      form.setError("obligationId", {
        type: "server",
        message: "Sélectionnez une obligation disponible pour votre compte.",
      });
      return;
    }
    try {
      const apiPayload = {
        obligationId: selectedObligation.id,
        mode: values.mode,
        ...(values.mode === PAYMENT_METHOD_MOBILE_MONEY
          ? {
              operateur: values.operateur,
              telephoneUtilise: values.telephoneUtilise.trim(),
            }
          : {
              banqueOuCanal: values.banqueOuCanal.trim(),
              ...(values.titulairePayeur.trim()
                ? { titulairePayeur: values.titulairePayeur.trim() }
                : {}),
            }),
        referenceTransaction: values.referenceTransaction.trim(),
        dateTransaction: values.dateTransaction,
      };
      const paymentApi = await callApi<ApiPayment>("paiements", {
        method: "POST",
        token: session.apiToken,
        body: apiPayload,
      });
      const mappedPayment = mapApiPayment(paymentApi);
      const mappedDocuments = mapApiPaymentDocuments(paymentApi);
      updateState((current) => ({
        ...current,
        payments: [
          mappedPayment,
          ...current.payments.filter((entry) => entry.id !== mappedPayment.id),
        ],
        paymentDocuments: [
          ...mappedDocuments,
          ...current.paymentDocuments.filter(
            (document) => document.paymentId !== mappedPayment.id,
          ),
        ],
        obligations: current.obligations.map((entry) =>
          entry.id === mappedPayment.obligationId
            ? { ...entry, status: "EN_VERIFICATION", paymentId: mappedPayment.id }
            : entry,
        ),
      }));
      notify(
        "Déclaration enregistrée par le serveur. L’accusé prouve la soumission, pas le règlement.",
        "success",
      );
      void navigation(ROUTES_CLIENT.payment(mappedPayment.id), { replace: true });
    } catch (cause) {
      form.handleFailure(cause);
    }
  });

  if (!availableObligations.length)
    return (
      <div className="page-content-sre">
        <PageHeader
          title="Déclarer un paiement"
          description="Déclarez une opération effectuée en dehors du portail."
          breadcrumb={["Accueil", "Déclarer un paiement"]}
        />
        <EmptyState
          title="Aucune obligation disponible"
          description="Aucune obligation réglable ou régularisable n’est associée à votre compte."
          action={
            <Link className="button-sre button-sre--outline" to={ROUTES_CLIENT.obligations}>
              Consulter mes obligations
            </Link>
          }
        />
        <div className="tax-note-sre">
          <span>i</span>
          <p>
            Si une déclaration est en vérification, attendez la décision avant d’en soumettre une
            autre pour la même obligation.
          </p>
        </div>
      </div>
    );

  return (
    <div className="page-content-sre">
      <PageHeader
        title="Déclarer un paiement"
        description="Renseignez les éléments d’une opération que l’administration devra examiner."
        breadcrumb={["Accueil", "Déclarer un paiement"]}
        actions={
          <Link className="button-sre button-sre--outline" to={ROUTES_CLIENT.obligations}>
            <ArrowLeft size={14} /> Mes obligations
          </Link>
        }
      />
      <div className="security-alert-banner-sre">
        <ShieldCheck size={18} />
        <div>
          <strong>Le portail ne réalise aucun paiement.</strong>
          <p>
            La référence saisie ne confirme pas le règlement. La déclaration est soumise à examen,
            sans intégration bancaire ou mobile-money.
          </p>
        </div>
      </div>
      <div className="payment-form-grid-sre">
        <form className="card-sre payment-form-sre" onSubmit={handleSubmit} noValidate>
          <PaymentDeclarationFormFields
            form={form}
            error={form.error}
            availableObligations={availableObligations}
            obligation={obligation}
          />
          <div className="form-actions-sre">
            <Link to={ROUTES_CLIENT.obligations} className="button-sre button-sre--outline">
              Annuler
            </Link>
            <SubmitButton inProgress={form.isSubmitting} pendingLabel="Enregistrement…">
              Soumettre pour vérification <ArrowRight size={15} />
            </SubmitButton>
          </div>
        </form>
        <aside className="card-sre payment-summary-sre">
          <div className="card-sre__header">
            <div>
              <h2>Récapitulatif</h2>
              <p>Avant l’envoi de la déclaration</p>
            </div>
            <CircleDollarSign size={18} />
          </div>
          {obligation ? (
            <>
              <dl className="details-list-sre">
                <div>
                  <dt>Impôt</dt>
                  <dd>{obligation.taxTypeName}</dd>
                </div>
                <div>
                  <dt>Période</dt>
                  <dd>{obligation.period}</dd>
                </div>
                <div>
                  <dt>Montant</dt>
                  <dd>{formatMoney(obligation.amount)}</dd>
                </div>
                <div>
                  <dt>Canal déclaré</dt>
                  <dd>{declaredChannel}</dd>
                </div>
              </dl>
              <div className="payment-total-sre">
                <span>Montant transmis pour examen</span>
                <strong>{formatMoney(obligation.amount)}</strong>
              </div>
            </>
          ) : (
            <p className="text-help-sre">
              Sélectionnez une obligation pour afficher le récapitulatif.
            </p>
          )}
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
              La déclaration débute au statut « En vérification »; elle n’est pas marquée réglée
              automatiquement.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
