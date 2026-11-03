import type { AppUser } from "@/types/user";
import type { Taxpayer } from "@/types/taxpayer";
import type { TaxType } from "@/types/tax";
import type { TaxObligation } from "@/types/obligation";
import type { Payment, PaymentDocument } from "@/types/payment";
import type { AppNotification } from "@/types/notification";
import type { ActivityLogEntry } from "@/types/activity";

export interface AppSettings {
  institution: string;
  regions: string[];
}

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
