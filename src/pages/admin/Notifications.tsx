import { Bell, Mail } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { formatDate } from "@/utils/format";

export function AdminNotificationsPage() {
  const { session } = useAuth();
  const { etat } = useSre();
  const notifications = etat.notifications.filter(
    (notification) => notification.utilisateurId === session?.utilisateurId,
  );
  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Notifications & e-mails"
        description="Centre de communication administratif."
        filAriane={["Back-office", "Notifications"]}
      />
      <div className="bandeau-info-sre">
        <span>
          <Mail size={17} />
        </span>
        <div>
          <strong>Rappels d’échéances automatisés côté serveur.</strong>
          <p>
            Le job quotidien génère les rappels des contribuables (J-7, J-3, J-1, jour J, retards
            J+1/J+3/J+7 — politique configurable côté API) et tente l’e-mail uniquement si un
            transport est configuré. Aucun envoi n’est simulé : l’état réel de chaque courriel
            (envoyé, échec, non envoyé) est conservé avec la notification du contribuable.
          </p>
        </div>
      </div>
      {notifications.length === 0 ? (
        <EmptyState
          titre="Aucune notification personnelle"
          description="Les rappels d’échéances sont adressés aux comptes contribuables concernés ; cette page affiche uniquement les notifications de votre propre compte administrateur."
        />
      ) : (
        <div className="liste-notifications-sre">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`notification-carte-sre${notification.lue ? "" : " notification-carte-sre--non-lue"}`}
            >
              <span className="notification-carte-sre__icone">
                <Bell size={16} />
              </span>
              <div>
                <div className="notification-carte-sre__ligne">
                  <strong>{notification.titre}</strong>
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
