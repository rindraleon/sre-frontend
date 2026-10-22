export const STATUS_LABELS: Record<string, string> = {
  SUCCESS: "Réussi",
  PENDING: "En attente",
  FAILED: "Échoué",
  CANCELLED: "Annulé",
  EXPIRED: "Expiré",
  REFUNDED: "Remboursé",
  PARTIALLY_REFUNDED: "Partiel",
  PROCESSING: "En cours",
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  SUSPENDED: "Suspendu",
  OPERATIONAL: "Opérationnel",
  DEGRADED: "Dégradé",
  OUTAGE: "Indisponible",
  RESOLVED: "Résolu",
  INVESTIGATING: "En investigation",
  MATCH: "Conforme",
  MISSING: "Absent",
  AMOUNT_MISMATCH: "Écart de montant",
  STATUS_MISMATCH: "Écart de statut",
  DUPLICATE: "Doublon",
  RETRYING: "Nouvel essai",
  RECEIVED: "Reçu",
  PROCESSED: "Traité",
  REJECTED: "Rejeté",
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  READY: "Disponible",
  PROCESSING_REPORT: "Génération",
  REVOKED: "Révoquée",
  TEST: "Test",
  PRODUCTION: "Production",
  CRITIQUE: "Critique",
  high: "Élevée",
  MOYENNE: "Moyenne",
  FAIBLE: "Faible",
};

export function formatStatus(status: string): string {
  return STATUS_LABELS[status] ?? status.replaceAll("_", " ").toLowerCase();
}

export function formatMoney(amount: number, currency = "MGA"): string {
  return (
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount) + ` ${currency}`
  );
}

export function formatDate(date: string | null | undefined, detail = false): string {
  if (!date) return "—";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return date;
  return new Intl.DateTimeFormat(
    "fr-FR",
    detail
      ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
      : { day: "2-digit", month: "short", year: "numeric" },
  ).format(value);
}

export function getInitials(name: string): string {
  return name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
