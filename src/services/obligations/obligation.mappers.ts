import type { ApiObligation, TaxObligation } from "@/types";

export function mapApiObligation(obligation: ApiObligation): TaxObligation {
  return {
    id: obligation.id,
    taxpayerId: obligation.contribuableId,
    taxTypeId: obligation.typeImpotId,
    taxTypeName: obligation.typeImpotNom,
    taxReference: obligation.referenceFiscale,
    period: obligation.periode,
    amount: Number(obligation.montant),
    currency: obligation.devise,
    dueDate: obligation.echeance,
    status: obligation.statut,
    createdAt: obligation.creeLe,
  };
}
