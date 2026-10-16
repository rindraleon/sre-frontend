/** Chemins de navigation du portail, centralisés (les segments dynamiques sont des fonctions). */

export const ROUTES = {
  accueil: "/accueil",
  connexion: "/connexion",
  inscription: "/inscription",
  motDePasseOublie: "/mot-de-passe-oublie",
  reinitialisationMotDePasse: "/reinitialisation-mot-de-passe",
  racineAdmin: "/admin",
  racineClient: "/client",
} as const;

export const ROUTES_ADMIN = {
  tableauDeBord: "/admin",
  contribuables: "/admin/contribuables",
  contribuable: (id: string) => `/admin/contribuables/${id}`,
  entreprises: "/admin/entreprises",
  entreprise: (id: string) => `/admin/entreprises/${id}`,
  utilisateurs: "/admin/utilisateurs",
  typesImpots: "/admin/types-impots",
  obligations: "/admin/obligations",
  paiements: "/admin/paiements",
  paiementsAVerifier: "/admin/paiements-a-verifier",
  paiement: (id: string) => `/admin/paiements/${id}`,
  importExcel: "/admin/import-excel",
  notifications: "/admin/notifications",
  rapports: "/admin/rapports",
  journal: "/admin/journal",
  parametres: "/admin/parametres",
  changementMotDePasse: "/admin/changement-mot-de-passe",
} as const;

export const ROUTES_CLIENT = {
  tableauDeBord: "/client",
  obligations: "/client/obligations",
  obligation: (id: string) => `/client/obligations/${id}`,
  paiements: "/client/paiements",
  nouveauPaiement: "/client/paiements/nouveau",
  paiement: (id: string) => `/client/paiements/${id}`,
  documents: "/client/documents",
  document: (id: string) => `/client/documents/${id}`,
  notifications: "/client/notifications",
  profil: "/client/profil",
  parametres: "/client/parametres",
  changementMotDePasse: "/client/changement-mot-de-passe",
} as const;
