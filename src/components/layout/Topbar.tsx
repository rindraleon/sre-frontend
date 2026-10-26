import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { useTheme } from "@/context/ThemeContext";
import { ConfirmDialog } from "@/components/ui";
import { getInitials } from "@/utils/format";

export function Topbar({
  unreadNotifications,
  unreadContactMessages = 0,
  openMobileMenu,
}: Readonly<{
  pageTitle: string;
  unreadNotifications: number;
  unreadContactMessages?: number;
  openMobileMenu: () => void;
}>) {
  const { session, logOut } = useAuth();
  const { notify } = useSre();
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [confirmationLogout, setConfirmationLogout] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setMenuOpen(false);
    };
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyboard);
    menuRef.current
      ?.querySelector<HTMLElement>("[role='menuitem'], [role='menuitemcheckbox']")
      ?.focus();
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyboard);
    };
  }, [isMenuOpen]);

  if (!session) return null;
  const isAdmin = session.role === "ADMIN";
  const rootPath = isAdmin ? "/admin" : "/client";
  const userInitials = getInitials(session.name) || "SRE";
  const isOnContactMessagesPage = location.pathname.startsWith(
    "/admin/messages-contact",
  );

  const handleLogout = () => {
    setMenuOpen(false);
    setConfirmationLogout(true);
  };

  const confirmLogout = () => {
    setConfirmationLogout(false);
    logOut();
    void navigation("/accueil", { replace: true });
    notify("Vous êtes déconnecté.", "info");
  };

  return (
    <header className="app-header-sre">
      <div className="app-header-sre__left">
        <button
          className="menu-button-sre"
          aria-label="Ouvrir le menu"
          onClick={openMobileMenu}
        >
          <Menu size={20} />
        </button>
        <div>
          <span>{isAdmin ? "Espace Administrateur" : "Espace client"}</span>
        </div>
      </div>
      <div className="app-header-sre__right">
        <Link
          className="notification-button-sre"
          to="/aide"
          aria-label="Aide et documentation"
          title="Aide"
        >
          <CircleHelp size={17} />
        </Link>
        {isAdmin && (
          <Link
            data-testid="topbar-contact-messages-link"
            className={`notification-button-sre ${
              isOnContactMessagesPage ? "notification-button-sre--active" : ""
            }`}
            to="/admin/messages-contact"
            aria-label={
              unreadContactMessages > 0
                ? `Messagerie de contact (${unreadContactMessages} non lus)`
                : "Messagerie de contact"
            }
            title={
              unreadContactMessages > 0
                ? `Messagerie de contact · ${unreadContactMessages} message(s) non lu(s)`
                : "Messagerie de contact (messages reçus)"
            }
          >
            <MessageSquare size={17} />
            {unreadContactMessages > 0 && (
              <i data-testid="topbar-contact-messages-badge">
                {unreadContactMessages}
              </i>
            )}
          </Link>
        )}
        <Link
          className="notification-button-sre"
          to={isAdmin ? "/admin/notifications" : "/client/notifications"}
          aria-label={`${unreadNotifications} notifications non lues`}
          title="Centre de notifications"
        >
          <Bell size={17} />
          {unreadNotifications > 0 && <i>{unreadNotifications}</i>}
        </Link>
        <div className="user-menu-sre" ref={menuRef}>
          <button
            ref={menuButtonRef}
            type="button"
            className="session-header-sre user-menu-button-sre"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-label={`Menu de ${session.name}`}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span aria-hidden="true">{userInitials}</span>
            <div>
              <strong>{session.name}</strong>
              <small>{isAdmin ? "Administrateur" : "Contribuable"}</small>
            </div>
            <ChevronDown size={14} aria-hidden="true" />
          </button>
          {isMenuOpen && (
            <div
              className="user-menu-sre__panel"
              role="menu"
              aria-label="Menu utilisateur"
            >
              <div className="user-menu-sre__identity">
                <strong>{session.name}</strong>
                <small>{session.email}</small>
                <small>{isAdmin ? "Administrateur" : "Contribuable"}</small>
              </div>
              {!isAdmin && (
                <Link
                  role="menuitem"
                  to="/client/profil"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserRound size={15} aria-hidden="true" /> Mon profil
                </Link>
              )}
              <Link
                role="menuitem"
                to={`${rootPath}/parametres`}
                onClick={() => setMenuOpen(false)}
              >
                <Settings size={15} aria-hidden="true" /> Paramètres
              </Link>
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={theme === "sombre"}
                onClick={() => {
                  toggleTheme();
                  setMenuOpen(false);
                  menuButtonRef.current?.focus();
                }}
              >
                {theme === "sombre" ? (
                  <Sun size={15} aria-hidden="true" />
                ) : (
                  <Moon size={15} aria-hidden="true" />
                )}
                {theme === "sombre" ? "Thème clair" : "Thème sombre"}
              </button>
              <Link role="menuitem" to="/aide" onClick={() => setMenuOpen(false)}>
                <CircleHelp size={15} aria-hidden="true" /> Aide
              </Link>
              <button type="button" role="menuitem" onClick={handleLogout}>
                <LogOut size={15} aria-hidden="true" /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={confirmationLogout}
        title="Se déconnecter ?"
        description="Voulez-vous vraiment vous déconnecter ?"
        close={() => setConfirmationLogout(false)}
        confirm={confirmLogout}
        confirmLabel="Confirmer la déconnexion"
      />
    </header>
  );
}
