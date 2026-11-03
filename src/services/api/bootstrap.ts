import { callApi } from "./http-client";
import type {
  ApiDocument,
  ApiNotification,
  ApiObligation,
  ApiPaginatedResponse,
  ApiPayment,
  ApiTaxpayer,
  ApiTaxType,
  ApiUser,
} from "@/types/api";
import type { PlatformState, UserRole } from "@/types";
import { mapApiDocument, mapApiPaymentDocuments } from "@/services/documents";
import { mapApiNotification } from "@/services/notification";
import { mapApiObligation } from "@/services/obligations";
import { mapApiPayment } from "@/services/payments";
import { mapApiTaxpayer } from "@/services/taxpayers";
import { mapApiTaxType } from "@/services/tax-types";
import { mapApiUser } from "@/services/user";

const PAGE_SIZE = 100;
const PARALLEL_BATCH = 4;

async function loadAllPages<T>(path: string, token: string): Promise<T[]> {
  const firstPage = await callApi<ApiPaginatedResponse<T>>(`${path}?page=1&parPage=${PAGE_SIZE}`, {
    token,
  });
  const pageCount = Math.ceil(firstPage.total / Math.max(1, firstPage.parPage || PAGE_SIZE));
  const remaining: T[][] = [];

  for (let start = 2; start <= pageCount; start += PARALLEL_BATCH) {
    const pageNumbers = Array.from(
      { length: Math.min(PARALLEL_BATCH, pageCount - start + 1) },
      (_, index) => start + index,
    );
    const pages = await Promise.all(
      pageNumbers.map((page) =>
        callApi<ApiPaginatedResponse<T>>(`${path}?page=${page}&parPage=${PAGE_SIZE}`, { token }),
      ),
    );
    remaining.push(...pages.map((page) => page.donnees));
  }

  return [...firstPage.donnees, ...remaining.flat()];
}

export async function loadApiState(
  token: string,
  role: UserRole,
  user: ApiUser,
): Promise<Partial<PlatformState>> {
  if (role === "CLIENT") return loadClientState(token, user);
  return loadAdministratorState(token, user);
}

async function loadClientState(token: string, user: ApiUser): Promise<Partial<PlatformState>> {
  const [profile, taxTypes, obligations, payments, documents, notifications] = await Promise.all([
    callApi<ApiTaxpayer>("contribuables/moi", { token }),
    callApi<ApiTaxType[]>("types-impots", { token }),
    callApi<ApiObligation[]>("obligations/miennes", { token }),
    callApi<ApiPayment[]>("paiements/miennes", { token }),
    callApi<ApiDocument[]>("documents/miennes", { token }),
    callApi<ApiNotification[]>("notifications", { token }),
  ]);

  return {
    users: [mapApiUser(user)],
    taxpayers: [mapApiTaxpayer(profile, user.id)],
    taxTypes: taxTypes.map(mapApiTaxType),
    obligations: obligations.map(mapApiObligation),
    payments: payments.map(mapApiPayment),
    paymentDocuments: documents.map(mapApiDocument),
    notifications: notifications.map((notification) => mapApiNotification(notification, user.id)),
    isAdministratorInitialized: true,
  };
}

async function loadAdministratorState(
  token: string,
  user: ApiUser,
): Promise<Partial<PlatformState>> {
  const [accounts, profiles, taxTypes, obligations, rawPayments, notifications] = await Promise.all(
    [
      loadAllPages<ApiUser>("utilisateurs", token),
      loadAllPages<ApiTaxpayer>("contribuables", token),
      callApi<ApiTaxType[]>("types-impots/tous", { token }),
      callApi<ApiObligation[]>("obligations", { token }),
      loadAllPages<ApiPayment>("paiements", token),
      callApi<ApiNotification[]>("notifications", { token }),
    ],
  );

  const userIdByTaxpayerId = new Map(
    accounts.map((account) => [account.contribuableId, account.id] as const),
  );

  return {
    users: accounts.map(mapApiUser),
    taxpayers: profiles.map((profile) =>
      mapApiTaxpayer(profile, profile.utilisateurId ?? userIdByTaxpayerId.get(profile.id)),
    ),
    taxTypes: taxTypes.map(mapApiTaxType),
    obligations: obligations.map(mapApiObligation),
    payments: rawPayments.map(mapApiPayment),
    paymentDocuments: rawPayments.flatMap(mapApiPaymentDocuments),
    notifications: notifications.map((notification) => mapApiNotification(notification, user.id)),
    isAdministratorInitialized: accounts.some((account) => account.role === "ADMIN"),
  };
}
