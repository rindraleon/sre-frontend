import type { AccountStatus } from "../user";

export type TaxpayerType = "PARTICULIER" | "ENTREPRISE";

export interface Taxpayer {
  id: string;
  userId?: string;
  type: TaxpayerType;
  lastName: string;
  firstName?: string;
  legalName?: string;
  tradeName?: string;
  nif: string;
  stat?: string;
  address: string;
  region: string;
  city: string;
  email: string;
  phone: string;
  legalRepresentative?: string;
  contactLastName?: string;
  contactFirstName?: string;
  contactRole?: string;
  accountCreatedAt: string;
  status?: AccountStatus;
  createdAt: string;
}
