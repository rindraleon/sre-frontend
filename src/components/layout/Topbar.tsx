import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, Moon, Settings, Sun, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { useTheme } from "@/context/ThemeContext";
import { getInitials } from "@/utils/format";

/**
 * Barre supérieure des espaces authentifiés : bouton menu mobile, titre de
 * page, accès notifications et menu utilisateur (avatar).
 * Le menu se ferme par Échap, clic extérieur ou sélection ; la déconnexion
 * est exécutée immédiatement via le mécanisme d'authentification existant,
 * et le toast de confirmation n'est affiché qu'après sa réalisation.
 */
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
  const [menuOuvert, definirMenuOuvert] = useState(false);
  const refMenu = useRef<HTMLDivElement | null>(null);
  const refBoutonMenu = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!menuOuvert) return;
    const gererExterieur = (event: MouseEvent) => {
      if (refMenu.current && !refMenu.current.contains(event.target as Node))
        definirMenuOuvert(false);
    };
    const gererClavier = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        definirMenuOuvert(false);
        refBoutonMenu.current?.focus();
      }
    };
    document.addEventListener("mousedown", gererExterieur);
    document.addEventListener("keydown", gererClavier);
    // Focus sur le premier élément du menu à l'ouverture (navigation clavier).
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
    definirMenuOuvert(false);
    deconnecter();
    navigation("/accueil", { replace: true });
    // Confirmation affichée uniquement après la fermeture effective de session.
    notifier("Vous êtes déconnecté.", "info");
  };

  return (
    <header className="entete-application-sre">
      <div className="entete-application-sre__gauche">
        <button className="bouton-menu-sre" aria-label="Ouvrir le menu" onClick={ouvrirMenuMobile}>
          <Menu size={20} />
        </button>
        <div>
          <span>{estAdmin ? "BACK-OFFICE" : "ESPACE CONTRIBUABLE"}</span>
          <strong>{titrePage}</strong>
        </div>
      </div>
      <div className="entete-application-sre__droite">
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
            onClick={() => definirMenuOuvert((courant) => !courant)}
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
              {/* Aucune page « profil » administrateur n'existe côté API/routes :
                  l'entrée n'est proposée qu'au contribuable, qui en dispose. */}
              {!estAdmin && (
                <Link role="menuitem" to="/client/profil" onClick={() => definirMenuOuvert(false)}>
                  <UserRound size={15} aria-hidden="true" /> Mon profil
                </Link>
              )}
              <Link
                role="menuitem"
                to={`${racine}/parametres`}
                onClick={() => definirMenuOuvert(false)}
              >
                <Settings size={15} aria-hidden="true" /> Paramètres
              </Link>
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={theme === "sombre"}
                onClick={() => {
                  basculerTheme();
                  definirMenuOuvert(false);
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
              <button type="button" role="menuitem" onClick={seDeconnecter}>
                <LogOut size={15} aria-hidden="true" /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
