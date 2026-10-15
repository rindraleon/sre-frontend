import type { UserRole } from "../user";

export type NotificationType =
  | "COMPTE"
  | "PAIEMENT"
  | "OBLIGATION"
  | "IMPORT"
  | "SECURITE"
  | "ADMINISTRATION";

export interface AppNotification {
  id: string;
  titre: string;
  message: string;
  type: NotificationType;
  date: string;
  lue: boolean;
  utilisateurId?: string;
  roleDestinataire?: UserRole;
  referenceEntite?: string;
  statutEmail: "NON_ENVOYE" | "ERREUR" | "ENVOYE" | "EN_ATTENTE";
}
