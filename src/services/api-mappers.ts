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

export function mapApiUser(utilisateur: ApiUser): AppUser {
  return {
    id: utilisateur.id,
    nom: utilisateur.nom,
    courriel: utilisateur.courriel,
    role: utilisateur.role,
    contribuableId: utilisateur.contribuableId,
    statut: utilisateur.statut,
    changementMotDePasseRequis: utilisateur.changementMotDePasseRequis,
    profilComplete: utilisateur.profilComplete ?? true,
    courrielVerifie: utilisateur.courrielVerifie ?? false,
    creeLe: utilisateur.creeLe,
    derniereConnexion: utilisateur.derniereConnexion ?? undefined,
  };
}

export function mapApiTaxpayer(contribuable: ApiTaxpayer, utilisateurId?: string): Taxpayer {
  return {
    id: contribuable.id,
    utilisateurId,
    type: contribuable.type,
    nom: contribuable.nom,
    prenom: contribuable.prenom ?? undefined,
    raisonSociale: contribuable.raisonSociale ?? undefined,
    nomCommercial: contribuable.nomCommercial ?? undefined,
    nif: contribuable.nif ?? "",
    stat: contribuable.stat ?? undefined,
    adresse: contribuable.adresse,
    region: contribuable.region,
    ville: contribuable.ville,
    courriel: contribuable.courriel,
    telephone: contribuable.telephone,
    representantLegal: contribuable.representantLegal ?? undefined,
    nomContact: contribuable.nomContact ?? undefined,
    prenomContact: contribuable.prenomContact ?? undefined,
    fonctionContact: contribuable.fonctionContact ?? undefined,
    dateCreationCompte: contribuable.dateCreationCompte,
    statut: contribuable.statutCompte ?? undefined,
    creeLe: contribuable.creeLe,
  };
}

export function mapApiTaxType(type: ApiTaxType): TaxType {
  return {
    id: type.id,
    code: type.code,
    nom: type.nom,
    description: type.description,
    categorie: type.categorie,
    contribuablesConcernes: type.contribuablesConcernes,
    periodicite: type.periodicite,
    regleEcheance: type.regleEcheance,
    modeMontant: type.modeMontant,
    montantReference: type.montantReference == null ? null : Number(type.montantReference),
    champsComplementaires: type.champsComplementaires ?? [],
    actif: type.actif,
    creeLe: type.creeLe,
    modifieLe: type.modifieLe,
  };
}

export function mapApiObligation(obligation: ApiObligation): TaxObligation {
  return {
    id: obligation.id,
    contribuableId: obligation.contribuableId,
    typeImpotId: obligation.typeImpotId,
    typeImpotNom: obligation.typeImpotNom,
    referenceFiscale: obligation.referenceFiscale,
    periode: obligation.periode,
    montant: Number(obligation.montant),
    devise: obligation.devise,
    echeance: obligation.echeance,
    statut: obligation.statut,
    creeLe: obligation.creeLe,
  };
}

export function mapApiPayment(paiement: ApiPayment): Payment {
  return {
    id: paiement.id,
    referenceInterne: paiement.referenceInterne,
    contribuableId: paiement.contribuableId,
    obligationId: paiement.obligationId,
    typeImpotId: paiement.typeImpotId,
    typeImpotNom: paiement.typeImpotNom,
    periode: paiement.periode,
    montant: Number(paiement.montant),
    devise: paiement.devise,
    mode: paiement.mode,
    operateur: paiement.operateur ?? undefined,
    telephoneUtilise: paiement.telephoneUtilise ?? undefined,
    banqueOuCanal: paiement.banqueOuCanal ?? undefined,
    titulairePayeur: paiement.titulairePayeur ?? undefined,
    referenceTransaction: paiement.referenceTransaction,
    dateTransaction: paiement.dateTransaction,
    justificatifNom: paiement.justificatifNom ?? undefined,
    statut: paiement.statut,
    soumisLe: paiement.soumisLe,
    valideLe: paiement.valideLe ?? undefined,
    validePar: paiement.validePar ?? undefined,
    motifRejet: paiement.motifRejet ?? undefined,
    historique: paiement.historique.map((entree) => ({
      ...entree,
      motif: entree.motif ?? undefined,
    })),
  };
}

export function mapApiDocument(document: ApiDocument): PaymentDocument {
  return {
    ...document,
    montant: Number(document.montant),
    statut: document.statut,
  };
}

export function mapApiPaymentDocuments(paiement: ApiPayment): PaymentDocument[] {
  return (paiement.documents ?? []).map((document) => ({
    id: document.id,
    numero: document.numero,
    type: document.type,
    statut: document.statut,
    paiementId: paiement.id,
    contribuableId: paiement.contribuableId,
    referencePaiement: paiement.referenceInterne,
    typeImpotNom: paiement.typeImpotNom,
    periode: paiement.periode,
    referenceTransactionDeclaree: paiement.referenceTransaction,
    modeDeclare: paiement.mode,
    montant: Number(document.montant),
    devise: document.devise,
    emetteur: document.emetteur,
    emisLe: document.emisLe,
    emisPar: document.emisPar ?? undefined,
    mention: document.mention,
  }));
}

export function mapApiNotification(
  notification: ApiNotification,
  utilisateurId: string,
): AppNotification {
  return {
    id: notification.id,
    titre: notification.titre,
    message: notification.message,
    type: "OBLIGATION",
    date: notification.creeLe,
    lue: notification.lue,
    utilisateurId,
    referenceEntite: notification.obligation?.id,
    // Le statut d'envoi courriel reste distinct de la notification in-app.
    statutEmail:
      notification.statutCourriel === "ENVOYE"
        ? "ENVOYE"
        : notification.statutCourriel === "DELIVRE"
          ? "DELIVRE"
          : notification.statutCourriel === "ECHEC"
            ? "ERREUR"
            : notification.statutCourriel === "EN_ATTENTE"
              ? "EN_ATTENTE"
              : "NON_ENVOYE",
  };
}
