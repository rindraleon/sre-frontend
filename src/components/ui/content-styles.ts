import { cn } from "@/utils";

export const STATISTICS_GRID_CLASS = cn(
  "mb-4 grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[720px]:gap-2",
);

export const STAT_TEXT_VALUE_CLASS = "!text-[11px] !tracking-[-0.2px]";

export const CHART_CLASS = "min-h-[260px] [&_.card-sre__header]:mb-[9px]";

export const CHART_CONTENT_CLASS = "flex min-h-[175px] flex-col justify-end";

export const CHART_VALUE_CLASS =
  "mx-0 mt-1 mb-[9px] text-[20px] font-[780] tracking-[-0.6px] text-sre-ink";

export const MONTH_BARS_CLASS = cn(
  "grid h-[126px] grid-cols-6 items-end gap-[15px] border-b border-[#edf0f1] px-[7px] pt-2",
  "bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_30px,#eff2f3_31px,transparent_32px)]",
  "[&>div]:flex [&>div]:h-full [&>div]:flex-col [&>div]:items-center [&>div]:justify-end [&>div]:gap-[7px]",
  "[&>div>span]:block [&>div>span]:w-[min(100%,26px)] [&>div>span]:min-h-[5px]",
  "[&>div>span]:rounded-t-[5px] [&>div>span]:rounded-b-[1px]",
  "[&>div>span]:bg-[linear-gradient(180deg,#2e898e,#68aaa7)]",
  "[&>div>span]:transition-[height] [&>div>span]:duration-300",
  "[&_small]:text-[12px] [&_small]:text-[#9aa7ac] [&_small]:capitalize",
);

export const QUICK_ACTIONS_CLASS = "flex flex-col";

export const SHORTCUT_CLASS = cn(
  "flex min-h-[55px] items-center gap-[10px] border-t border-[#eff2f3] px-[3px] py-2",
  "[&>span]:grid [&>span]:size-[31px] [&>span]:flex-none [&>span]:place-items-center",
  "[&>span]:rounded-lg [&>span]:bg-[#eef5f6] [&>span]:text-sre-blue",
  "[&>div]:flex [&>div]:min-w-0 [&>div]:flex-1 [&>div]:flex-col [&>div]:gap-1",
  "[&_strong]:text-[11px] [&_strong]:font-[700] [&_strong]:text-sre-ink",
  "[&_small]:text-[12px] [&_small]:text-[#8a9aa1]",
  "[&>svg]:text-[#93a2a7]",
  "hover:[&_div_strong]:text-sre-teal",
);

export const CONTENT_GRID_CLASS = cn(
  "mb-[15px] grid grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)] gap-3.5",
  "max-[920px]:grid-cols-[minmax(0,1fr)_minmax(250px,0.8fr)]",
  "max-[720px]:grid-cols-1",
);

export const PAYMENT_DETAIL_GRID_CLASS = cn(
  "mb-3.5 grid grid-cols-[minmax(0,1.2fr)_minmax(270px,0.8fr)] gap-3.5",
  "max-[720px]:grid-cols-1",
);

export const DETAIL_GRID_CLASS = cn(
  "mb-3.5 grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-3.5",
  "max-[720px]:grid-cols-1",
);

export const OBLIGATION_AMOUNT_CARD_CLASS = cn(
  "flex min-h-[205px] flex-col items-start justify-center gap-3",
  "bg-[linear-gradient(145deg,#fff,#f3f8f8)] dark:bg-sre-paper",
  "[&>strong]:text-[clamp(24px,3vw,34px)] [&>strong]:font-[800] [&>strong]:tracking-[-1.2px]",
  "[&>strong]:text-sre-ink",
  "[&>small]:text-[12px] [&>small]:text-[#93a1a5]",
);

export const TABLE_SRE_CLASS = cn(
  "table-sre w-full border-collapse text-left text-[11px] text-sre-ink",
  "max-[720px]:min-w-[730px] max-[460px]:min-w-[700px]",
  "[&_th]:h-[37px] [&_th]:whitespace-nowrap [&_th]:border-b [&_th]:border-[#edf0f1] [&_th]:bg-[#fafcfc]",
  "[&_th]:px-3 [&_th]:text-[12px] [&_th]:font-[750] [&_th]:tracking-[0.18px] [&_th]:text-[#88979d]",
  "[&_th>button]:inline-flex [&_th>button]:cursor-pointer [&_th>button]:items-center [&_th>button]:gap-1",
  "[&_th>button]:border-0 [&_th>button]:bg-transparent [&_th>button]:p-0 [&_th>button]:font-[inherit]",
  "[&_th>button]:tracking-[inherit] [&_th>button]:text-[inherit]",
  "[&_th>button:disabled]:cursor-default",
  "[&_td]:min-h-[43px] [&_td]:border-b [&_td]:border-[#f0f3f3] [&_td]:px-3 [&_td]:py-[10px] [&_td]:align-middle",
  "[&_tr:last-child_td]:border-b-0",
  "[&_tbody_tr:hover]:bg-[#fbfdfd]",
  "[&_td_strong]:text-[11px] [&_td_strong]:font-[710] [&_td_strong]:text-[#334d5c]",
  "[&_td_small]:mt-[3px] [&_td_small]:block [&_td_small]:text-[12px] [&_td_small]:leading-[1.4] [&_td_small]:text-[#92a0a5]",
  "dark:text-sre-ink dark:[&_th]:border-sre-border dark:[&_th]:bg-sre-bg dark:[&_th]:text-sre-muted",
  "dark:[&_td]:border-sre-border dark:[&_tbody_tr:hover]:bg-sre-bg-soft",
  "dark:[&_td_strong]:text-sre-ink dark:[&_td_small]:text-sre-muted",
);

export const ACTION_LINK_CLASS = cn(
  "inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-[700] text-sre-blue",
  "hover:text-sre-teal hover:underline",
);

export const PAGE_BOTTOM_ACTIONS_CLASS = "mt-3.5 flex flex-wrap items-center gap-[10px]";

export const SECURITY_NOTE_CLASS = cn(
  "flex items-start gap-2 rounded-lg border border-[#e2ece8] bg-[#f4f8f6] p-[10px]",
  "dark:border-sre-border dark:bg-sre-paper",
  "[&>svg]:flex-none [&>svg]:text-[#4e8270]",
  "[&>span]:flex-none [&>span]:font-[800] [&>span]:text-[#4e8270]",
  "[&_p]:m-0 [&_p]:flex [&_p]:flex-col [&_p]:gap-[3px] [&_p]:text-[12px] [&_p]:leading-[1.5] [&_p]:text-[#71877f]",
  "[&_strong]:text-[11px] [&_strong]:text-[#3c6659]",
);

export const NOTIFICATION_MINI_CLASS = cn(
  "flex gap-[9px] border-t border-[#eff2f3] py-[9px]",
  "[&>i]:mt-1 [&>i]:mr-0.5 [&>i]:size-[7px] [&>i]:flex-none [&>i]:rounded-full [&>i]:bg-transparent",
  "[&>div]:min-w-0",
  "[&_strong]:text-[11px] [&_strong]:text-[#445e69]",
  "[&_p]:my-[3px] [&_p]:text-[12px] [&_p]:leading-[1.5] [&_p]:text-[#87969c]",
  "[&_small]:text-[12px] [&_small]:text-[#a2adb1]",
);

export const NOTIFICATION_MINI_DOT_CLASS = "[&>i]:bg-sre-teal";

export const INFO_BANNER_CLASS = cn(
  "mb-[15px] flex items-start gap-[11px] rounded-[10px] border border-[#e0ebee] bg-[#f4f8f9] px-[15px] py-[13px]",
  "dark:border-sre-border dark:bg-[#172a20] dark:text-sre-ink-2",
  "[&>span:first-child]:grid [&>span:first-child]:size-7 [&>span:first-child]:flex-none",
  "[&>span:first-child]:place-items-center [&>span:first-child]:rounded-lg",
  "[&>span:first-child]:bg-[#e5f0f3] [&>span:first-child]:text-sre-blue",
  "[&>div]:min-w-0 [&>div]:flex-1",
  "[&_strong]:text-[12px] [&_strong]:font-[730] [&_strong]:text-sre-ink",
  "[&_p]:mt-[3px] [&_p]:mb-0 [&_p]:text-[11px] [&_p]:leading-[1.55] [&_p]:text-[#71848c]",
);

export const TIP_BANNER_CLASS = cn(
  "mb-[15px] flex items-start gap-[11px] rounded-[10px] border border-[#e4ede8] bg-[#f4f8f5] px-[15px] py-[13px]",
  "dark:border-sre-border dark:bg-[#172a20] dark:text-sre-ink-2",
  "[&>span:first-child]:grid [&>span:first-child]:size-7 [&>span:first-child]:flex-none",
  "[&>span:first-child]:place-items-center [&>span:first-child]:rounded-lg",
  "[&>span:first-child]:bg-[#e6f1ec] [&>span:first-child]:text-[#437d6d]",
  "[&>div]:min-w-0 [&>div]:flex-1",
  "[&_strong]:text-[12px] [&_strong]:font-[730] [&_strong]:text-sre-ink",
  "[&_p]:mt-[3px] [&_p]:mb-0 [&_p]:text-[11px] [&_p]:leading-[1.55] [&_p]:text-[#71848c]",
);
