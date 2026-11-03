import { cn } from "@/utils";

export const FIELD_FORM_CLASS = cn(
  "flex min-w-0 flex-col gap-1.5",
  "[&>label]:text-[12px] [&>label]:font-[680] [&>label]:text-[#546b75] [&>label]:dark:text-sre-muted",
  "[&>small]:dark:text-sre-muted-2",
  "[&_[aria-invalid=true]]:!border-sre-red",
);

export const FIELD_LABEL_CLASS = "inline-flex items-baseline gap-[3px] leading-[1.35]";

export const FIELD_MANDATORY_CLASS =
  "text-[12px] font-[700] leading-none text-sre-red dark:text-[#e08a8b]";

export const FIELD_HELP_CLASS =
  "text-[12px] font-[450] leading-[1.45] text-[#93a1a6] dark:text-sre-muted-2";

export const FIELD_ERROR_CLASS =
  "m-0 text-[12px] font-[600] leading-[1.45] text-[#a34748] dark:text-[#f0a3a5]";

export const PASSWORD_FIELD_CLASS = "relative block [&>input]:pr-[42px]";

export const PASSWORD_TOGGLE_CLASS = cn(
  "absolute top-1/2 right-[5px] grid size-[34px] -translate-y-1/2 cursor-pointer place-items-center",
  "border-0 bg-transparent text-[#768990] hover:bg-[#f1f5f6] hover:text-sre-ink",
  "dark:hover:bg-sre-blue-soft dark:hover:text-sre-ink",
  "rounded-[var(--radius-button)]",
);

export const FORM_STEP_CLASS = cn(
  "flex items-center gap-[9px] pt-[3px]",
  "[&>span]:grid [&>span]:size-[25px] [&>span]:flex-none [&>span]:place-items-center",
  "[&>span]:rounded-full [&>span]:bg-[#e9f2f4] [&>span]:text-[11px] [&>span]:font-[800] [&>span]:text-sre-blue",
  "[&_h2]:m-0 [&_h2]:text-[11px] [&_h2]:font-[750] [&_h2]:text-sre-ink",
  "[&_p]:mt-[3px] [&_p]:mb-0 [&_p]:text-[12px] [&_p]:text-[#93a0a4]",
  "dark:[&>span]:bg-sre-blue-soft dark:[&>span]:text-sre-teal",
);

export const DECISION_REASON_CLASS = cn(
  "mt-3 rounded-lg border border-[#efe0d4] bg-[#fcf7f1] p-[10px]",
  "[&_strong]:text-[11px] [&_strong]:text-[#8a6240]",
  "[&_p]:mt-1 [&_p]:mb-0 [&_p]:text-[12px] [&_p]:leading-[1.55] [&_p]:text-[#8a7864]",
  "dark:border-sre-border dark:bg-sre-gold-soft",
  "dark:[&_strong]:text-sre-ink-2 dark:[&_p]:text-sre-ink-2",
);

export const PAYMENT_TOTAL_CLASS = cn(
  "my-0 mt-1 mb-3 flex items-center justify-between gap-[10px] border-y border-[#e8edef] py-[11px]",
  "[&_span]:text-[12px] [&_span]:text-[#74868d]",
  "[&_strong]:text-[12px] [&_strong]:text-sre-ink",
);

export const PAYMENT_DETAIL_AMOUNT_CLASS = cn(
  "mb-[3px] flex flex-col gap-[5px] border-b border-[#edf0f1] py-[14px]",
  "[&_span]:text-[12px] [&_span]:text-[#8a9aa0]",
  "[&_strong]:text-[25px] [&_strong]:font-[790] [&_strong]:tracking-[-0.7px] [&_strong]:text-sre-ink",
  "[&_small]:text-[12px] [&_small]:text-[#99a5a9]",
);

export const VERTICAL_HISTORY_CLASS = cn(
  "my-[7px] mb-[17px] list-none p-0",
  "[&_li]:relative [&_li]:flex [&_li]:gap-[10px] [&_li]:pb-[17px]",
  "[&_li:not(:last-child)::before]:absolute [&_li:not(:last-child)::before]:top-[13px]",
  "[&_li:not(:last-child)::before]:bottom-0 [&_li:not(:last-child)::before]:left-[5px]",
  "[&_li:not(:last-child)::before]:w-px [&_li:not(:last-child)::before]:bg-[#dfe8e9]",
  "[&_li:not(:last-child)::before]:content-['']",
  "[&_li>i]:z-[1] [&_li>i]:mt-0.5 [&_li>i]:size-[11px] [&_li>i]:flex-none [&_li>i]:rounded-full",
  "[&_li>i]:border-2 [&_li>i]:border-sre-paper [&_li>i]:bg-[#a7b6b9] [&_li>i]:shadow-[0_0_0_1px_#d6e1e3]",
  "[&_li>div]:flex [&_li>div]:min-w-0 [&_li>div]:flex-col [&_li>div]:gap-1",
  "[&_li_strong]:text-[11px] [&_li_strong]:text-[#405c67]",
  "[&_li_p]:m-0 [&_li_p]:text-[12px] [&_li_p]:leading-[1.45] [&_li_p]:text-[#819198]",
  "[&_li_small]:text-[11px] [&_li_small]:text-[#a0aaae]",
);

export const VERTICAL_HISTORY_ACTIVE_CLASS = "!bg-sre-teal !shadow-[0_0_0_1px_#8eb9b3]";

export const NOTIFICATIONS_LIST_CLASS = "mb-3.5 flex flex-col gap-[9px]";

export const SECURITY_ALERT_BANNER_CLASS = cn(
  "mb-[15px] flex items-start gap-[10px] rounded-[9px] border border-[#efe5d2]",
  "bg-[#fcf8f0] px-[14px] py-3 text-[#6f654f]",
  "[&>svg]:flex-none [&>svg]:text-[#a47b42]",
  "[&_strong]:text-[11px] [&_strong]:text-[#715d3d]",
  "[&_p]:mt-[3px] [&_p]:mb-0 [&_p]:text-[11px] [&_p]:leading-[1.55] [&_p]:text-[#8a7b61]",
  "dark:border-sre-border dark:bg-sre-gold-soft dark:text-sre-ink-2",
  "dark:[&_strong]:text-sre-ink-2 dark:[&_p]:text-sre-ink-2",
);

export const SEARCHABLE_SELECT_CLASS = "relative";

export const SEARCHABLE_SELECT_FIELD_CLASS = cn(
  "flex min-h-[37px] items-center gap-[7px] border border-[#dde5e8] bg-white pr-1.5 pl-2.5",
  "rounded-[7px] text-[#8b9ba1]",
  "focus-within:border-[#8eafb8] focus-within:shadow-[0_0_0_3px_rgba(21,86,116,0.07)]",
  "[&>button]:grid [&>button]:size-[30px] [&>button]:flex-none [&>button]:cursor-pointer",
  "[&>button]:place-items-center [&>button]:rounded-[6px] [&>button]:border-0",
  "[&>button]:bg-transparent [&>button]:text-[#768990]",
  "dark:border-sre-border dark:bg-sre-paper dark:text-sre-ink",
);

export const SEARCHABLE_SELECT_INPUT_CLASS =
  "min-w-0 flex-1 border-0 bg-transparent text-[13px] text-sre-ink outline-none focus-visible:!outline-0";

export const SEARCHABLE_SELECT_LIST_CLASS = cn(
  "absolute top-[calc(100%+6px)] right-0 left-0 z-[130] m-0 max-h-[264px] list-none overflow-y-auto p-1.5",
  "rounded-[10px] border border-sre-border bg-white shadow-[0_18px_44px_rgba(15,34,64,0.16)]",
  "[&>li]:flex [&>li]:cursor-pointer [&>li]:items-center [&>li]:justify-between [&>li]:gap-2",
  "[&>li]:rounded-[7px] [&>li]:px-[9px] [&>li]:py-2 [&>li]:text-[12.5px] [&>li]:text-sre-ink",
  "[&>li:hover]:bg-sre-blue-soft",
  "[&>li>span]:flex [&>li>span]:min-w-0 [&>li>span]:flex-col [&>li>span]:gap-0.5",
  "[&>li>span>small]:text-[12px] [&>li>span>small]:text-sre-muted [&>li>span>small]:[overflow-wrap:anywhere]",
  "dark:border-sre-border dark:bg-sre-paper dark:text-sre-ink",
);

export const SEARCHABLE_SELECT_OPTION_ACTIVE_CLASS = "!bg-sre-blue-soft";

export const SEARCHABLE_SELECT_EMPTY_CLASS = "!cursor-default !text-sre-muted";

export const REGISTRATION_STEPS_CLASS = cn(
  "mb-4",
  "[&>ol]:m-0 [&>ol]:flex [&>ol]:list-none [&>ol]:gap-1.5 [&>ol]:p-0",
  "[&_li]:flex-1 [&_li]:rounded-b-[7px] [&_li]:border-t-[3px] [&_li]:border-[#e1e8eb]",
  "[&_li]:px-2 [&_li]:pt-2 [&_li]:pb-1.5",
  "[&_li]:text-[12px] [&_li]:font-[700] [&_li]:leading-[1.35] [&_li]:text-[#93a1a6]",
  "[&_li[aria-current=step]]:border-t-sre-teal [&_li[aria-current=step]]:bg-sre-teal-soft",
  "[&_li[aria-current=step]]:font-[800] [&_li[aria-current=step]]:text-sre-ink",
  "dark:[&_li]:border-sre-border dark:[&_li]:text-sre-muted",
  "dark:[&_li[aria-current=step]]:border-t-sre-teal dark:[&_li[aria-current=step]]:bg-sre-blue-soft",
  "dark:[&_li[aria-current=step]]:text-sre-ink",
);

export const STEP_COMPLETED_CLASS = cn(
  "!border-t-[#9fd4cc] !text-[#546b75]",
  "dark:!border-t-[color-mix(in_srgb,var(--sre-teal)_45%,var(--sre-border))]",
  "dark:!text-sre-ink-2",
);
