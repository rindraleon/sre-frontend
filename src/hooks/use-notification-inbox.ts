import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/contexts";
import { useSre } from "@/contexts";
import type { AppNotification } from "@/types";
import { markAllNotificationsReadApi, markNotificationReadApi } from "@/services/notification";

export function useNotificationInbox(scope: "ADMIN" | "CLIENT") {
  const { session } = useAuth();
  const { state, updateState, notify } = useSre();
  const [inProgress, setInProgress] = useState<string | null>(null);

  const notifications = useMemo(() => {
    if (scope === "ADMIN")
      return state.notifications.filter(
        (notification) =>
          notification.userId === session?.userId || notification.recipientRole === "ADMIN",
      );
    return state.notifications.filter((notification) => notification.userId === session?.userId);
  }, [state.notifications, session?.userId, scope]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const applyReadState = useCallback(
    (predicate: (notification: AppNotification) => boolean) => {
      updateState((current) => ({
        ...current,
        notifications: current.notifications.map((notification) =>
          predicate(notification) ? { ...notification, isRead: true } : notification,
        ),
      }));
    },
    [updateState],
  );

  const markAsRead = useCallback(
    async (id: string) => {
      if (!session?.apiToken || inProgress !== null) return;
      setInProgress(id);
      try {
        await markNotificationReadApi(session.apiToken, id);
        applyReadState((notification) => notification.id === id);
      } catch (cause) {
        console.error("Échec du marquage de la notification comme lue.", cause);
        notify("Impossible de marquer cette notification comme lue.", "error");
      } finally {
        setInProgress(null);
      }
    },
    [session?.apiToken, inProgress, applyReadState, notify],
  );

  const markAllAsRead = useCallback(async () => {
    if (!session?.apiToken || inProgress !== null) return;
    setInProgress("toutes");
    try {
      await markAllNotificationsReadApi(session.apiToken);
      applyReadState((notification) =>
        scope === "ADMIN"
          ? notification.userId === session.userId || notification.recipientRole === "ADMIN"
          : notification.userId === session.userId,
      );
    } catch (cause) {
      console.error("Échec du marquage de toutes les notifications.", cause);
      notify("Impossible de mettre à jour les notifications.", "error");
    } finally {
      setInProgress(null);
    }
  }, [session?.apiToken, session?.userId, inProgress, applyReadState, notify, scope]);

  return { notifications, unreadCount, inProgress, markAsRead, markAllAsRead };
}
