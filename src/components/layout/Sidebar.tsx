import { Link, NavLink } from "react-router-dom";
import {
  Activity,
  AlarmClock,
  ArrowLeftRight,
  Bell,
  Building2,
  Calculator,
  ChartNoAxesCombined,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  Gauge,
  Settings,
  Users,
  UserRound,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { LogoSre } from "@/assets/icons/logo-sre";

export interface MenuEntry {
  titre: string;
  chemin: string;
  icone: LucideIcon;
}

export const ADMIN_MENU: MenuEntry[] = [
  { titre: "Tableau de bord", chemin: "/admin", icone: Gauge },
  { titre: "Contribuables", chemin: "/admin/contribuables", icone: Users },
  { titre: "Entreprises", chemin: "/admin/entreprises", icone: Building2 },
  { titre: "Comptes utilisateurs", chemin: "/admin/utilisateurs", icone: UserRound },
  { titre: "Types d’impôts", chemin: "/admin/types-impots", icone: Calculator },
  { titre: "Obligations fiscales", chemin: "/admin/obligations", icone: FileText },
  {
    titre: "Vérification des paiements",
    chemin: "/admin/paiements-a-verifier",
    icone: ClipboardCheck,
  },
  { titre: "Historique des paiements", chemin: "/admin/paiements", icone: ArrowLeftRight },
  { titre: "Retards & notifications", chemin: "/admin/retards", icone: AlarmClock },
  { titre: "Import Excel", chemin: "/admin/import-excel", icone: FileSpreadsheet },
  { titre: "Rapports & statistiques", chemin: "/admin/rapports", icone: ChartNoAxesCombined },
  { titre: "Journal d’activité", chemin: "/admin/journal", icone: Activity },
];

export const CLIENT_MENU: MenuEntry[] = [
  { titre: "Vue d’ensemble", chemin: "/client", icone: Gauge },
  { titre: "Mes impôts", chemin: "/client/obligations", icone: Calculator },
  { titre: "Déclarer un paiement", chemin: "/client/paiements/nouveau", icone: WalletCards },
  { titre: "Historique des paiements", chemin: "/client/paiements", icone: ArrowLeftRight },
  { titre: "Mes reçus", chemin: "/client/documents", icone: FileText },
  { titre: "Notifications", chemin: "/client/notifications", icone: Bell },
  { titre: "Profil fiscal", chemin: "/client/profil", icone: UserRound },
  { titre: "Paramètres", chemin: "/client/parametres", icone: Settings },
];

export function Sidebar({
  menuMobileOuvert,
  fermerMenuMobile,
}: Readonly<{ menuMobileOuvert: boolean; fermerMenuMobile: () => void }>) {
  const { session } = useAuth();
  const { etat } = useSre();
  if (!session) return null;
  const estAdmin = session.role === "ADMIN";
  const menus = estAdmin ? ADMIN_MENU : CLIENT_MENU;
  const notificationsNonLues = etat.notifications.filter(
    (notification) =>
      !notification.lue &&
      (estAdmin
        ? notification.roleDestinataire === "ADMIN" ||
          notification.utilisateurId === session.utilisateurId
        : notification.utilisateurId === session.utilisateurId),
  ).length;
  const enVerification = etat.paiements.filter(
    (paiement) => paiement.statut === "EN_VERIFICATION",
  ).length;
  const recusValides = etat.documentsPaiement.filter(
    (document) =>
      document.contribuableId === session.contribuableId && document.statut === "VALIDE",
  ).length;
  const compteurPour = (titre: string) => {
    switch (titre) {
      case "Vérification des paiements":
        return enVerification;
      case "Mes reçus":
        return recusValides;
      case "Notifications":
        return notificationsNonLues;
      default:
        return 0;
    }
  };

  return (
    <>
      {menuMobileOuvert && (
        <button
          className="voile-menu-sre"
          aria-label="Fermer la navigation"
          onClick={fermerMenuMobile}
        />
      )}
      <aside
        className={`barre-laterale-sre ${menuMobileOuvert ? "barre-laterale-sre--mobile" : ""}`}
        aria-label="Barre latérale"
      >
        <Link
          className="marque-sre"
          to={estAdmin ? "/admin" : "/client"}
          onClick={fermerMenuMobile}
        >
          <LogoSre taille={32} sousTitre="Entreprise Régional" />
        </Link>
        <button
          type="button"
          className="fermer-menu-mobile-sre"
          aria-label="Fermer le menu"
          onClick={fermerMenuMobile}
        >
          <X size={18} />
        </button>
        <div className="menu-sre__label">{estAdmin ? "MENU FISCALE" : "CLIENT FISCAL"}</div>
        <nav className="navigation-sre" aria-label="Navigation principale">
          {menus.map(({ titre, chemin, icone: Icone }) => {
            const compteur = compteurPour(titre);
            return (
              <NavLink
                key={chemin}
                end={chemin === "/admin" || chemin === "/client"}
                to={chemin}
                onClick={fermerMenuMobile}
                className={({ isActive }) =>
                  `navigation-sre__lien ${isActive ? "navigation-sre__lien--actif" : ""}`
                }
              >
                <Icone size={17} aria-hidden="true" />
                <span>{titre}</span>
                {compteur > 0 && <i aria-label={`${compteur} éléments`}>{compteur}</i>}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
