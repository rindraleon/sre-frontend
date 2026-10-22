/** Message submitted through the public contact form (landing page). */
export interface ContactMessageEntry {
  id: string;
  nom: string;
  courriel: string;
  sujet: string;
  message: string;
  lue: boolean;
  statutCourriel: "NON_CONFIGURE" | "EN_ATTENTE" | "ENVOYE" | "ECHEC";
  derniereErreurCourriel?: string | null;
  creeLe: string;
}

export interface ContactMessagesResponse {
  total: number;
  unread: number;
  messages: ContactMessageEntry[];
}
