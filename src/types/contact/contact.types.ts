export type ContactMessageStatus =
  | "NON_LU"
  | "LU"
  | "EN_ATTENTE_REPONSE"
  | "REPONDU";

export type ContactEmailStatus =
  | "NON_CONFIGURE"
  | "EN_ATTENTE"
  | "ENVOYE"
  | "ECHEC";

export type ContactMessageSource = "SITE_PUBLIC" | "ESPACE_CLIENT";

export type ContactEmailRetryType =
  | "NOTIFICATION_ADMIN"
  | "ACCUSE_VISITEUR"
  | "REPONSE"
  | "TOUS";

export interface ContactReplyHistoryItem {
  id: string;
  sujet: string;
  message: string;
  reponduLe: string;
  reponduParId: string | null;
  reponduParNom: string;
  statutCourriel: ContactEmailStatus;
  erreurCourriel?: string | null;
}

/** Message submitted through the public contact form or client workspace. */
export interface ContactMessageEntry {
  id: string;
  reference?: string;
  nom: string;
  courriel: string;
  sujet: string;
  message: string;
  source?: ContactMessageSource;
  utilisateurId?: string | null;
  statut?: ContactMessageStatus;
  lue: boolean;
  luLe?: string | null;
  statutCourriel: ContactEmailStatus;
  tentativesCourriel?: number;
  derniereErreurCourriel?: string | null;
  courrielEnvoyeLe?: string | null;
  statutAccuse?: ContactEmailStatus;
  tentativesAccuse?: number;
  derniereErreurAccuse?: string | null;
  accuseEnvoyeLe?: string | null;
  sujetReponse?: string | null;
  messageReponse?: string | null;
  reponduLe?: string | null;
  reponduParId?: string | null;
  reponduParNom?: string | null;
  statutCourrielReponse?: ContactEmailStatus | null;
  tentativesCourrielReponse?: number;
  derniereErreurCourrielReponse?: string | null;
  historiqueReponses?: ContactReplyHistoryItem[];
  creeLe: string;
  modifieLe?: string;
}

export interface ContactMessagesCounts {
  nonLus: number;
  lus: number;
  enAttenteReponse: number;
  repondus: number;
}

export interface ContactMessagesUnreadResponse {
  total: number;
  unread: number;
  pendingReply?: number;
  counts?: ContactMessagesCounts;
}

export interface ContactMessagesResponse {
  total: number;
  unread: number;
  pendingReply?: number;
  counts?: ContactMessagesCounts;
  messages: ContactMessageEntry[];
}

export interface ContactReplyResponse {
  resultat: "ENVOYE" | "CAPTURE" | "ECHEC" | "NON_CONFIGURE";
  confirmation: string;
  erreurCourriel: string | null;
  dejaEnvoye?: boolean;
  message: ContactMessageEntry;
}

export interface PublicContactSubmissionResponse {
  statut: "ENVOYE" | "CAPTURE";
  message: string;
  reference?: string;
  dateSoumission?: string;
  accuseReception?: {
    statut: ContactEmailStatus;
    destinataire: string;
  };
  dejaEnregistre?: boolean;
}
