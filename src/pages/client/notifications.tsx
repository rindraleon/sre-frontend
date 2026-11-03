import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import {
  Button,
  EmptyState,
  NOTIFICATIONS_LIST_CLASS,
  NOTIFICATION_CARD_CLASS,
  NOTIFICATION_CARD_FOOTER_CLASS,
  NOTIFICATION_CARD_ROW_CLASS,
  NOTIFICATION_CARD_UNREAD_CLASS,
  PAGE_CONTENT_CLASS,
  PageHeader,
} from "@/components";
import { cn, formatDate } from "@/utils";
import { useNotificationInbox } from "@/hooks";

export function ClientNotificationsPage() {
  const { notifications, unreadCount, inProgress, markAsRead, markAllAsRead } =
    useNotificationInbox("CLIENT");

  return (
    <div className={PAGE_CONTENT_CLASS}>
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
        <div className={NOTIFICATIONS_LIST_CLASS}>
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={cn(
                NOTIFICATION_CARD_CLASS,
                !notification.isRead && NOTIFICATION_CARD_UNREAD_CLASS,
              )}
            >
              <span className="grid size-[31px] flex-none place-items-center rounded-[9px] bg-[#eef5f6] text-sre-blue">
                <Bell size={16} />
              </span>
              <div>
                <div className={NOTIFICATION_CARD_ROW_CLASS}>
                  <strong>{notification.title}</strong>
                  <small>{formatDate(notification.date, true)}</small>
                </div>
                <p>{notification.message}</p>
                <div className={NOTIFICATION_CARD_FOOTER_CLASS}>
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
                  <small>{notification.isRead ? "Notification lue" : "Notification non lue"}</small>
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
