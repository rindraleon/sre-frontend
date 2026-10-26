import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { formatStatus } from "@/utils/format";

/** shadcn/ui badge: dot + label, tinted by status category. */
const TONES = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  attention: "border-amber-200 bg-amber-50 text-amber-700",
  warning: "border-orange-200 bg-orange-50 text-orange-700",
  error: "border-red-200 bg-red-50 text-red-700",
  blue: "border-sky-200 bg-sky-50 text-sky-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  neutral: "border-border bg-muted text-muted-foreground",
} as const;

// Cautious business labels (an internal decision is not a bank confirmation).
const BADGE_LABELS: Record<string, string> = {
  A_PAYER: "À payer",
  PAIEMENT_EN_COURS: "Paiement en cours",
  EN_VERIFICATION: "En vérification",
  PAYE: "Décision validée en interne",
  CONFIRME: "Confirmé en interne",
  REJETE: "Rejeté",
  CORRECTION_DEMANDEE: "Correction demandée",
  EN_RETARD: "En retard",
  ACTIF: "Actif",
  INACTIF: "Inactif",
  EN_ATTENTE: "En attente",
  SUSPENDU: "Suspendu",
  TERMINE: "Terminé",
  PARTIEL: "Partiel",
  ERREUR: "Erreur",
  ENTREPRISE: "Entreprise",
  PARTICULIER: "Particulier",
  ADMIN: "Administrateur",
  CLIENT: "Contribuable",
  MOBILE_MONEY: "Mobile Money",
  VIREMENT_BANCAIRE: "Virement bancaire",
  SUCCES: "Succès",
  ECHEC: "Échec",
  SYSTEME: "Système",
  LUE: "Lu",
  LU: "Lu",
  NON_LU: "Non lu",
  EN_ATTENTE_REPONSE: "En attente de réponse",
  REPONDU: "Répondu",
  ENVOYE: "Envoyé",
  NON_CONFIGURE: "Non configuré",
};

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-bold [&>i]:h-1.5 [&>i]:w-1.5 [&>i]:rounded-full [&>i]:bg-current",
  { variants: { tone: TONES }, defaultVariants: { tone: "neutral" } },
);

const TONE_BY_STATUS: Record<string, keyof typeof TONES> = {
  A_PAYER: "neutral",
  PAIEMENT_EN_COURS: "attention",
  EN_VERIFICATION: "attention",
  PAYE: "success",
  CONFIRME: "success",
  ACTIF: "success",
  ACTIF_ADMIN: "success",
  REJETE: "error",
  CORRECTION_DEMANDEE: "warning",
  EN_RETARD: "error",
  INACTIF: "neutral",
  EN_ATTENTE: "attention",
  SUSPENDU: "error",
  TERMINE: "success",
  PARTIEL: "warning",
  ERREUR: "error",
  ENTREPRISE: "blue",
  PARTICULIER: "violet",
  ADMIN: "violet",
  CLIENT: "blue",
  SUCCES: "success",
  ECHEC: "error",
  LUE: "success",
  LU: "blue",
  NON_LU: "attention",
  EN_ATTENTE_REPONSE: "warning",
  REPONDU: "success",
  ENVOYE: "success",
  NON_CONFIGURE: "neutral",
};

export function StatusBadge({ status }: Readonly<{ status: string }>) {
  return (
    <span className={cn(badgeVariants({ tone: TONE_BY_STATUS[status] ?? "neutral" }))}>
      <i aria-hidden="true" />
      {BADGE_LABELS[status] ?? formatStatus(status)}
    </span>
  );
}
