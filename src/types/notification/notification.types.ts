import type { UserRole } from "../user";

export type NotificationType =
  | "COMPTE"
  | "PAIEMENT"
  | "OBLIGATION"
  | "IMPORT"
  | "SECURITE"
  | "ADMINISTRATION";

export interface AppNotification {
  id: string;
  titre: string;
  message: string;
  type: NotificationType;
  date: string;
  lue: boolean;
  utilisateurId?: string;
  roleDestinataire?: UserRole;
  referenceEntite?: string;
  /** Statut du courriel associé — « DELIVRE » uniquement si confirmé par le fournisseur. */
  statutEmail: "NON_ENVOYE" | "ERREUR" | "ENVOYE" | "EN_ATTENTE" | "DELIVRE";
}

/** Situation d'un dossier dans le suivi des retards (calculée par le serveur). */
export type SituationRetard =
  | "REGULARISE"
  | "EN_VERIFICATION"
  | "REJETE"
  | "CORRECTION_DEMANDEE"
  | "EN_RETARD"
  | "EN_ATTENTE";

export type StatutCourrielNotification =
  | "NON_CONFIGURE"
  | "EN_ATTENTE"
  | "ENVOYE"
  | "DELIVRE"
  | "ECHEC";

/** Ligne du tableau de suivi des retards (GET /admin/retards). */
export interface LigneRetard {
  obligationId: string;
  referenceFiscale: string;
  periode: string;
  typeImpot: string;
  montant: string;
  devise: string;
  echeance: string;
  joursRestants: number;
  joursRetard: number;
  statut: string;
  situation: SituationRetard;
  entite: {
    id: string;
    nom: string;
    type: string;
    stat: string | null;
    nif: string | null;
    courriel: string | null;
  };
}

/** Résultat par destinataire d'une campagne groupée. */
export interface ResultatDestinataireCampagne {
  obligationId: string;
  destinataire: string;
  reference: string;
  resultat: "ENVOYEE" | "DEJA_ENVOYEE" | "IGNOREE" | "SANS_COMPTE" | "ECHEC";
  statutCourriel: StatutCourrielNotification;
  erreur?: string;
}

/** Récapitulatif d'une campagne de notifications groupées. */
export interface BilanCampagne {
  totalSelectionnes: number;
  notificationsCreees: number;
  dejaEnvoyees: number;
  ignorees: number;
  sansCompte: number;
  echecs: number;
  courrielsEnvoyes: number;
  courrielsNonConfigures: number;
  details: ResultatDestinataireCampagne[];
}

/** Entrée de l'historique des envois groupés. */
export interface EntreeHistoriqueEnvois {
  id: string;
  titre: string;
  message: string;
  dateEnvoi: string;
  destinataire: { nom: string; courriel: string };
  dossier: { id: string | null; reference: string };
  initiePar: string;
  statutCourriel: StatutCourrielNotification;
  tentativesCourriel: number;
  derniereErreurCourriel: string | null;
}
