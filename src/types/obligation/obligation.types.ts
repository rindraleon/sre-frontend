export type StatutObligation =
  | "A_PAYER"
  | "PAIEMENT_EN_COURS"
  | "EN_VERIFICATION"
  | "PAYE"
  | "EN_RETARD"
  | "REJETE"
  | "CORRECTION_DEMANDEE";

export interface TaxObligation {
  id: string;
  contribuableId: string;
  typeImpotId: string;
  typeImpotNom: string;
  referenceFiscale: string;
  periode: string;
  montant: number;
  devise: "MGA";
  echeance: string;
  statut: StatutObligation;
  paiementId?: string;
  creeLe: string;
}
