import { CircleAlert, MailCheck, ShieldCheck } from "lucide-react";
import {
  Button,
  CARD_CLASS,
  CARD_HEADER_CLASS,
  IMPORT_ANALYSIS_SUMMARY_CLASS,
  IMPORT_ERROR_DETAILS_CLASS,
  IMPORT_REPORT_CLASS,
  SECURITY_NOTE_CLASS,
  StatusBadge,
  badgeClass,
  importSummaryToneClass,
} from "@/components";
import type { ImportHistoryEntry } from "@/types";
import { formatDate, cn } from "@/utils";
import type { ActivationEmailResult } from "@/hooks";

export function ImportReportPanel({
  report,
  emails,
  resendInProgress,
  onResendEmail,
}: Readonly<{
  report: ImportHistoryEntry;
  emails: readonly ActivationEmailResult[];
  resendInProgress: string | null;
  onResendEmail: (requestId: string, recipient: string) => void;
}>) {
  const sentCount = emails.filter((email) => email.statutCourriel === "ENVOYEE").length;
  const failedCount = emails.filter((email) => email.statutCourriel === "ECHEC").length;

  return (
    <section className={cn(CARD_CLASS, IMPORT_REPORT_CLASS)}>
      <div className={CARD_HEADER_CLASS}>
        <div>
          <h2>Rapport de l’import</h2>
          <p>
            {report.fileName} · {formatDate(report.date, true)}
          </p>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <div className={IMPORT_ANALYSIS_SUMMARY_CLASS}>
        <div className={importSummaryToneClass("valid")}>
          <strong>{report.created}</strong>
          <span>Profils créés</span>
        </div>
        <div>
          <strong>{report.analyzed}</strong>
          <span>Lignes analysées</span>
        </div>
        <div className={importSummaryToneClass("duplicate")}>
          <strong>{report.duplicates}</strong>
          <span>Doublons détectés</span>
        </div>
        <div className={importSummaryToneClass("error")}>
          <strong>{report.ignored}</strong>
          <span>Lignes ignorées</span>
        </div>
      </div>

      {report.errors.length > 0 && (
        <details className={IMPORT_ERROR_DETAILS_CLASS}>
          <summary>
            <CircleAlert size={15} /> Afficher les erreurs et doublons ({report.errors.length})
          </summary>
          <ul>
            {report.errors.slice(0, 100).map((row, index) => {
              const rowPrefix = row.row > 0 ? `Ligne ${row.row}` : "";
              const field = row.row > 0 && row.field ? ` · ${row.field}` : "";
              const separator = row.row > 0 ? " — " : "";
              return (
                <li key={`${row.row}-${index}`}>
                  {rowPrefix}
                  {field}
                  {separator}
                  {row.message}
                </li>
              );
            })}
          </ul>
        </details>
      )}

      <div className={SECURITY_NOTE_CLASS}>
        <ShieldCheck size={16} />
        <p>
          <strong>Import terminé par le serveur.</strong>
          <span>
            Les comptes entreprise créés doivent terminer leur configuration initiale (nouveau mot
            de passe + profil) avant d’accéder aux fonctionnalités ; le mot de passe provisoire est
            invalidé à cette étape.
          </span>
        </p>
      </div>

      {emails.length > 0 && (
        <div className="">
          <strong>
            <MailCheck size={15} aria-hidden="true" /> E-mails de première connexion ({sentCount}{" "}
            envoyé(s), {failedCount} en échec)
          </strong>
          <ul>
            {emails.map((email) => (
              <li key={email.compteId}>
                <span>{email.destinataire}</span>
                <span
                  className={badgeClass(
                    email.statutCourriel === "ENVOYEE"
                      ? "success"
                      : email.statutCourriel === "ECHEC"
                        ? "error"
                        : "attention",
                  )}
                >
                  {email.statutCourriel === "ENVOYEE"
                    ? "Envoyé"
                    : email.statutCourriel === "ECHEC"
                      ? "Échec"
                      : "En attente"}
                </span>
                {email.statutCourriel === "ECHEC" && email.demandeId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="small"
                    disabled={resendInProgress === email.demandeId}
                    onClick={() => onResendEmail(email.demandeId as string, email.destinataire)}
                  >
                    {resendInProgress === email.demandeId ? "Envoi…" : "Renvoyer"}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
