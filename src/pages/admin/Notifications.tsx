import { Bell } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { formatDate } from "@/utils/format";

export function AdminNotificationsPage() {
  const { session } = useAuth();
  const { state } = useSre();
  const notifications = state.notifications.filter(
    (notification) => notification.userId === session?.userId,
  );
  return (
    <div className="page-content-sre">
      <PageHeader
        title="Notifications & e-mails"
        description="Centre de communication administratif."
        breadcrumb={["Accueil", "Notifications"]}
      />
      
      {notifications.length === 0 ? (
        <EmptyState
          title="Aucune notification personnelle"
          description="Les rappels d’échéances sont adressés aux comptes contribuables concernés ; cette page affiche uniquement les notifications de votre propre compte administrateur."
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
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
