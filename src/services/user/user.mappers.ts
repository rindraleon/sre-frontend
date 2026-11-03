import type { ApiUser, AppUser } from "@/types";

export function mapApiUser(user: ApiUser): AppUser {
  return {
    id: user.id,
    name: user.nom,
    email: user.courriel,
    role: user.role,
    taxpayerId: user.contribuableId,
    status: user.statut,
    mustChangePassword: user.changementMotDePasseRequis,
    isProfileComplete: user.profilComplete ?? true,
    isEmailVerified: user.courrielVerifie ?? false,
    createdAt: user.creeLe,
    lastLoginAt: user.derniereConnexion ?? undefined,
  };
}
