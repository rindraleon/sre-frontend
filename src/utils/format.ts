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
  ÉLEVÉE: "Élevée",
  MOYENNE: "Moyenne",
  FAIBLE: "Faible",
};

export function formatStatus(statut: string): string {
  return STATUS_LABELS[statut] ?? statut.replaceAll("_", " ").toLowerCase();
}

export function formatMoney(montant: number, devise = "MGA"): string {
  return (
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(montant) + ` ${devise}`
  );
}

export function formatDate(date: string | null | undefined, detail = false): string {
  if (!date) return "—";
  const valeur = new Date(date);
  if (Number.isNaN(valeur.getTime())) return date;
  return new Intl.DateTimeFormat(
    "fr-FR",
    detail
      ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
      : { day: "2-digit", month: "short", year: "numeric" },
  ).format(valeur);
}

export function getInitials(nom: string): string {
  return nom
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((partie) => partie[0]?.toUpperCase() ?? "")
    .join("");
}
