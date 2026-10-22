import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { SRE_REGION } from "@/utils/constants";
import { Sidebar, ADMIN_MENU, CLIENT_MENU } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const workspaceTitle = isAdmin ? "Administration" : "Mon espace contribuable";
  const defaultPageTitle = location.pathname.endsWith("/aide")
    ? "Aide & documentation"
    : workspaceTitle;
  const pageTitle =
    menus.find(
      (element) =>
        element.path === location.pathname ||
        (element.path !== "/admin" &&
          element.path !== "/client" &&
          location.pathname.startsWith(`${element.path}/`)),
    )?.title ?? defaultPageTitle;

  return (
    <div className="app-sre">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
      <div className="app-content-sre">
        <Topbar
          pageTitle={pageTitle}
          unreadNotifications={unreadNotifications}
          openMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className="content-area-sre">
          <Outlet />
        </main>
        <footer className="app-footer-sre">
          <span>Service régional des entreprises · {SRE_REGION}</span>
          <span> Copyright © {new Date().getFullYear()} Harena</span>
          
          <span>
            <ShieldCheck size={13} /> Aucune opération financière n’est exécutée
          </span>
        </footer>
      </div>
    </div>
  );
}
