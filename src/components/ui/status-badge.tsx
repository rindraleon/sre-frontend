import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { formatStatus } from "@/utils/format";

/** Badge shadcn/ui : pastille + libellé, teinte selon la catégorie de statut. */
const TONS = {
  succes: "border-emerald-200 bg-emerald-50 text-emerald-700",
  attention: "border-amber-200 bg-amber-50 text-amber-700",
  avertissement: "border-orange-200 bg-orange-50 text-orange-700",
  erreur: "border-red-200 bg-red-50 text-red-700",
  bleu: "border-sky-200 bg-sky-50 text-sky-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  neutre: "border-border bg-muted text-muted-foreground",
} as const;

// Libellés métier prudents (une décision interne n'est pas une confirmation bancaire).
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
};

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-bold [&>i]:h-1.5 [&>i]:w-1.5 [&>i]:rounded-full [&>i]:bg-current",
  { variants: { ton: TONS }, defaultVariants: { ton: "neutre" } },
);

const TON_PAR_STATUT: Record<string, keyof typeof TONS> = {
  A_PAYER: "neutre",
  PAIEMENT_EN_COURS: "attention",
  EN_VERIFICATION: "attention",
  PAYE: "succes",
  CONFIRME: "succes",
  ACTIF: "succes",
  ACTIF_ADMIN: "succes",
  REJETE: "erreur",
  CORRECTION_DEMANDEE: "avertissement",
  EN_RETARD: "erreur",
  INACTIF: "neutre",
  EN_ATTENTE: "attention",
  SUSPENDU: "erreur",
  TERMINE: "succes",
  PARTIEL: "avertissement",
  ERREUR: "erreur",
  ENTREPRISE: "bleu",
  PARTICULIER: "violet",
  ADMIN: "violet",
  CLIENT: "bleu",
  SUCCES: "succes",
  ECHEC: "erreur",
};

export function StatusBadge({ statut }: Readonly<{ statut: string }>) {
  return (
    <span className={cn(badgeVariants({ ton: TON_PAR_STATUT[statut] ?? "neutre" }))}>
      <i aria-hidden="true" />
      {BADGE_LABELS[statut] ?? formatStatus(statut)}
    </span>
  );
}
