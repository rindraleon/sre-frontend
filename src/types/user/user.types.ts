export type UserRole = "ADMIN" | "CLIENT";
export type AccountStatus = "ACTIF" | "EN_ATTENTE" | "INACTIF" | "SUSPENDU";

export interface AppUser {
  id: string;
  nom: string;
  courriel: string;
  role: UserRole;
  contribuableId?: string;
  statut: AccountStatus;
  changementMotDePasseRequis: boolean;
  creeLe: string;
  derniereConnexion?: string;
}
