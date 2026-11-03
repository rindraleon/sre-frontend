import { useContactMessagesList } from "./use-contact-messages-list";
import { useContactMessageDetail } from "./use-contact-message-detail";
import { useContactReply } from "./use-contact-reply";

export function useContactMessagesInbox(token: string) {
  const list = useContactMessagesList(token);
  const detail = useContactMessageDetail(token, list.synchronizeEntry);
  const reply = useContactReply(token, detail.selected, list.synchronizeEntry);

  return { list, detail, reply };
}
