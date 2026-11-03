import type { UserRole } from "@/types/user";

export type NotificationType =
  "COMPTE" | "PAIEMENT" | "OBLIGATION" | "IMPORT" | "SECURITE" | "ADMINISTRATION";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  date: string;
  isRead: boolean;
  userId?: string;
  recipientRole?: UserRole;
  entityReference?: string;
  emailStatus: "NON_ENVOYE" | "ERREUR" | "ENVOYE" | "EN_ATTENTE" | "DELIVRE";
}

export type OverdueSituation =
  "REGULARISE" | "EN_VERIFICATION" | "REJETE" | "CORRECTION_DEMANDEE" | "EN_RETARD" | "EN_ATTENTE";

export type StatusEmailNotification =
  "NON_CONFIGURE" | "EN_ATTENTE" | "ENVOYE" | "DELIVRE" | "ECHEC";

export interface OverdueRow {
  obligationId: string;
  referenceFiscale: string;
  periode: string;
  typeImpot: string;
  montant: string;
  devise: string;
  echeance: string;
  joursRestants: number;
  joursRetard: number;
  statut: string;
  situation: OverdueSituation;
  entite: {
    id: string;
    nom: string;
    type: string;
    stat: string | null;
    nif: string | null;
    courriel: string | null;
  };
}

export interface CampaignRecipientResult {
  obligationId: string;
  destinataire: string;
  reference: string;
  resultat: "ENVOYEE" | "DEJA_ENVOYEE" | "IGNOREE" | "SANS_COMPTE" | "ECHEC";
  statutCourriel: StatusEmailNotification;
  erreur?: string;
}

export interface CampaignSummary {
  totalSelectionnes: number;
  notificationsCreees: number;
  dejaEnvoyees: number;
  ignorees: number;
  sansCompte: number;
  echecs: number;
  courrielsEnvoyes: number;
  courrielsNonConfigures: number;
  details: CampaignRecipientResult[];
}

export interface DispatchHistoryEntry {
  id: string;
  titre: string;
  message: string;
  dateEnvoi: string;
  destinataire: { nom: string; courriel: string };
  dossier: { id: string | null; reference: string };
  initiePar: string;
  statutCourriel: StatusEmailNotification;
  tentativesCourriel: number;
  derniereErreurCourriel: string | null;
}
