import { useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, ScanLine, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { FormField } from "@/components/forms/form-field";
import { verifyReceiptApi } from "@/services/api-payments";
import { formatMoney, formatDate } from "@/utils/format";

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

/** Vérification publique d'un reçu : numéro + code d'authentification. */
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
    } catch {
      setError("La vérification n’a pas abouti. Vérifiez le numéro et le code, puis réessayez.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div
      className="page-content-sre"
      style={{ maxWidth: 1120, margin: "0 auto", padding: "26px 20px 48px" }}
    >
      <PageHeader
        title="Vérifier un reçu"
        description="Contrôlez l’authenticité d’un reçu émis par la plateforme à partir de son numéro et de son code de vérification."
        breadcrumb={["Accueil", "Vérifier un reçu"]}
        actions={
          <Link className="button-sre button-sre--outline" to="/client/paiements">
            Mes paiements
          </Link>
        }
      />
      <div className="payment-form-grid-sre">
        <form className="card-sre payment-form-sre" onSubmit={submit} noValidate>
          <div className="form-step-sre">
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
                className="field-simple-sre"
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
                className="field-simple-sre"
                autoComplete="off"
                placeholder="Ex. 16 caractères hexadécimaux"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            )}
          </FormField>
          {error && (
            <p className="field-error-sre" role="alert">
              {error}
            </p>
          )}
          <div className="form-actions-sre">
            <button type="submit" className="button-sre button-sre--primary" disabled={isChecking}>
              <ScanLine size={15} /> {isChecking ? "Vérification…" : "Vérifier le reçu"}
            </button>
          </div>
        </form>
        <aside className="card-sre payment-summary-sre" aria-live="polite">
          <div className="card-sre__header">
            <div>
              <h2>Résultat</h2>
              <p>Réponse du serveur</p>
            </div>
            <BadgeCheck size={18} />
          </div>
          {!result ? (
            <p className="text-help-sre">
              Saisissez le numéro et le code pour afficher le statut d’authentification du reçu.
            </p>
          ) : result.valide ? (
            <dl className="summary-lines-sre">
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
            <div className="security-alert-banner-sre">
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
