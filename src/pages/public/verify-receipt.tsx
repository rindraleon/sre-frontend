import { useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, ScanLine, ShieldAlert } from "lucide-react";
import {
  Button,
  CARD_CLASS,
  CARD_HEADER_CLASS,
  FIELD_ERROR_CLASS,
  FIELD_INPUT_CLASS,
  FORM_ACTIONS_CLASS,
  FORM_STEP_CLASS,
  FormField,
  PAGE_CONTENT_CLASS,
  PAYMENT_FORM_CLASS,
  PAYMENT_FORM_GRID_CLASS,
  PAYMENT_FORM_ORDER_CLASS,
  PAYMENT_SUMMARY_STICKY_CLASS,
  PageHeader,
  SECURITY_ALERT_BANNER_CLASS,
  SUMMARY_LINES_CLASS,
  TEXT_HELP_CLASS,
  buttonVariants,
} from "@/components";
import { verifyReceiptApi } from "@/services/payments";
import { formatMoney, formatDate, cn } from "@/utils";

interface VerifiedReceipt {
  valide: boolean;
  numero?: string;
  type?: string;
  emisLe?: string;
  contribuable?: string;
  natureImpot?: string | null;
  montant?: number;
  devise?: string;
  periode?: string | null;
  statutPaiement?: string | null;
}

export function VerifyReceiptPage() {
  const [numero, setNumero] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<VerifiedReceipt | null>(null);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setResult(null);
    if (!numero.trim() || !code.trim()) {
      setError("Renseignez le numéro du reçu et son code de vérification.");
      return;
    }
    setIsChecking(true);
    try {
      setResult(await verifyReceiptApi(numero.trim(), code.trim()));
    } catch (cause) {
      console.error("Vérification du reçu impossible.", cause);
      setError("La vérification n’a pas abouti. Vérifiez le numéro et le code, puis réessayez.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div
      className={PAGE_CONTENT_CLASS}
      style={{ maxWidth: 1120, margin: "0 auto", padding: "26px 20px 48px" }}
    >
      <PageHeader
        title="Vérifier un reçu"
        description="Contrôlez l’authenticité d’un reçu émis par la plateforme à partir de son numéro et de son code de vérification."
        breadcrumb={["Accueil", "Vérifier un reçu"]}
        actions={
          <Link className={buttonVariants({ variant: "outline" })} to="/client/paiements">
            Mes paiements
          </Link>
        }
      />
      <div className={PAYMENT_FORM_GRID_CLASS}>
        <form
          className={cn(CARD_CLASS, PAYMENT_FORM_CLASS, PAYMENT_FORM_ORDER_CLASS)}
          onSubmit={submit}
          noValidate
        >
          <div className={FORM_STEP_CLASS}>
            <span>1</span>
            <div>
              <h2>Éléments du reçu</h2>
              <p>Ces informations figurent sur le reçu téléchargé ou imprimé.</p>
            </div>
          </div>
          <FormField label="Numéro de reçu" required help="Ex. SRE-REC-2026-4F1A2B3C4D5E">
            {(p) => (
              <input
                {...p}
                className={FIELD_INPUT_CLASS}
                autoComplete="off"
                placeholder="Ex. SRE-REC-2026-4F1A2B3C4D5E"
                value={numero}
                onChange={(event) => setNumero(event.target.value)}
              />
            )}
          </FormField>
          <FormField label="Code de vérification" required help="16 caractères hexadécimaux.">
            {(p) => (
              <input
                {...p}
                className={FIELD_INPUT_CLASS}
                autoComplete="off"
                placeholder="Ex. 16 caractères hexadécimaux"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            )}
          </FormField>
          {error && (
            <p className={FIELD_ERROR_CLASS} role="alert">
              {error}
            </p>
          )}
          <div className={cn(FORM_ACTIONS_CLASS)}>
            <Button type="submit" variant="primary" disabled={isChecking}>
              <ScanLine size={15} /> {isChecking ? "Vérification…" : "Vérifier le reçu"}
            </Button>
          </div>
        </form>
        <aside className={cn(CARD_CLASS, PAYMENT_SUMMARY_STICKY_CLASS)} aria-live="polite">
          <div className={CARD_HEADER_CLASS}>
            <div>
              <h2>Résultat</h2>
              <p>Réponse du serveur</p>
            </div>
            <BadgeCheck size={18} />
          </div>
          {!result ? (
            <p className={TEXT_HELP_CLASS}>
              Saisissez le numéro et le code pour afficher le statut d’authentification du reçu.
            </p>
          ) : result.valide ? (
            <dl className={SUMMARY_LINES_CLASS}>
              <div>
                <dt>Authenticité</dt>
                <dd>Reçu valide</dd>
              </div>
              <div>
                <dt>Numéro</dt>
                <dd>{result.numero}</dd>
              </div>
              <div>
                <dt>Émis le</dt>
                <dd>{formatDate(result.emisLe, true)}</dd>
              </div>
              <div>
                <dt>Contribuable</dt>
                <dd>{result.contribuable}</dd>
              </div>
              <div>
                <dt>Nature d’impôt</dt>
                <dd>{result.natureImpot ?? "—"}</dd>
              </div>
              <div>
                <dt>Période</dt>
                <dd>{result.periode ?? "—"}</dd>
              </div>
              <div>
                <dt>Montant</dt>
                <dd>{formatMoney(result.montant ?? 0, result.devise ?? "MGA")}</dd>
              </div>
              <div>
                <dt>Statut du paiement</dt>
                <dd>{result.statutPaiement ?? "—"}</dd>
              </div>
            </dl>
          ) : (
            <div className={SECURITY_ALERT_BANNER_CLASS}>
              <ShieldAlert size={16} />
              <div>
                <strong>Reçu non reconnu</strong>
                <p>
                  Aucun reçu valide ne correspond à ce numéro et à ce code. Contactez le service des
                  recettes avant tout règlement.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
