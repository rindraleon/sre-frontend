import { cn } from "@/utils";

const CARD_HOOK = "card-sre";

const CARD_BASE =
  `${CARD_HOOK} min-w-0 rounded-xl border border-sre-border bg-white p-[19px] shadow-[0_2px_7px_rgba(20,46,63,0.018)] ` +
  "max-md:p-4 dark:border-sre-border dark:bg-sre-paper dark:text-sre-ink " +
  "[&>h2]:m-0 [&>h2]:text-[15px] [&>h2]:font-[740] [&>h2]:tracking-[-0.2px] [&>h2]:text-sre-ink";

export const CARD_CLASS = CARD_BASE;

export const TABLE_CARD_CLASS = cn(CARD_BASE, "mb-[15px] overflow-hidden p-0");

export const CARD_HEADER_CLASS =
  "card-sre__header mb-[15px] flex items-center justify-between gap-3 " +
  "[&>div]:min-w-0 [&>svg]:flex-none [&>svg]:text-[#76959a] " +
  "[&_h2]:m-0 [&_h2]:text-[15px] [&_h2]:font-[740] [&_h2]:tracking-[-0.2px] [&_h2]:text-sre-ink " +
  "[&_p]:mt-1 [&_p]:text-[11px] [&_p]:leading-[1.45] [&_p]:text-sre-muted-2";

export const PAGE_CONTENT_CLASS =
  "mx-auto w-full min-w-0 max-w-[1450px] animate-[appear_0.25s_ease-out]";
