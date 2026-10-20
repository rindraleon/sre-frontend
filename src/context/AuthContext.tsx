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

const cleSession = "sre-session-api-v1";
const dureeSession = 4 * 60 * 60 * 1000;

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
  configurerPremiereConnexion: (
    motDePasseActuel: string,
    nouveauMotDePasse: string,
    profil?: { adresse?: string; ville?: string; telephone?: string; nomCommercial?: string },
  ) => Promise<boolean>;
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
    profilComplete: utilisateur.profilComplete ?? true,
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

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { mettreAJourEtat, notifier } = useSre();
  const [session, setSession] = useState<ApiSession | null>(() => lireSession());
  const [verificationApiEnCours, setVerificationApiEnCours] = useState(
    () => isApiConfigured && Boolean(lireSession()),
  );
  const [erreurVerificationApi, setErreurVerificationApi] = useState<string | null>(null);
  const [tentativeVerificationApi, setTentativeVerificationApi] = useState(0);
  const jetonApiCourant = session?.jetonApi;

  const reessayerVerificationApi = useCallback(() => {
    setErreurVerificationApi(null);
    setVerificationApiEnCours(true);
    setTentativeVerificationApi((tentative) => tentative + 1);
  }, []);

  useEffect(() => {
    const invaliderSession = () => {
      effacerSessionPersistante();
      mettreAJourEtat(() => createEmptyState());
      setSession(null);
      setErreurVerificationApi(null);
      setVerificationApiEnCours(false);
      notifier("Votre session serveur a expiré. Reconnectez-vous.", "avertissement");
    };
    window.addEventListener("sre:session-invalidee", invaliderSession);
    return () => window.removeEventListener("sre:session-invalidee", invaliderSession);
  }, [mettreAJourEtat, notifier]);

  useEffect(() => {
    if (!isApiConfigured || !jetonApiCourant) {
      setVerificationApiEnCours(false);
      return;
    }
    let actif = true;
    setVerificationApiEnCours(true);
    setErreurVerificationApi(null);
    const rechargerSessionApi = async () => {
      try {
        const compteApi = await callApi<ApiUser>("auth/moi", {
          token: jetonApiCourant,
        });
        const utilisateur = mapApiUser(compteApi);
        const configurationRequise =
          utilisateur.changementMotDePasseRequis || utilisateur.profilComplete === false;
        const etatApi = configurationRequise
          ? {}
          : await loadApiState(jetonApiCourant, utilisateur.role, compteApi);
        if (!actif) return;
        mettreAJourEtat(() => ({ ...createEmptyState(), ...etatApi }));
        const sessionMiseAJour = construireSession(utilisateur, jetonApiCourant);
        sessionPersistee(sessionMiseAJour);
        setSession(sessionMiseAJour);
      } catch (cause) {
        if (!actif) return;
        if (cause instanceof ApiError && cause.statutHttp === 401) return;
        setErreurVerificationApi(
          cause instanceof Error ? cause.message : "Impossible de charger les données du serveur.",
        );
      } finally {
        if (actif) setVerificationApiEnCours(false);
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
        body: {
          courriel: courriel.trim().toLowerCase(),
          motDePasse,
        },
      });
      const { session: sessionNouvelle } = sessionDepuisApi(reponse);
      mettreAJourEtat(() => createEmptyState());
      setErreurVerificationApi(null);
      setVerificationApiEnCours(true);
      sessionPersistee(sessionNouvelle);
      setSession(sessionNouvelle);
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
      setErreurVerificationApi(null);
      setVerificationApiEnCours(true);
      sessionPersistee(sessionNouvelle);
      setSession(sessionNouvelle);
      return { role: utilisateur.role, utilisateur };
    },
    [mettreAJourEtat],
  );

  const deconnecter = useCallback(() => {
    effacerSessionPersistante();
    mettreAJourEtat(() => createEmptyState());
    setSession(null);
    setErreurVerificationApi(null);
    setVerificationApiEnCours(false);
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
      setSession(sessionMiseAJour);
      return true;
    },
    [session],
  );

  const configurerPremiereConnexion = useCallback(
    async (
      motDePasseActuel: string,
      nouveauMotDePasse: string,
      profil?: { adresse?: string; ville?: string; telephone?: string; nomCommercial?: string },
    ) => {
      if (!isApiConfigured || !session?.jetonApi)
        throw new Error("Une session serveur est nécessaire pour la configuration initiale.");
      await callApi<{ message: string }>("auth/configuration-initiale", {
        method: "POST",
        token: session.jetonApi,
        body: {
          motDePasseActuel,
          nouveauMotDePasse,
          ...(profil ? { profil } : {}),
        },
      });
      const sessionMiseAJour = {
        ...session,
        changementMotDePasseRequis: false,
        profilComplete: true,
        expireLe: Date.now() + dureeSession,
      };
      sessionPersistee(sessionMiseAJour);
      setSession(sessionMiseAJour);
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
      configurerPremiereConnexion,
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
      configurerPremiereConnexion,
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
