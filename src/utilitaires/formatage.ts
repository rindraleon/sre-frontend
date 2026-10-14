export const libellesStatut: Record<string, string> = {
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

export function formaterStatut(statut: string): string {
  return libellesStatut[statut] ?? statut.replaceAll("_", " ").toLowerCase();
}

export function formaterArgent(montant: number, devise = "MGA"): string {
  return (
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(montant) + ` ${devise}`
  );
}

export function formaterArgentCourt(montant: number, devise = "MGA"): string {
  if (montant >= 1_000_000)
    return `${(montant / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M ${devise}`;
  if (montant >= 10_000)
    return `${(montant / 1_000).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} k ${devise}`;
  return formaterArgent(montant, devise);
}

export function formaterDate(date: string | null | undefined, detail = false): string {
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

export function tempsRelatif(date: string): string {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 1) return "à l’instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.floor(heures / 24);
  return jours === 1 ? "hier" : `il y a ${jours} j`;
}

export function classeStatut(statut: string): string {
  const statutTypable = statut;
  if (
    ["SUCCESS", "ACTIVE", "OPERATIONAL", "RESOLVED", "MATCH", "PROCESSED", "READY"].includes(
      statutTypable,
    )
  )
    return "statut--positif";
  if (
    [
      "PENDING",
      "PROCESSING",
      "RETRYING",
      "DEGRADED",
      "INVESTIGATING",
      "AMOUNT_MISMATCH",
      "STATUS_MISMATCH",
      "MISSING",
    ].includes(statutTypable)
  )
    return "statut--attention";
  if (
    [
      "FAILED",
      "CANCELLED",
      "EXPIRED",
      "REFUNDED",
      "SUSPENDED",
      "OUTAGE",
      "REJECTED",
      "DUPLICATE",
      "CRITIQUE",
    ].includes(statutTypable)
  )
    return "statut--negatif";
  return "statut--neutre";
}

export function initiales(nom: string): string {
  return nom
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((partie) => partie[0]?.toUpperCase() ?? "")
    .join("");
}
