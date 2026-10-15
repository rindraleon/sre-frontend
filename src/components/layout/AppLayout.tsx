import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { SRE_REGION } from "@/utils/constants";
import { Sidebar, ADMIN_MENU, CLIENT_MENU } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

/**
 * Layout des espaces authentifiés (back-office et espace contribuable) :
 * composition Barre latérale + Barre supérieure + contenu + pied.
 * Les pages enfants ne dupliquent ni sidebar ni navbar.
 */
export function AppLayout() {
  const emplacement = useLocation();
  const [menuMobile, definirMenuMobile] = useState(false);
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
  const titrePage =
    menus.find(
      (element) =>
        element.chemin === emplacement.pathname ||
        (element.chemin !== "/admin" &&
          element.chemin !== "/client" &&
          emplacement.pathname.startsWith(`${element.chemin}/`)),
    )?.titre ?? (estAdmin ? "Administration" : "Mon espace contribuable");

  return (
    <div className="application-sre">
      <Sidebar menuMobileOuvert={menuMobile} fermerMenuMobile={() => definirMenuMobile(false)} />
      <div className="contenu-application-sre">
        <Topbar
          titrePage={titrePage}
          notificationsNonLues={notificationsNonLues}
          ouvrirMenuMobile={() => definirMenuMobile(true)}
        />
        <main className="zone-contenu-sre">
          <Outlet />
        </main>
        <footer className="pied-application-sre">
          <span>Service régional · {SRE_REGION}</span>
          <span>
            <ShieldCheck size={13} /> Aucune opération financière n’est exécutée
          </span>
        </footer>
      </div>
    </div>
  );
}
