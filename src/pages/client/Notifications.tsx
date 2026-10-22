import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi } from "@/services/api-client";
import { Button, PageHeader, EmptyState } from "@/components/ui";
import { formatDate } from "@/utils/format";

export function ClientNotificationsPage() {
  const { session } = useAuth();
  const { state, updateState, notify } = useSre();
  const [inProgress, setInProgress] = useState<string | null>(null);
  const notifications = state.notifications.filter(
    (notification) => notification.userId === session?.userId,
  );
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const markAsRead = async (id: string) => {
    if (!session?.apiToken || inProgress !== null) return;
    setInProgress(id);
    try {
      await callApi(`notifications/${id}/lue`, { method: "PATCH", token: session.apiToken });
      updateState((current) => ({
        ...current,
        notifications: current.notifications.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification,
        ),
      }));
    } catch {
      notify("Impossible de marquer cette notification comme lue.", "error");
    } finally {
      setInProgress(null);
    }
  };

  const markAllAsRead = async () => {
    if (!session?.apiToken || inProgress !== null) return;
    setInProgress("toutes");
    try {
      await callApi("notifications/toutes-lues", {
        method: "PATCH",
        token: session.apiToken,
      });
      updateState((current) => ({
        ...current,
        notifications: current.notifications.map((notification) =>
          notification.userId === session.userId
            ? { ...notification, isRead: true }
            : notification,
        ),
      }));
    } catch {
      notify("Impossible de mettre à jour les notifications.", "error");
    } finally {
      setInProgress(null);
    }
  };

  return (
    <div className="page-content-sre">
      <PageHeader
        title="Notifications"
        description="Rappels d’échéances et messages liés à votre dossier, générés par le serveur."
        breadcrumb={["Accueil", "Notifications"]}
        actions={
          unreadCount > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={() => void markAllAsRead()}
              disabled={inProgress !== null}
              loading={inProgress === "toutes"}
            >
              {inProgress === "toutes" ? "Mise à jour…" : `Tout marquer comme lu (${unreadCount})`}
            </Button>
          ) : undefined
        }
      />
      {notifications.length === 0 ? (
        <EmptyState
          title="Aucune notification"
          description="Vous n’avez reçu aucun rappel pour le moment. Les échéances à venir apparaîtront ici et, si le courriel est configuré, dans votre boîte e-mail."
        />
      ) : (
        <div className="notifications-list-sre">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`notification-card-sre${notification.isRead ? "" : " notification-card-sre--unread"}`}
            >
              <span className="notification-card-sre__icon">
                <Bell size={16} />
              </span>
              <div>
                <div className="notification-card-sre__row">
                  <strong>{notification.title}</strong>
                  <small>{formatDate(notification.date, true)}</small>
                </div>
                <p>{notification.message}</p>
                <div className="notification-card-sre__footer">
                  <Link to="/client/obligations">Voir mes obligations</Link>
                  {!notification.isRead && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="small"
                      onClick={() => void markAsRead(notification.id)}
                      disabled={inProgress !== null}
                      loading={inProgress === notification.id}
                    >
                      {inProgress === notification.id ? "Mise à jour…" : "Marquer comme lue"}
                    </Button>
                  )}
                  <small>
                    {notification.emailStatus === "DELIVRE"
                      ? "Courriel : délivré"
                      : notification.emailStatus === "ENVOYE"
                        ? "Courriel : envoyé"
                        : notification.emailStatus === "EN_ATTENTE"
                          ? "Courriel : en attente d’envoi"
                          : notification.emailStatus === "ERREUR"
                            ? "Courriel : échec d’envoi (notification conservée ici)"
                            : "Courriel : non envoyé"}
                  </small>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

