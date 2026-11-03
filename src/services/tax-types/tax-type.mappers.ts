import type { ApiTaxType, TaxType } from "@/types";

export function mapApiTaxType(type: ApiTaxType): TaxType {
  return {
    id: type.id,
    code: type.code,
    name: type.nom,
    description: type.description,
    category: type.categorie,
    applicableTaxpayers: type.contribuablesConcernes,
    periodicity: type.periodicite,
    dueDateRule: type.regleEcheance,
    amountMode: type.modeMontant,
    referenceAmount: type.montantReference == null ? null : Number(type.montantReference),
    additionalFields: type.champsComplementaires ?? [],
    isActive: type.actif,
    createdAt: type.creeLe,
    updatedAt: type.modifieLe,
  };
}
