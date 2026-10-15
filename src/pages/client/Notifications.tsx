import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi } from "@/services/api";
import { PageHeader, EmptyState } from "@/components/ui";
import { formatDate } from "@/utils/format";

export function ClientNotificationsPage() {
  const { session } = useAuth();
  const { etat, mettreAJourEtat, notifier } = useSre();
  const [enCours, definirEnCours] = useState<string | null>(null);
  const notifications = etat.notifications.filter(
    (notification) => notification.utilisateurId === session?.utilisateurId,
  );
  const nonLues = notifications.filter((notification) => !notification.lue).length;

  const marquerLue = async (id: string) => {
    if (!session?.jetonApi) return;
    definirEnCours(id);
    try {
      await callApi(`notifications/${id}/lue`, { method: "PATCH", token: session.jetonApi });
      mettreAJourEtat((courant) => ({
        ...courant,
        notifications: courant.notifications.map((notification) =>
          notification.id === id ? { ...notification, lue: true } : notification,
        ),
      }));
    } catch {
      notifier("Impossible de marquer cette notification comme lue.", "erreur");
    } finally {
      definirEnCours(null);
    }
  };

  const marquerToutesLues = async () => {
    if (!session?.jetonApi) return;
    definirEnCours("toutes");
    try {
      await callApi("notifications/toutes-lues", {
        method: "PATCH",
        token: session.jetonApi,
      });
      mettreAJourEtat((courant) => ({
        ...courant,
        notifications: courant.notifications.map((notification) =>
          notification.utilisateurId === session.utilisateurId
            ? { ...notification, lue: true }
            : notification,
        ),
      }));
    } catch {
      notifier("Impossible de mettre à jour les notifications.", "erreur");
    } finally {
      definirEnCours(null);
    }
  };

  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Notifications"
        description="Rappels d’échéances et messages liés à votre dossier, générés par le serveur."
        filAriane={["Mon espace", "Notifications"]}
        actions={
          nonLues > 0 ? (
            <button
              type="button"
              className="bouton-sre bouton-sre--contour bouton-sre--petit"
              onClick={marquerToutesLues}
              disabled={enCours !== null}
            >
              Tout marquer comme lu ({nonLues})
            </button>
          ) : undefined
        }
      />
      {notifications.length === 0 ? (
        <EmptyState
          titre="Aucune notification"
          description="Vous n’avez reçu aucun rappel pour le moment. Les échéances à venir apparaîtront ici et, si le courriel est configuré, dans votre boîte e-mail."
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
                <div className="notification-carte-sre__pied">
                  <Link to="/client/obligations">Voir mes obligations</Link>
                  {!notification.lue && (
                    <button
                      type="button"
                      onClick={() => marquerLue(notification.id)}
                      disabled={enCours !== null}
                    >
                      {enCours === notification.id ? "Mise à jour…" : "Marquer comme lue"}
                    </button>
                  )}
                  <small>
                    {notification.statutEmail === "ENVOYE"
                      ? "Courriel : envoyé"
                      : notification.statutEmail === "ERREUR"
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
