import type { TaxpayerType } from "@/types/taxpayer";
import type { UserRole } from "@/types/user";

export interface RegistrationProfile {
  nom: string;
  prenom?: string;
  type: TaxpayerType;
  raisonSociale?: string;
  nomCommercial?: string;
  nif: string;
  stat?: string;
  adresse: string;
  region: string;
  ville: string;
  courriel: string;
  telephone: string;
  representantLegal?: string;
  nomContact?: string;
  prenomContact?: string;
  fonctionContact?: string;
}

export interface ApiSession {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  taxpayerId?: string;
  mustChangePassword: boolean;
  isProfileComplete: boolean;
  expiresAt: number;
  apiMode: true;
  apiToken: string;
}
