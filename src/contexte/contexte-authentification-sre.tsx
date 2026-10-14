import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ProfilInscriptionSre, RoleSre, TypeContribuable, UtilisateurSre } from "@/types/sre";
import { utiliserSre, creerEtatVideSre } from "@/contexte/contexte-sre";
import {
  apiSreConfiguree,
  appelerApiSre,
  chargerEtatApiSre,
  ErreurApiSre,
  mapperUtilisateur,
  type ReponseAuthentificationApiSre,
  type UtilisateurApiSre,
} from "@/services/api-sre";
import { REGION_SRE } from "@/utilitaires/constantes-sre";

const cleSession = "sre-session-api-v1";
const dureeSession = 4 * 60 * 60 * 1000;

export interface SessionApiSre {
  utilisateurId: string;
  nom: string;
  courriel: string;
  role: RoleSre;
  contribuableId?: string;
  changementMotDePasseRequis: boolean;
  expireLe: number;
  modeApi: true;
  jetonApi: string;
}

interface ResultatInscriptionSre {
  role: RoleSre;
  utilisateur: UtilisateurSre;
}
interface ContexteAuthentificationSre {
  session: SessionApiSre | null;
  verificationApiEnCours: boolean;
  erreurVerificationApi: string | null;
  reessayerVerificationApi: () => void;
  connecter: (courriel: string, motDePasse: string) => Promise<SessionApiSre | null>;
  inscrire: (profil: ProfilInscriptionSre, motDePasse: string) => Promise<ResultatInscriptionSre>;
  deconnecter: () => void;
  changerMotDePasse: (ancienMotDePasse: string, nouveauMotDePasse: string) => Promise<boolean>;
}

const Contexte = createContext<ContexteAuthentificationSre | null>(null);

function lireSession(): SessionApiSre | null {
  try {
    const valeur = window.sessionStorage.getItem(cleSession);
    if (!valeur) return null;
    const session = JSON.parse(valeur) as SessionApiSre;
    if (
      !apiSreConfiguree ||
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

function construireSession(utilisateur: UtilisateurSre, jetonApi: string): SessionApiSre {
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

function sessionDepuisApi(reponse: ReponseAuthentificationApiSre) {
  const utilisateur = mapperUtilisateur(reponse.utilisateur);
  return { utilisateur, session: construireSession(utilisateur, reponse.accessToken) };
}

function nomComplet(profil: ProfilInscriptionSre) {
  return profil.type === "ENTREPRISE"
    ? profil.raisonSociale?.trim() || profil.nom.trim()
    : `${profil.prenom?.trim() ?? ""} ${profil.nom.trim()}`.trim();
}

function profilPourApi(profil: ProfilInscriptionSre) {
  if (profil.region.trim() !== REGION_SRE)
    throw new Error(`Le service est limité à la région ${REGION_SRE}.`);
  return {
    type: profil.type,
    nom: profil.nom.trim() || profil.raisonSociale?.trim() || "Contribuable",
    ...(profil.prenom?.trim() ? { prenom: profil.prenom.trim() } : {}),
    ...(profil.raisonSociale?.trim() ? { raisonSociale: profil.raisonSociale.trim() } : {}),
    ...(profil.nomCommercial?.trim() ? { nomCommercial: profil.nomCommercial.trim() } : {}),
    ...(profil.nif?.trim() ? { nif: profil.nif.trim() } : {}),
    ...(profil.stat?.trim() ? { stat: profil.stat.trim() } : {}),
    adresse: profil.adresse.trim(),
    region: REGION_SRE,
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

function sessionPersistee(session: SessionApiSre) {
  try {
    window.sessionStorage.setItem(cleSession, JSON.stringify(session));
  } catch {
    /* La session reste disponible en mémoire. */
  }
}

export function FournisseurAuthentificationSre({ children }: { children: React.ReactNode }) {
  const { mettreAJourEtat, notifier } = utiliserSre();
  const [session, definirSession] = useState<SessionApiSre | null>(() => lireSession());
  const [verificationApiEnCours, definirVerificationApiEnCours] = useState(
    () => apiSreConfiguree && Boolean(lireSession()),
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
      mettreAJourEtat(() => creerEtatVideSre());
      definirSession(null);
      definirErreurVerificationApi(null);
      definirVerificationApiEnCours(false);
      notifier("Votre session serveur a expiré. Reconnectez-vous.", "avertissement");
    };
    window.addEventListener("sre:session-invalidee", invaliderSession);
    return () => window.removeEventListener("sre:session-invalidee", invaliderSession);
  }, [mettreAJourEtat, notifier]);

  useEffect(() => {
    if (!apiSreConfiguree || !jetonApiCourant) {
      definirVerificationApiEnCours(false);
      return;
    }
    let actif = true;
    definirVerificationApiEnCours(true);
    definirErreurVerificationApi(null);
    const rechargerSessionApi = async () => {
      try {
        const compteApi = await appelerApiSre<UtilisateurApiSre>("auth/moi", {
          token: jetonApiCourant,
        });
        const utilisateur = mapperUtilisateur(compteApi);
        const etatApi = await chargerEtatApiSre(jetonApiCourant, utilisateur.role, compteApi);
        if (!actif) return;
        mettreAJourEtat(() => ({ ...creerEtatVideSre(), ...etatApi }));
        const sessionMiseAJour = construireSession(utilisateur, jetonApiCourant);
        sessionPersistee(sessionMiseAJour);
        definirSession(sessionMiseAJour);
      } catch (cause) {
        if (!actif) return;
        if (cause instanceof ErreurApiSre && cause.statutHttp === 401) return;
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
      if (!apiSreConfiguree)
        throw new Error(
          "Le service serveur n’est pas configuré. Aucun mode de connexion local n’est disponible.",
        );
      const reponse = await appelerApiSre<ReponseAuthentificationApiSre>("auth/connexion", {
        method: "POST",
        body: { courriel: courriel.trim().toLowerCase(), motDePasse },
      });
      const { session: sessionNouvelle } = sessionDepuisApi(reponse);
      mettreAJourEtat(() => creerEtatVideSre());
      definirErreurVerificationApi(null);
      definirVerificationApiEnCours(true);
      sessionPersistee(sessionNouvelle);
      definirSession(sessionNouvelle);
      return sessionNouvelle;
    },
    [mettreAJourEtat],
  );

  const inscrire = useCallback(
    async (profil: ProfilInscriptionSre, motDePasse: string) => {
      if (!apiSreConfiguree)
        throw new Error(
          "Le service serveur n’est pas configuré; la création locale de compte est désactivée.",
        );
      const email = profil.courriel.trim().toLowerCase();
      const etatInscription = await appelerApiSre<{ administrateurInitialise: boolean }>(
        "auth/etat-inscription",
      );
      const premierAdministrateur = !etatInscription.administrateurInitialise;
      const corps = {
        nom: nomComplet(profil),
        courriel: email,
        motDePasse,
        ...(!premierAdministrateur ? { profil: profilPourApi(profil) } : {}),
      };
      const reponse = await appelerApiSre<ReponseAuthentificationApiSre>("auth/inscription", {
        method: "POST",
        body: corps,
      });
      const { utilisateur, session: sessionNouvelle } = sessionDepuisApi(reponse);
      mettreAJourEtat(() => creerEtatVideSre());
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
    mettreAJourEtat(() => creerEtatVideSre());
    definirSession(null);
    definirErreurVerificationApi(null);
    definirVerificationApiEnCours(false);
  }, [mettreAJourEtat]);

  const changerMotDePasse = useCallback(
    async (ancienMotDePasse: string, nouveauMotDePasse: string) => {
      if (!apiSreConfiguree || !session?.jetonApi)
        throw new Error("Une session serveur est nécessaire pour modifier le mot de passe.");
      await appelerApiSre<{ message: string }>("auth/mot-de-passe", {
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

export function utiliserAuthentificationSre(): ContexteAuthentificationSre {
  const contexte = useContext(Contexte);
  if (!contexte)
    throw new Error(
      "utiliserAuthentificationSre doit être utilisé dans FournisseurAuthentificationSre.",
    );
  return contexte;
}

export function destinationRoleSre(role: RoleSre) {
  return role === "ADMIN" ? "/admin" : "/client";
}

export function correspondRoleSre(chemin: string, role: RoleSre) {
  return role === "ADMIN"
    ? chemin === "/admin" || chemin.startsWith("/admin/")
    : chemin === "/client" || chemin.startsWith("/client/");
}

export function regionListeSre(): string[] {
  return [REGION_SRE];
}

export function typesContribuablesSre(): TypeContribuable[] {
  return ["PARTICULIER", "ENTREPRISE"];
}
