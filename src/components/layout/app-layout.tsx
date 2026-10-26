import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import {
  CONTACT_MESSAGES_UPDATED_EVENT,
  isApiConfigured,
  loadContactMessagesUnreadCountApi,
} from "@/services/api-client";
import { SRE_REGION } from "@/utils/constants";
import { Sidebar, ADMIN_MENU, CLIENT_MENU } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadContactMessages, setUnreadContactMessages] = useState(0);
  const { session } = useAuth();
  const { state } = useSre();

  const isAdmin = session?.role === "ADMIN";
  const token = session?.apiToken ?? "";

  const refreshUnreadContactMessages = useCallback(async () => {
    if (!isAdmin || !token || !isApiConfigured) return;
    try {
      const response = await loadContactMessagesUnreadCountApi(token);
      setUnreadContactMessages(response.unread ?? 0);
    } catch {
      // Keep last known count on transient network failure.
    }
  }, [isAdmin, token]);

  useEffect(() => {
    if (!isAdmin || !token || !isApiConfigured) {
      setUnreadContactMessages(0);
      return;
    }
    void refreshUnreadContactMessages();
  }, [isAdmin, token, location.pathname, refreshUnreadContactMessages]);

  useEffect(() => {
    if (!isAdmin) return;
    const handleContactUpdated = (event: Event) => {
      const custom = event as CustomEvent<{ unread?: number }>;
      if (typeof custom.detail?.unread === "number") {
        setUnreadContactMessages(custom.detail.unread);
      } else {
        void refreshUnreadContactMessages();
      }
    };
    window.addEventListener(CONTACT_MESSAGES_UPDATED_EVENT, handleContactUpdated);
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshUnreadContactMessages();
      }
    }, 30_000);
    return () => {
      window.removeEventListener(
        CONTACT_MESSAGES_UPDATED_EVENT,
        handleContactUpdated,
      );
      window.clearInterval(intervalId);
    };
  }, [isAdmin, refreshUnreadContactMessages]);

  if (!session) return null;
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
    : location.pathname.startsWith("/admin/messages-contact")
      ? "Messagerie & demandes de contact"
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
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
      />
      <div className="app-content-sre">
        <Topbar
          pageTitle={pageTitle}
          unreadNotifications={unreadNotifications}
          unreadContactMessages={unreadContactMessages}
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
