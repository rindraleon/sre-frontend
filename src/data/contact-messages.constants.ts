import { Clock, Inbox, Mail, MailCheck, CheckCircle2 } from "lucide-react";
import type {
  ContactEmailStatus,
  ContactMessageEntry,
  ContactMessageSource,
  ContactMessageStatus,
  ContactMessagesCounts,
} from "@/types";

export const CONTACT_STATUS_LABELS: Record<ContactMessageStatus, string> = {
  NON_LU: "Non lu",
  LU: "Lu",
  EN_ATTENTE_REPONSE: "En attente de réponse",
  REPONDU: "Répondu",
};

export const CONTACT_SOURCE_LABELS: Record<ContactMessageSource, string> = {
  SITE_PUBLIC: "Formulaire public",
  ESPACE_CLIENT: "Espace client",
};

export const CONTACT_STATUS_ORDER: readonly ContactMessageStatus[] = [
  "NON_LU",
  "LU",
  "EN_ATTENTE_REPONSE",
  "REPONDU",
];

export type ContactSortOption = "non_lus" | "date_desc" | "date_asc" | "statut" | "expediteur";
export type ContactFilterValue<T extends string> = T | "TOUS";

export const CONTACT_STATUS_FILTER_OPTIONS = CONTACT_STATUS_ORDER.map((status) => ({
  value: status,
  label: CONTACT_STATUS_LABELS[status],
}));

export const CONTACT_SOURCE_FILTER_OPTIONS: { value: ContactMessageSource; label: string }[] = [
  { value: "SITE_PUBLIC", label: CONTACT_SOURCE_LABELS.SITE_PUBLIC },
  { value: "ESPACE_CLIENT", label: CONTACT_SOURCE_LABELS.ESPACE_CLIENT },
];

export const CONTACT_EMAIL_STATUS_FILTER_OPTIONS: {
  value: ContactEmailStatus;
  label: string;
}[] = [
  { value: "ENVOYE", label: "E-mail envoyé" },
  { value: "ECHEC", label: "Échec d’envoi" },
  { value: "NON_CONFIGURE", label: "Non configuré" },
];

export const CONTACT_SORT_OPTIONS: { value: ContactSortOption; label: string }[] = [
  { value: "non_lus", label: "Non lus d’abord" },
  { value: "date_desc", label: "Plus récents" },
  { value: "date_asc", label: "Plus anciens" },
  { value: "statut", label: "Par statut" },
  { value: "expediteur", label: "Par expéditeur (A-Z)" },
];

export interface ContactStatusCardConfig {
  key: ContactFilterValue<ContactMessageStatus>;
  label: string;
  icon: typeof Inbox;
  activeClass: string;
  iconClass: string;
  valueClass: string;
}

export const CONTACT_STATUS_CARDS: readonly ContactStatusCardConfig[] = [
  {
    key: "TOUS",
    label: "Tous les messages",
    icon: Inbox,
    activeClass: "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm",
    iconClass: "text-blue-600",
    valueClass: "text-slate-900 dark:text-white",
  },
  {
    key: "NON_LU",
    label: "Non lus",
    icon: Mail,
    activeClass: "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 shadow-sm",
    iconClass: "text-amber-500",
    valueClass: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "EN_ATTENTE_REPONSE",
    label: "En attente de réponse",
    icon: Clock,
    activeClass: "border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 shadow-sm",
    iconClass: "text-orange-500",
    valueClass: "text-orange-600 dark:text-orange-400",
  },
  {
    key: "REPONDU",
    label: "Répondus",
    icon: MailCheck,
    activeClass: "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-sm",
    iconClass: "text-emerald-600",
    valueClass: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "LU",
    label: "Lus (sans réponse)",
    icon: CheckCircle2,
    activeClass: "border-sky-600 bg-sky-50/70 dark:bg-sky-950/40 shadow-sm",
    iconClass: "text-sky-600",
    valueClass: "text-sky-600 dark:text-sky-400",
  },
];

export interface QuickReplyTemplate {
  label: string;
  build: (message: ContactMessageEntry) => string;
}

const SIGNATURE = "Service Régional des Entreprises — Haute Matsiatra";

export const QUICK_REPLY_TEMPLATES: readonly QuickReplyTemplate[] = [
  {
    label: "Prise en charge",
    build: (message) =>
      `Bonjour ${message.nom},\n\nNous accusons bonne réception de votre demande concernant « ${message.sujet} » (réf. ${messageReference(message)}).\n\nVotre dossier est actuellement en cours d'examen par nos services. Nous reviendrons vers vous dans les meilleurs délais.\n\nCordialement,\n${SIGNATURE}`,
  },
  {
    label: "Demande de précisions",
    build: (message) =>
      `Bonjour ${message.nom},\n\nAfin de traiter votre demande « ${message.sujet} », nous vous remercions de bien vouloir nous préciser votre numéro NIF ou STAT ainsi que la période fiscale concernée.\n\nVous pouvez répondre directement à ce courriel ou soumettre ces éléments depuis votre espace contribuable.\n\nCordialement,\n${SIGNATURE}`,
  },
  {
    label: "Orientation espace client",
    build: (message) =>
      `Bonjour ${message.nom},\n\nSuite à votre message concernant « ${message.sujet} », nous vous invitons à vous connecter à votre espace contribuable sur le portail SRE où vos obligations, déclarations et reçus sont disponibles en temps réel.\n\nRestant à votre disposition,\n${SIGNATURE}`,
  },
];

export function resolveMessageStatus(entry: ContactMessageEntry): ContactMessageStatus {
  return entry.statut ?? (entry.lue ? "LU" : "NON_LU");
}

export function messageReference(entry: ContactMessageEntry): string {
  return entry.reference ?? `MSG-${entry.id.slice(0, 8).toUpperCase()}`;
}

export function hasFailedEmail(entry: ContactMessageEntry): boolean {
  return (
    entry.statutCourriel === "ECHEC" ||
    entry.statutAccuse === "ECHEC" ||
    entry.statutCourrielReponse === "ECHEC"
  );
}

export function countByStatus(messages: readonly ContactMessageEntry[]): ContactMessagesCounts {
  const counts: ContactMessagesCounts = {
    nonLus: 0,
    lus: 0,
    enAttenteReponse: 0,
    repondus: 0,
  };
  for (const message of messages) {
    switch (resolveMessageStatus(message)) {
      case "NON_LU":
        counts.nonLus += 1;
        break;
      case "LU":
        counts.lus += 1;
        break;
      case "EN_ATTENTE_REPONSE":
        counts.enAttenteReponse += 1;
        break;
      case "REPONDU":
        counts.repondus += 1;
        break;
    }
  }
  return counts;
}

export function countUnread(messages: readonly ContactMessageEntry[]): number {
  return messages.filter((message) => resolveMessageStatus(message) === "NON_LU" || !message.lue)
    .length;
}

export function statusCardValue(
  key: ContactFilterValue<ContactMessageStatus>,
  counts: ContactMessagesCounts,
  unread: number,
  total: number,
): number {
  switch (key) {
    case "TOUS":
      return total;
    case "NON_LU":
      return counts.nonLus ?? unread;
    case "LU":
      return counts.lus;
    case "EN_ATTENTE_REPONSE":
      return counts.enAttenteReponse;
    case "REPONDU":
      return counts.repondus;
  }
}
