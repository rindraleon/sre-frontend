import type { UserRole } from "../user";

export interface ActivityLogEntry {
  id: string;
  acteurId?: string;
  acteur: string;
  role: UserRole | "SYSTEME";
  action: string;
  ressource: string;
  referenceRessource: string;
  date: string;
  resultat: "SUCCES" | "ECHEC";
  details?: string;
}
