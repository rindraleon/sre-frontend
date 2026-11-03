import { callApi } from "@/services/api";
import type { ApiAuthResponse, ApiUser } from "@/types";

export interface RegistrationState {
  administrateurInitialise: boolean;
}

export interface RegistrationPayload {
  nom: string;
  courriel: string;
  motDePasse: string;
  profil?: Record<string, unknown>;
}

export interface PasswordUpdatePayload {
  motDePasseActuel: string;
  nouveauMotDePasse: string;
  profil?: Record<string, unknown>;
}

export interface ActivationInformation {
  valide: boolean;
  courrielMasque: string;
  nom: string;
  expireLe: string;
}

export function getRegistrationStateApi(): Promise<RegistrationState> {
  return callApi<RegistrationState>("auth/etat-inscription");
}

export function fetchCurrentUserApi(token: string): Promise<ApiUser> {
  return callApi<ApiUser>("auth/moi", { token });
}

export function loginApi(email: string, password: string): Promise<ApiAuthResponse> {
  return callApi<ApiAuthResponse>("auth/connexion", {
    method: "POST",
    body: { courriel: email.trim().toLowerCase(), motDePasse: password },
  });
}

export function registerApi(payload: RegistrationPayload): Promise<ApiAuthResponse> {
  return callApi<ApiAuthResponse>("auth/inscription", { method: "POST", body: payload });
}

export function changePasswordApi(token: string, payload: PasswordUpdatePayload) {
  return callApi<{ message: string }>("auth/mot-de-passe", {
    method: "PATCH",
    token,
    body: {
      motDePasseActuel: payload.motDePasseActuel,
      nouveauMotDePasse: payload.nouveauMotDePasse,
    },
  });
}

export function completeInitialSetupApi(token: string, payload: PasswordUpdatePayload) {
  return callApi<{ message: string }>("auth/configuration-initiale", {
    method: "POST",
    token,
    body: {
      motDePasseActuel: payload.motDePasseActuel,
      nouveauMotDePasse: payload.nouveauMotDePasse,
      ...(payload.profil ? { profil: payload.profil } : {}),
    },
  });
}

export function requestPasswordResetApi(email: string) {
  return callApi<{ message: string }>("auth/mot-de-passe-oublie", {
    method: "POST",
    body: { courriel: email },
  });
}

export function resetPasswordApi(jeton: string, nouveauMotDePasse: string) {
  return callApi<{ message: string }>("auth/reinitialisation-mot-de-passe", {
    method: "POST",
    body: { jeton, nouveauMotDePasse },
  });
}

export function requestEmailVerificationApi(courriel: string) {
  return callApi<{ message: string }>("auth/verification-courriel", {
    method: "POST",
    body: { courriel },
  });
}

export function confirmEmailVerificationApi(courriel: string, code: string) {
  return callApi<{ message: string }>("auth/verification-courriel/confirmer", {
    method: "POST",
    body: { courriel, code },
  });
}

export function lookupActivationApi(jeton: string) {
  return callApi<ActivationInformation>(`auth/activation/${encodeURIComponent(jeton)}`);
}

export function activateAccountApi(jeton: string, payload: PasswordUpdatePayload) {
  return callApi<{ message: string }>("auth/activation/confirmer", {
    method: "POST",
    body: {
      jeton,
      nouveauMotDePasse: payload.nouveauMotDePasse,
      ...(payload.profil ? { profil: payload.profil } : {}),
    },
  });
}
