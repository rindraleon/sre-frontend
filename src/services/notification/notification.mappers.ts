import type { ApiNotification, AppNotification } from "@/types";

export function mapApiNotification(notification: ApiNotification, userId: string): AppNotification {
  let emailStatus: AppNotification["emailStatus"];
  switch (notification.statutCourriel) {
    case "ENVOYE":
      emailStatus = "ENVOYE";
      break;
    case "DELIVRE":
      emailStatus = "DELIVRE";
      break;
    case "ECHEC":
      emailStatus = "ERREUR";
      break;
    case "EN_ATTENTE":
      emailStatus = "EN_ATTENTE";
      break;
    default:
      emailStatus = "NON_ENVOYE";
  }

  return {
    id: notification.id,
    title: notification.titre,
    message: notification.message,
    type: "OBLIGATION",
    date: notification.creeLe,
    isRead: notification.lue,
    userId,
    entityReference: notification.obligation?.id,
    emailStatus,
  };
}
