import type {
  ApiNotification,
  ApiObligation,
  ApiPayment,
  ApiTaxpayer,
  ApiTaxType,
  ApiUser,
  ApiDocument,
} from "@/types/api";
import type {
  AppNotification,
  AppUser,
  Payment,
  PaymentDocument,
  TaxObligation,
  Taxpayer,
  TaxType,
} from "@/types";

export function mapApiUser(user: ApiUser): AppUser {
  return {
    id: user.id,
    name: user.nom,
    email: user.courriel,
    role: user.role,
    taxpayerId: user.contribuableId,
    status: user.statut,
    mustChangePassword: user.changementMotDePasseRequis,
    isProfileComplete: user.profilComplete ?? true,
    isEmailVerified: user.courrielVerifie ?? false,
    createdAt: user.creeLe,
    lastLoginAt: user.derniereConnexion ?? undefined,
  };
}

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

export function mapApiPayment(payment: ApiPayment): Payment {
  return {
    id: payment.id,
    internalReference: payment.referenceInterne,
    taxpayerId: payment.contribuableId,
    obligationId: payment.obligationId,
    taxTypeId: payment.typeImpotId,
    taxTypeName: payment.typeImpotNom,
    period: payment.periode,
    amount: Number(payment.montant),
    currency: payment.devise,
    mode: payment.mode,
    operator: payment.operateur ?? undefined,
    usedPhone: payment.telephoneUtilise ?? undefined,
    bankOrChannel: payment.banqueOuCanal ?? undefined,
    payerName: payment.titulairePayeur ?? undefined,
    transactionReference: payment.referenceTransaction,
    transactionDate: payment.dateTransaction,
    supportingDocumentName: payment.justificatifNom ?? undefined,
    status: payment.statut,
    submittedAt: payment.soumisLe,
    validatedAt: payment.valideLe ?? undefined,
    validatedBy: payment.validePar ?? undefined,
    rejectionReason: payment.motifRejet ?? undefined,
    history: payment.historique.map((entry) => ({
      status: entry.statut,
      label: entry.libelle,
      date: entry.date,
      actor: entry.acteur,
      reason: entry.motif ?? undefined,
    })),
  };
}

export function mapApiDocument(document: ApiDocument): PaymentDocument {
  return {
    id: document.id,
    number: document.numero,
    type: document.type,
    status: document.statut,
    paymentId: document.paiementId,
    taxpayerId: document.contribuableId,
    paymentReference: document.referencePaiement,
    taxTypeName: document.typeImpotNom,
    period: document.periode,
    declaredTransactionReference: document.referenceTransactionDeclaree,
    declaredMode: document.modeDeclare,
    amount: Number(document.montant),
    currency: document.devise,
    issuer: document.emetteur,
    issuedAt: document.emisLe,
    issuedBy: document.emisPar ?? undefined,
    mention: document.mention,
  };
}

export function mapApiPaymentDocuments(payment: ApiPayment): PaymentDocument[] {
  return (payment.documents ?? []).map((document) => ({
    id: document.id,
    number: document.numero,
    type: document.type,
    status: document.statut,
    paymentId: payment.id,
    taxpayerId: payment.contribuableId,
    paymentReference: payment.referenceInterne,
    taxTypeName: payment.typeImpotNom,
    period: payment.periode,
    declaredTransactionReference: payment.referenceTransaction,
    declaredMode: payment.mode,
    amount: Number(document.montant),
    currency: document.devise,
    issuer: document.emetteur,
    issuedAt: document.emisLe,
    issuedBy: document.emisPar ?? undefined,
    mention: document.mention,
  }));
}

export function mapApiNotification(
  notification: ApiNotification,
  userId: string,
): AppNotification {
  let emailStatus: AppNotification["emailStatus"];
  switch (notification.statutCourriel) {
    case "ENVOYE":
      emailStatus = "ENVOYE";
      break;
    case "DELIVRE":
      emailStatus = "DELIVRE";
      break;
    case "ECHEC":
      emailStatus = "ERREUR";
      break;
    case "EN_ATTENTE":
      emailStatus = "EN_ATTENTE";
      break;
    default:
      emailStatus = "NON_ENVOYE";
  }

  return {
    id: notification.id,
    title: notification.titre,
    message: notification.message,
    type: "OBLIGATION",
    date: notification.creeLe,
    isRead: notification.lue,
    userId,
    entityReference: notification.obligation?.id,
    // The e-mail delivery status stays distinct from the in-app notification.
    emailStatus,
  };
}
