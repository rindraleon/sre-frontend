export type UserRole = "ADMIN" | "CLIENT";
export type AccountStatus = "ACTIF" | "EN_ATTENTE" | "INACTIF" | "SUSPENDU";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  taxpayerId?: string;
  status: AccountStatus;
  mustChangePassword: boolean;
  isProfileComplete?: boolean;
  isEmailVerified?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}
