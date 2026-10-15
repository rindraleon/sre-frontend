import type { AppUser } from "../user";
import type { Taxpayer } from "../taxpayer";
import type { TaxType } from "../tax";
import type { TaxObligation } from "../obligation";
import type { Payment, PaymentDocument } from "../payment";
import type { AppNotification } from "../notification";
import type { ActivityLogEntry } from "../activity";

export interface AppSettings {
  institution: string;
  regions: string[];
}

/** Projection en mémoire des réponses API utilisées par les pages. */
export interface PlatformState {
  version: 1;
  administrateurInitialise: boolean;
  utilisateurs: AppUser[];
  contribuables: Taxpayer[];
  typesImpots: TaxType[];
  obligations: TaxObligation[];
  paiements: Payment[];
  documentsPaiement: PaymentDocument[];
  notifications: AppNotification[];
  journauxActivite: ActivityLogEntry[];
  parametres: AppSettings;
}
