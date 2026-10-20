import type { TaxpayerType } from "../taxpayer";
import type { UserRole } from "../user";

/** Profil transmis à l'API lors de la création d'un compte contribuable. */
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

/** Session en mémoire du portail. Le jeton est persisté dans sessionStorage uniquement. */
export interface ApiSession {
  utilisateurId: string;
  nom: string;
  courriel: string;
  role: UserRole;
  contribuableId?: string;
  changementMotDePasseRequis: boolean;
  profilComplete: boolean;
  expireLe: number;
  modeApi: true;
  jetonApi: string;
}
