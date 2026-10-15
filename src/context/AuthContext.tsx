import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { RegistrationProfile, UserRole, TaxpayerType, AppUser } from "@/types/models";
import { useSre, createEmptyState } from "@/context/SreContext";
import {
  isApiConfigured,
  callApi,
  loadApiState,
  ApiError,
  mapApiUser,
  type ApiAuthResponse,
  type ApiUser,
} from "@/services/api";
import { SRE_REGION } from "@/utils/constants";

const cleSession = "sre-session-api-v1";
const dureeSession = 4 * 60 * 60 * 1000;

export interface ApiSession {
  utilisateurId: string;
  nom: string;
  courriel: string;
  role: UserRole;
  contribuableId?: string;
  changementMotDePasseRequis: boolean;
  expireLe: number;
  modeApi: true;
  jetonApi: string;
}

interface ResultatInscriptionSre {
  role: UserRole;
  utilisateur: AppUser;
}
interface AuthContextValue {
  session: ApiSession | null;
  verificationApiEnCours: boolean;
  erreurVerificationApi: string | null;
  reessayerVerificationApi: () => void;
  connecter: (courriel: string, motDePasse: string) => Promise<ApiSession | null>;
  inscrire: (profil: RegistrationProfile, motDePasse: string) => Promise<ResultatInscriptionSre>;
  deconnecter: () => void;
  changerMotDePasse: (ancienMotDePasse: string, nouveauMotDePasse: string) => Promise<boolean>;
}

const Contexte = createContext<AuthContextValue | null>(null);

function lireSession(): ApiSession | null {
  try {
    const valeur = window.sessionStorage.getItem(cleSession);
    if (!valeur) return null;
    const session = JSON.parse(valeur) as ApiSession;
    if (
      !isApiConfigured ||
      !session.utilisateurId ||
      !session.jetonApi ||
      !session.courriel ||
      !["ADMIN", "CLIENT"].includes(session.role) ||
      !Number.isFinite(session.expireLe) ||
      session.expireLe < Date.now()
    ) {
      window.sessionStorage.removeItem(cleSession);
      return null;
    }
    return session;
  } catch {
    try {
      window.sessionStorage.removeItem(cleSession);
    } catch {
      /* Le stockage de session peut être bloqué par le navigateur. */
    }
    return null;
  }
}

function effacerSessionPersistante() {
  try {
    window.sessionStorage.removeItem(cleSession);
  } catch {
    /* La session mémoire reste prioritaire. */
  }
}

function construireSession(utilisateur: AppUser, jetonApi: string): ApiSession {
  return {
    utilisateurId: utilisateur.id,
    nom: utilisateur.nom,
    courriel: utilisateur.courriel,
    role: utilisateur.role,
    contribuableId: utilisateur.contribuableId,
    changementMotDePasseRequis: utilisateur.changementMotDePasseRequis,
    expireLe: Date.now() + dureeSession,
    modeApi: true,
    jetonApi,
  };
}

function sessionDepuisApi(reponse: ApiAuthResponse) {
  const utilisateur = mapApiUser(reponse.utilisateur);
  return { utilisateur, session: construireSession(utilisateur, reponse.accessToken) };
}

function nomComplet(profil: RegistrationProfile) {
  return profil.type === "ENTREPRISE"
    ? profil.raisonSociale?.trim() || profil.nom.trim()
    : `${profil.prenom?.trim() ?? ""} ${profil.nom.trim()}`.trim();
}

function profilPourApi(profil: RegistrationProfile) {
  if (profil.region.trim() !== SRE_REGION)
    throw new Error(`Le service est limité à la région ${SRE_REGION}.`);
  return {
    type: profil.type,
    nom: profil.nom.trim() || profil.raisonSociale?.trim() || "Contribuable",
    ...(profil.prenom?.trim() ? { prenom: profil.prenom.trim() } : {}),
    ...(profil.raisonSociale?.trim() ? { raisonSociale: profil.raisonSociale.trim() } : {}),
    ...(profil.nomCommercial?.trim() ? { nomCommercial: profil.nomCommercial.trim() } : {}),
    ...(profil.nif?.trim() ? { nif: profil.nif.trim() } : {}),
    ...(profil.stat?.trim() ? { stat: profil.stat.trim() } : {}),
    adresse: profil.adresse.trim(),
    region: SRE_REGION,
    ville: profil.ville.trim(),
    courriel: profil.courriel.trim().toLowerCase(),
    telephone: profil.telephone.trim(),
    ...(profil.representantLegal?.trim()
      ? { representantLegal: profil.representantLegal.trim() }
      : {}),
    ...(profil.nomContact?.trim() ? { nomContact: profil.nomContact.trim() } : {}),
    ...(profil.prenomContact?.trim() ? { prenomContact: profil.prenomContact.trim() } : {}),
    ...(profil.fonctionContact?.trim() ? { fonctionContact: profil.fonctionContact.trim() } : {}),
  };
}

function sessionPersistee(session: ApiSession) {
  try {
    window.sessionStorage.setItem(cleSession, JSON.stringify(session));
  } catch {
    /* La session reste disponible en mémoire. */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { mettreAJourEtat, notifier } = useSre();
  const [session, definirSession] = useState<ApiSession | null>(() => lireSession());
  const [verificationApiEnCours, definirVerificationApiEnCours] = useState(
    () => isApiConfigured && Boolean(lireSession()),
  );
  const [erreurVerificationApi, definirErreurVerificationApi] = useState<string | null>(null);
  const [tentativeVerificationApi, definirTentativeVerificationApi] = useState(0);
  const jetonApiCourant = session?.jetonApi;

  const reessayerVerificationApi = useCallback(() => {
    definirErreurVerificationApi(null);
    definirVerificationApiEnCours(true);
    definirTentativeVerificationApi((tentative) => tentative + 1);
  }, []);

  useEffect(() => {
    const invaliderSession = () => {
      effacerSessionPersistante();
      mettreAJourEtat(() => createEmptyState());
      definirSession(null);
      definirErreurVerificationApi(null);
      definirVerificationApiEnCours(false);
      notifier("Votre session serveur a expiré. Reconnectez-vous.", "avertissement");
    };
    window.addEventListener("sre:session-invalidee", invaliderSession);
    return () => window.removeEventListener("sre:session-invalidee", invaliderSession);
  }, [mettreAJourEtat, notifier]);

  useEffect(() => {
    if (!isApiConfigured || !jetonApiCourant) {
      definirVerificationApiEnCours(false);
      return;
    }
    let actif = true;
    definirVerificationApiEnCours(true);
    definirErreurVerificationApi(null);
    const rechargerSessionApi = async () => {
      try {
        const compteApi = await callApi<ApiUser>("auth/moi", {
          token: jetonApiCourant,
        });
        const utilisateur = mapApiUser(compteApi);
        const etatApi = await loadApiState(jetonApiCourant, utilisateur.role, compteApi);
        if (!actif) return;
        mettreAJourEtat(() => ({ ...createEmptyState(), ...etatApi }));
        const sessionMiseAJour = construireSession(utilisateur, jetonApiCourant);
        sessionPersistee(sessionMiseAJour);
        definirSession(sessionMiseAJour);
      } catch (cause) {
        if (!actif) return;
        if (cause instanceof ApiError && cause.statutHttp === 401) return;
        definirErreurVerificationApi(
          cause instanceof Error ? cause.message : "Impossible de charger les données du serveur.",
        );
      } finally {
        if (actif) definirVerificationApiEnCours(false);
      }
    };
    void rechargerSessionApi();
    return () => {
      actif = false;
    };
  }, [jetonApiCourant, tentativeVerificationApi, mettreAJourEtat]);

  const connecter = useCallback(
    async (courriel: string, motDePasse: string) => {
      if (!isApiConfigured)
        throw new Error(
          "Le service serveur n’est pas configuré. Aucun mode de connexion local n’est disponible.",
        );
      const reponse = await callApi<ApiAuthResponse>("auth/connexion", {
        method: "POST",
        body: { courriel: courriel.trim().toLowerCase(), motDePasse },
      });
      const { session: sessionNouvelle } = sessionDepuisApi(reponse);
      mettreAJourEtat(() => createEmptyState());
      definirErreurVerificationApi(null);
      definirVerificationApiEnCours(true);
      sessionPersistee(sessionNouvelle);
      definirSession(sessionNouvelle);
      return sessionNouvelle;
    },
    [mettreAJourEtat],
  );

  const inscrire = useCallback(
    async (profil: RegistrationProfile, motDePasse: string) => {
      if (!isApiConfigured)
        throw new Error(
          "Le service serveur n’est pas configuré; la création locale de compte est désactivée.",
        );
      const email = profil.courriel.trim().toLowerCase();
      const etatInscription = await callApi<{ administrateurInitialise: boolean }>(
        "auth/etat-inscription",
      );
      const premierAdministrateur = !etatInscription.administrateurInitialise;
      const corps = {
        nom: nomComplet(profil),
        courriel: email,
        motDePasse,
        ...(!premierAdministrateur ? { profil: profilPourApi(profil) } : {}),
      };
      const reponse = await callApi<ApiAuthResponse>("auth/inscription", {
        method: "POST",
        body: corps,
      });
      const { utilisateur, session: sessionNouvelle } = sessionDepuisApi(reponse);
      mettreAJourEtat(() => createEmptyState());
      definirErreurVerificationApi(null);
      definirVerificationApiEnCours(true);
      sessionPersistee(sessionNouvelle);
      definirSession(sessionNouvelle);
      return { role: utilisateur.role, utilisateur };
    },
    [mettreAJourEtat],
  );

  const deconnecter = useCallback(() => {
    effacerSessionPersistante();
    mettreAJourEtat(() => createEmptyState());
    definirSession(null);
    definirErreurVerificationApi(null);
    definirVerificationApiEnCours(false);
  }, [mettreAJourEtat]);

  const changerMotDePasse = useCallback(
    async (ancienMotDePasse: string, nouveauMotDePasse: string) => {
      if (!isApiConfigured || !session?.jetonApi)
        throw new Error("Une session serveur est nécessaire pour modifier le mot de passe.");
      await callApi<{ message: string }>("auth/mot-de-passe", {
        method: "PATCH",
        token: session.jetonApi,
        body: { motDePasseActuel: ancienMotDePasse, nouveauMotDePasse },
      });
      const sessionMiseAJour = {
        ...session,
        changementMotDePasseRequis: false,
        expireLe: Date.now() + dureeSession,
      };
      sessionPersistee(sessionMiseAJour);
      definirSession(sessionMiseAJour);
      return true;
    },
    [session],
  );

  const valeur = useMemo(
    () => ({
      session,
      verificationApiEnCours,
      erreurVerificationApi,
      reessayerVerificationApi,
      connecter,
      inscrire,
      deconnecter,
      changerMotDePasse,
    }),
    [
      session,
      verificationApiEnCours,
      erreurVerificationApi,
      reessayerVerificationApi,
      connecter,
      inscrire,
      deconnecter,
      changerMotDePasse,
    ],
  );
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useAuth(): AuthContextValue {
  const contexte = useContext(Contexte);
  if (!contexte) throw new Error("useAuth doit être utilisé dans AuthProvider.");
  return contexte;
}

export function roleHomePath(role: UserRole) {
  return role === "ADMIN" ? "/admin" : "/client";
}

export function pathMatchesRole(chemin: string, role: UserRole) {
  return role === "ADMIN"
    ? chemin === "/admin" || chemin.startsWith("/admin/")
    : chemin === "/client" || chemin.startsWith("/client/");
}

export function regionList(): string[] {
  return [SRE_REGION];
}

export function taxpayerTypes(): TaxpayerType[] {
  return ["PARTICULIER", "ENTREPRISE"];
}
