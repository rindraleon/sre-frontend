import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ApiSession, RegistrationProfile } from "@/types/auth";
import type { UserRole, AppUser } from "@/types";
import type { ApiAuthResponse, ApiUser } from "@/types/api";
import { useSre, createEmptyState } from "@/context/SreContext";
import {
  isApiConfigured,
  callApi,
  loadApiState,
  ApiError,
  mapApiUser,
} from "@/services/api-client";
import { SRE_REGION } from "@/utils/constants";

const sessionKey = "sre-session-api-v1";
const sessionDuration = 4 * 60 * 60 * 1000;

interface SreRegistrationResult {
  role: UserRole;
  user: AppUser;
}
/** Profile body sent as-is to the API (initial-setup DTO): the field names are the JSON contract and must not be re. */
export interface InitialSetupProfilePayload {
  adresse?: string;
  ville?: string;
  telephone?: string;
  nomCommercial?: string;
}

interface AuthContextValue {
  session: ApiSession | null;
  isApiVerificationInProgress: boolean;
  apiVerificationError: string | null;
  retryApiVerification: () => void;
  logIn: (email: string, password: string) => Promise<ApiSession | null>;
  register: (profile: RegistrationProfile, password: string) => Promise<SreRegistrationResult>;
  logOut: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  completeInitialSetup: (
    currentPassword: string,
    newPassword: string,
    profile?: InitialSetupProfilePayload,
  ) => Promise<boolean>;
}

const Context = createContext<AuthContextValue | null>(null);

function readSession(): ApiSession | null {
  try {
    const value = window.sessionStorage.getItem(sessionKey);
    if (!value) return null;
    const session = JSON.parse(value) as ApiSession;
    if (
      !isApiConfigured ||
      !session.userId ||
      !session.apiToken ||
      !session.email ||
      !["ADMIN", "CLIENT"].includes(session.role) ||
      !Number.isFinite(session.expiresAt) ||
      session.expiresAt < Date.now()
    ) {
      window.sessionStorage.removeItem(sessionKey);
      return null;
    }
    return session;
  } catch {
    try {
      window.sessionStorage.removeItem(sessionKey);
    } catch {
      /* Session storage may be blocked by the browser. */
    }
    return null;
  }
}

function clearPersistedSession() {
  try {
    window.sessionStorage.removeItem(sessionKey);
  } catch {
    /* The in-memory session takes precedence. */
  }
}

function buildSession(user: AppUser, apiToken: string): ApiSession {
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    taxpayerId: user.taxpayerId,
    mustChangePassword: user.mustChangePassword,
    isProfileComplete: user.isProfileComplete ?? true,
    expiresAt: Date.now() + sessionDuration,
    apiMode: true,
    apiToken,
  };
}

function sessionFromApi(response: ApiAuthResponse) {
  const user = mapApiUser(response.utilisateur);
  return { user, session: buildSession(user, response.accessToken) };
}

function fullName(profile: RegistrationProfile) {
  return profile.type === "ENTREPRISE"
    ? profile.raisonSociale?.trim() || profile.nom.trim()
    : `${profile.prenom?.trim() ?? ""} ${profile.nom.trim()}`.trim();
}

function profileForApi(profile: RegistrationProfile) {
  if (profile.region.trim() !== SRE_REGION)
    throw new Error(`Le service est limité à la région ${SRE_REGION}.`);
  return {
    type: profile.type,
    nom: profile.nom.trim() || profile.raisonSociale?.trim() || "Contribuable",
    ...(profile.prenom?.trim() ? { prenom: profile.prenom.trim() } : {}),
    ...(profile.raisonSociale?.trim() ? { raisonSociale: profile.raisonSociale.trim() } : {}),
    ...(profile.nomCommercial?.trim() ? { nomCommercial: profile.nomCommercial.trim() } : {}),
    ...(profile.nif?.trim() ? { nif: profile.nif.trim() } : {}),
    ...(profile.stat?.trim() ? { stat: profile.stat.trim() } : {}),
    adresse: profile.adresse.trim(),
    region: SRE_REGION,
    ville: profile.ville.trim(),
    courriel: profile.courriel.trim().toLowerCase(),
    telephone: profile.telephone.trim(),
    ...(profile.representantLegal?.trim()
      ? { representantLegal: profile.representantLegal.trim() }
      : {}),
    ...(profile.nomContact?.trim() ? { nomContact: profile.nomContact.trim() } : {}),
    ...(profile.prenomContact?.trim() ? { prenomContact: profile.prenomContact.trim() } : {}),
    ...(profile.fonctionContact?.trim() ? { fonctionContact: profile.fonctionContact.trim() } : {}),
  };
}

function persistSession(session: ApiSession) {
  try {
    window.sessionStorage.setItem(sessionKey, JSON.stringify(session));
  } catch {
    /* The session remains available in memory. */
  }
}

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { updateState, notify } = useSre();
  const [session, setSession] = useState<ApiSession | null>(() => readSession());
  const [isApiVerificationInProgress, setIsApiVerificationInProgress] = useState(
    () => isApiConfigured && Boolean(readSession()),
  );
  const [apiVerificationError, setApiVerificationError] = useState<string | null>(null);
  const [apiVerificationAttempt, setApiVerificationAttempt] = useState(0);
  const currentApiToken = session?.apiToken;

  const retryApiVerification = useCallback(() => {
    setApiVerificationError(null);
    setIsApiVerificationInProgress(true);
    setApiVerificationAttempt((attempt) => attempt + 1);
  }, []);

  useEffect(() => {
    const invalidateSession = () => {
      clearPersistedSession();
      updateState(() => createEmptyState());
      setSession(null);
      setApiVerificationError(null);
      setIsApiVerificationInProgress(false);
      notify("Votre session serveur a expiré. Reconnectez-vous.", "warning");
    };
    window.addEventListener("sre:session-invalidated", invalidateSession);
    return () => window.removeEventListener("sre:session-invalidated", invalidateSession);
  }, [updateState, notify]);

  useEffect(() => {
    if (!isApiConfigured || !currentApiToken) {
      setIsApiVerificationInProgress(false);
      return;
    }
    let isActive = true;
    setIsApiVerificationInProgress(true);
    setApiVerificationError(null);
    const reloadSessionApi = async () => {
      try {
        const apiAccount = await callApi<ApiUser>("auth/moi", {
          token: currentApiToken,
        });
        const user = mapApiUser(apiAccount);
        const configurationRequired =
          user.mustChangePassword || user.isProfileComplete === false;
        const apiState = configurationRequired
          ? {}
          : await loadApiState(currentApiToken, user.role, apiAccount);
        if (!isActive) return;
        updateState(() => ({ ...createEmptyState(), ...apiState }));
        const updatedSession = buildSession(user, currentApiToken);
        persistSession(updatedSession);
        setSession(updatedSession);
      } catch (cause) {
        if (!isActive) return;
        if (cause instanceof ApiError && cause.httpStatus === 401) return;
        setApiVerificationError(
          cause instanceof Error ? cause.message : "Impossible de charger les données du serveur.",
        );
      } finally {
        if (isActive) setIsApiVerificationInProgress(false);
      }
    };
    void reloadSessionApi();
    return () => {
      isActive = false;
    };
  }, [currentApiToken, apiVerificationAttempt, updateState]);

  const logIn = useCallback(
    async (email: string, password: string) => {
      if (!isApiConfigured)
        throw new Error(
          "Le service serveur n’est pas configuré. Aucun mode de connexion local n’est disponible.",
        );
      const response = await callApi<ApiAuthResponse>("auth/connexion", {
        method: "POST",
        body: {
          courriel: email.trim().toLowerCase(),
          motDePasse: password,
        },
      });
      const { session: newSession } = sessionFromApi(response);
      updateState(() => createEmptyState());
      setApiVerificationError(null);
      setIsApiVerificationInProgress(true);
      persistSession(newSession);
      setSession(newSession);
      return newSession;
    },
    [updateState],
  );

  const register = useCallback(
    async (profile: RegistrationProfile, password: string) => {
      if (!isApiConfigured)
        throw new Error(
          "Le service serveur n’est pas configuré; la création locale de compte est désactivée.",
        );
      const email = profile.courriel.trim().toLowerCase();
      const registrationState = await callApi<{ administrateurInitialise: boolean }>(
        "auth/etat-inscription",
      );
      const isFirstAdministrator = !registrationState.administrateurInitialise;
      const body = {
        nom: fullName(profile),
        courriel: email,
        motDePasse: password,
        ...(!isFirstAdministrator ? { profil: profileForApi(profile) } : {}),
      };
      const response = await callApi<ApiAuthResponse>("auth/inscription", {
        method: "POST",
        body: body,
      });
      const { user, session: newSession } = sessionFromApi(response);
      updateState(() => createEmptyState());
      setApiVerificationError(null);
      setIsApiVerificationInProgress(true);
      persistSession(newSession);
      setSession(newSession);
      return { role: user.role, user };
    },
    [updateState],
  );

  const logOut = useCallback(() => {
    clearPersistedSession();
    updateState(() => createEmptyState());
    setSession(null);
    setApiVerificationError(null);
    setIsApiVerificationInProgress(false);
  }, [updateState]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!isApiConfigured || !session?.apiToken)
        throw new Error("Une session serveur est nécessaire pour modifier le mot de passe.");
      await callApi<{ message: string }>("auth/mot-de-passe", {
        method: "PATCH",
        token: session.apiToken,
        body: { motDePasseActuel: currentPassword, nouveauMotDePasse: newPassword },
      });
      const updatedSession = {
        ...session,
        changementMotDePasseRequis: false,
        expireLe: Date.now() + sessionDuration,
      };
      persistSession(updatedSession);
      setSession(updatedSession);
      return true;
    },
    [session],
  );

  const completeInitialSetup = useCallback(
    async (
      currentPassword: string,
      newPassword: string,
      profile?: InitialSetupProfilePayload,
    ) => {
      if (!isApiConfigured || !session?.apiToken)
        throw new Error("Une session serveur est nécessaire pour la configuration initiale.");
      await callApi<{ message: string }>("auth/configuration-initiale", {
        method: "POST",
        token: session.apiToken,
        body: {
          motDePasseActuel: currentPassword,
          nouveauMotDePasse: newPassword,
          ...(profile ? { profil: profile } : {}),
        },
      });
      const updatedSession = {
        ...session,
        changementMotDePasseRequis: false,
        profilComplete: true,
        expireLe: Date.now() + sessionDuration,
      };
      persistSession(updatedSession);
      setSession(updatedSession);
      return true;
    },
    [session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isApiVerificationInProgress,
      apiVerificationError,
      retryApiVerification,
      logIn,
      register,
      logOut,
      changePassword,
      completeInitialSetup,
    }),
    [
      session,
      isApiVerificationInProgress,
      apiVerificationError,
      retryApiVerification,
      logIn,
      register,
      logOut,
      changePassword,
      completeInitialSetup,
    ],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(Context);
  if (!context) throw new Error("useAuth doit être utilisé dans AuthProvider.");
  return context;
}

export function roleHomePath(role: UserRole) {
  return role === "ADMIN" ? "/admin" : "/client";
}

export function pathMatchesRole(path: string, role: UserRole) {
  return role === "ADMIN"
    ? path === "/admin" || path.startsWith("/admin/")
    : path === "/client" || path.startsWith("/client/");
}
