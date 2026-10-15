import type { AccountStatus } from "../user";

export type TaxpayerType = "PARTICULIER" | "ENTREPRISE";

export interface Taxpayer {
  id: string;
  utilisateurId?: string;
  type: TaxpayerType;
  nom: string;
  prenom?: string;
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
  dateCreationCompte: string;
  statut?: AccountStatus;
  creeLe: string;
}
