import type { TaxpayerType } from "../taxpayer";
import type { UserRole } from "../user";

/** Profile sent to the API when creating a taxpayer account. */
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

/** In-memory session of the portal. The token is persisted in sessionStorage only. */
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
