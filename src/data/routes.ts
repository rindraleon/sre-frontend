export const ROUTES = {
  home: "/accueil",
  login: "/connexion",
  registration: "/inscription",
  forgotPassword: "/mot-de-passe-oublie",
  passwordReset: "/reinitialisation-mot-de-passe",
  adminRoot: "/admin",
  clientRoot: "/client",
} as const;

export const ROUTES_ADMIN = {
  dashboard: "/admin",
  taxpayers: "/admin/contribuables",
  taxpayer: (id: string) => `/admin/contribuables/${id}`,
  businesses: "/admin/entreprises",
  business: (id: string) => `/admin/entreprises/${id}`,
  users: "/admin/utilisateurs",
  taxTypes: "/admin/types-impots",
  obligations: "/admin/obligations",
  payments: "/admin/paiements",
  paymentsToVerify: "/admin/paiements-a-verifier",
  payment: (id: string) => `/admin/paiements/${id}`,
  excelImport: "/admin/import-excel",
  notifications: "/admin/notifications",
  reports: "/admin/rapports",
  activityLog: "/admin/journal",
  settings: "/admin/parametres",
  passwordChange: "/admin/changement-mot-de-passe",
} as const;

export const ROUTES_CLIENT = {
  dashboard: "/client",
  obligations: "/client/obligations",
  obligation: (id: string) => `/client/obligations/${id}`,
  payments: "/client/paiements",
  newPayment: "/client/paiements/nouveau",
  payment: (id: string) => `/client/paiements/${id}`,
  documents: "/client/documents",
  document: (id: string) => `/client/documents/${id}`,
  notifications: "/client/notifications",
  profile: "/client/profil",
  settings: "/client/parametres",
  passwordChange: "/client/changement-mot-de-passe",
} as const;
