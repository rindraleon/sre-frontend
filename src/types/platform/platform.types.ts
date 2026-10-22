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

/** In-memory projection of the API responses used by the pages. */
export interface PlatformState {
  version: 1;
  isAdministratorInitialized: boolean;
  users: AppUser[];
  taxpayers: Taxpayer[];
  taxTypes: TaxType[];
  obligations: TaxObligation[];
  payments: Payment[];
  paymentDocuments: PaymentDocument[];
  notifications: AppNotification[];
  logsActivity: ActivityLogEntry[];
  settings: AppSettings;
}
