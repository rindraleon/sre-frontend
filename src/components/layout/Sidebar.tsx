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
  Mail,
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
  title: string;
  path: string;
  icon: LucideIcon;
}

export const ADMIN_MENU: MenuEntry[] = [
  { title: "Tableau de bord", path: "/admin", icon: Gauge },
  { title: "Contribuables", path: "/admin/contribuables", icon: Users },
  { title: "Entreprises", path: "/admin/entreprises", icon: Building2 },
  { title: "Comptes utilisateurs", path: "/admin/utilisateurs", icon: UserRound },
  { title: "Types d’impôts", path: "/admin/types-impots", icon: Calculator },
  { title: "Obligations fiscales", path: "/admin/obligations", icon: FileText },
  {
    title: "Vérification des paiements",
    path: "/admin/paiements-a-verifier",
    icon: ClipboardCheck,
  },
  { title: "Historique des paiements", path: "/admin/paiements", icon: ArrowLeftRight },
  { title: "Retards & notifications", path: "/admin/retards", icon: AlarmClock },
  { title: "Import Excel", path: "/admin/import-excel", icon: FileSpreadsheet },
  { title: "Rapports & statistiques", path: "/admin/rapports", icon: ChartNoAxesCombined },
  { title: "Journal d’activité", path: "/admin/journal", icon: Activity },
  { title: "Messages du site public", path: "/admin/messages-contact", icon: Mail },
];

export const CLIENT_MENU: MenuEntry[] = [
  { title: "Vue d’ensemble", path: "/client", icon: Gauge },
  { title: "Mes impôts", path: "/client/obligations", icon: Calculator },
  { title: "Déclarer un paiement", path: "/client/paiements/nouveau", icon: WalletCards },
  { title: "Historique des paiements", path: "/client/paiements", icon: ArrowLeftRight },
  { title: "Mes reçus", path: "/client/documents", icon: FileText },
  { title: "Notifications", path: "/client/notifications", icon: Bell },
  { title: "Profil fiscal", path: "/client/profil", icon: UserRound },
  { title: "Paramètres", path: "/client/parametres", icon: Settings },
];

export function Sidebar({
  isMobileMenuOpen,
  closeMobileMenu,
}: Readonly<{ isMobileMenuOpen: boolean; closeMobileMenu: () => void }>) {
  const { session } = useAuth();
  const { state } = useSre();
  if (!session) return null;
  const isAdmin = session.role === "ADMIN";
  const menus = isAdmin ? ADMIN_MENU : CLIENT_MENU;
  const unreadNotifications = state.notifications.filter(
    (notification) =>
      !notification.isRead &&
      (isAdmin
        ? notification.recipientRole === "ADMIN" ||
          notification.userId === session.userId
        : notification.userId === session.userId),
  ).length;
  const underReview = state.payments.filter(
    (payment) => payment.status === "EN_VERIFICATION",
  ).length;
  const validReceived = state.paymentDocuments.filter(
    (document) =>
      document.taxpayerId === session.taxpayerId && document.status === "VALIDE",
  ).length;
  const countFor = (title: string) => {
    switch (title) {
      case "Vérification des paiements":
        return underReview;
      case "Mes reçus":
        return validReceived;
      case "Notifications":
        return unreadNotifications;
      default:
        return 0;
    }
  };

  return (
    <>
      {isMobileMenuOpen && (
        <button
          className="menu-overlay-sre"
          aria-label="Fermer la navigation"
          onClick={closeMobileMenu}
        />
      )}
      <aside
        className={`sidebar-sre ${isMobileMenuOpen ? "sidebar-sre--mobile" : ""}`}
        aria-label="Barre latérale"
      >
        <Link
          className="brand-sre"
          to={isAdmin ? "/admin" : "/client"}
          onClick={closeMobileMenu}
        >
          <LogoSre size={32} subtitle="Entreprise Régional" />
        </Link>
        <button
          type="button"
          className="close-mobile-menu-sre"
          aria-label="Fermer le menu"
          onClick={closeMobileMenu}
        >
          <X size={18} />
        </button>
        <div className="menu-sre__label">{isAdmin ? "MENU FISCALE" : "CLIENT FISCAL"}</div>
        <nav className="navigation-sre" aria-label="Navigation principale">
          {menus.map(({ title, path, icon: Icon }) => {
            const counter = countFor(title);
            return (
              <NavLink
                key={path}
                end={path === "/admin" || path === "/client"}
                to={path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `navigation-sre__link ${isActive ? "navigation-sre__link--active" : ""}`
                }
              >
                <Icon size={17} aria-hidden="true" />
                <span>{title}</span>
                {counter > 0 && <i aria-label={`${counter} éléments`}>{counter}</i>}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
