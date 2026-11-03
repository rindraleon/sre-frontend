import type { ApiTaxpayer, Taxpayer } from "@/types";

export function mapApiTaxpayer(taxpayer: ApiTaxpayer, userId?: string): Taxpayer {
  return {
    id: taxpayer.id,
    userId,
    type: taxpayer.type,
    lastName: taxpayer.nom,
    firstName: taxpayer.prenom ?? undefined,
    legalName: taxpayer.raisonSociale ?? undefined,
    tradeName: taxpayer.nomCommercial ?? undefined,
    nif: taxpayer.nif ?? "",
    stat: taxpayer.stat ?? undefined,
    address: taxpayer.adresse,
    region: taxpayer.region,
    city: taxpayer.ville,
    email: taxpayer.courriel,
    phone: taxpayer.telephone,
    legalRepresentative: taxpayer.representantLegal ?? undefined,
    contactLastName: taxpayer.nomContact ?? undefined,
    contactFirstName: taxpayer.prenomContact ?? undefined,
    contactRole: taxpayer.fonctionContact ?? undefined,
    accountCreatedAt: taxpayer.dateCreationCompte,
    status: taxpayer.statutCompte ?? undefined,
    createdAt: taxpayer.creeLe,
  };
}
