import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LogOut,
  Menu,
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
  titrePage,
  notificationsNonLues,
  ouvrirMenuMobile,
}: Readonly<{
  titrePage: string;
  notificationsNonLues: number;
  ouvrirMenuMobile: () => void;
}>) {
  const { session, deconnecter } = useAuth();
  const { notifier } = useSre();
  const { theme, basculerTheme } = useTheme();
  const navigation = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [confirmationDeconnexion, setConfirmationDeconnexion] = useState(false);
  const refMenu = useRef<HTMLDivElement | null>(null);
  const refBoutonMenu = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!menuOuvert) return;
    const gererExterieur = (event: MouseEvent) => {
      if (refMenu.current && !refMenu.current.contains(event.target as Node))
        setMenuOuvert(false);
    };
    const gererClavier = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOuvert(false);
        refBoutonMenu.current?.focus();
      }
    };
    document.addEventListener("mousedown", gererExterieur);
    document.addEventListener("keydown", gererClavier);
    refMenu.current
      ?.querySelector<HTMLElement>("[role='menuitem'], [role='menuitemcheckbox']")
      ?.focus();
    return () => {
      document.removeEventListener("mousedown", gererExterieur);
      document.removeEventListener("keydown", gererClavier);
    };
  }, [menuOuvert]);

  if (!session) return null;
  const estAdmin = session.role === "ADMIN";
  const racine = estAdmin ? "/admin" : "/client";
  const initialesUtilisateur = getInitials(session.nom) || "SRE";

  const seDeconnecter = () => {
    setMenuOuvert(false);
    setConfirmationDeconnexion(true);
  };

  const confirmerDeconnexion = () => {
    setConfirmationDeconnexion(false);
    deconnecter();
    void navigation("/accueil", { replace: true });
    notifier("Vous êtes déconnecté.", "info");
  };

  return (
    <header className="entete-application-sre">
      <div className="entete-application-sre__gauche">
        <button className="bouton-menu-sre" aria-label="Ouvrir le menu" onClick={ouvrirMenuMobile}>
          <Menu size={20} />
        </button>
        <div>
          <span>{estAdmin ? "Espace Administrateur" : "Espace client"}</span>
          {/* <strong>{titrePage}</strong> */}
        </div>
      </div>
      <div className="entete-application-sre__droite">
        <Link
          className="bouton-notification-sre"
          to="/aide"
          aria-label="Aide et documentation"
          title="Aide"
        >
          <CircleHelp size={17} />
        </Link>
        <Link
          className="bouton-notification-sre"
          to={estAdmin ? "/admin/notifications" : "/client/notifications"}
          aria-label={`${notificationsNonLues} notifications non lues`}
        >
          <Bell size={17} />
          {notificationsNonLues > 0 && <i>{notificationsNonLues}</i>}
        </Link>
        <div className="menu-utilisateur-sre" ref={refMenu}>
          <button
            ref={refBoutonMenu}
            type="button"
            className="entete-session-sre bouton-menu-utilisateur-sre"
            aria-haspopup="menu"
            aria-expanded={menuOuvert}
            aria-label={`Menu de ${session.nom}`}
            onClick={() => setMenuOuvert((courant) => !courant)}
          >
            <span aria-hidden="true">{initialesUtilisateur}</span>
            <div>
              <strong>{session.nom}</strong>
              <small>{estAdmin ? "Administrateur" : "Contribuable"}</small>
            </div>
            <ChevronDown size={14} aria-hidden="true" />
          </button>
          {menuOuvert && (
            <div
              className="menu-utilisateur-sre__panneau"
              role="menu"
              aria-label="Menu utilisateur"
            >
              <div className="menu-utilisateur-sre__identite">
                <strong>{session.nom}</strong>
                {/* Affichés uniquement car réellement présents dans la session API. */}
                <small>{session.courriel}</small>
                <small>{estAdmin ? "Administrateur" : "Contribuable"}</small>
              </div>
              {!estAdmin && (
                <Link role="menuitem" to="/client/profil" onClick={() => setMenuOuvert(false)}>
                  <UserRound size={15} aria-hidden="true" /> Mon profil
                </Link>
              )}
              <Link
                role="menuitem"
                to={`${racine}/parametres`}
                onClick={() => setMenuOuvert(false)}
              >
                <Settings size={15} aria-hidden="true" /> Paramètres
              </Link>
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={theme === "sombre"}
                onClick={() => {
                  basculerTheme();
                  setMenuOuvert(false);
                  refBoutonMenu.current?.focus();
                }}
              >
                {theme === "sombre" ? (
                  <Sun size={15} aria-hidden="true" />
                ) : (
                  <Moon size={15} aria-hidden="true" />
                )}
                {theme === "sombre" ? "Thème clair" : "Thème sombre"}
              </button>
              <Link role="menuitem" to="/aide" onClick={() => setMenuOuvert(false)}>
                <CircleHelp size={15} aria-hidden="true" /> Aide
              </Link>
              <button type="button" role="menuitem" onClick={seDeconnecter}>
                <LogOut size={15} aria-hidden="true" /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        ouvert={confirmationDeconnexion}
        titre="Se déconnecter ?"
        description="Voulez-vous vraiment vous déconnecter ?"
        fermer={() => setConfirmationDeconnexion(false)}
        confirmer={confirmerDeconnexion}
        libelleConfirmer="Confirmer la déconnexion"
      />
    </header>
  );
}
