import { cn } from "@/utils";

export const OVERLINE_CLASS = "block text-[12px] font-[820] tracking-[1.2px] text-sre-muted";

export const TEXT_HELP_CLASS = "text-[11px] leading-[1.5] text-[#94a1a5] dark:text-sre-muted";

export const SECONDARY_TEXT_CLASS = "text-[12px] text-[#90a0a5] dark:text-sre-muted";

export const ERROR_MESSAGE_CLASS =
  "m-0 rounded-[7px] border border-[#f0dddd] bg-[#fbf1f1] px-[10px] py-2 text-[11px] leading-[1.5] text-[#a34748] " +
  "dark:border-[#6e3438] dark:bg-[#3a1d20] dark:text-[#f0b6b8]";

export const TAX_NOTE_CLASS = cn(
  "flex items-start gap-2 rounded-lg border border-[#e7ecec] bg-[#fafcfc] px-3 py-[10px]",
  "dark:border-sre-border dark:bg-[#172a20] dark:text-sre-ink-2",
  "[&>span:first-child]:grid [&>span:first-child]:size-[18px] [&>span:first-child]:flex-none [&>span:first-child]:place-items-center",
  "[&>span:first-child]:rounded-full [&>span:first-child]:bg-[#eaf2f2] [&>span:first-child]:text-[12px]",
  "dark:[&>span:first-child]:bg-sre-blue-soft dark:[&>span:first-child]:text-sre-ink-2",
  "[&>span:first-child]:font-[750] [&>span:first-child]:text-[#597d83]",
  "[&_p]:m-0 [&_p]:text-[12px] [&_p]:leading-[1.6] [&_p]:text-[#72848b] dark:[&_p]:text-sre-muted",
  "[&_strong]:text-[#47636c] dark:[&_strong]:text-sre-ink",
  "[&_a]:text-sre-blue [&_a]:underline",
);

export const SUB_ROW_CLASS =
  "mt-[3px] block text-[12px] leading-[1.4] text-[#92a0a5] dark:text-sre-muted";

export const REFERENCE_CLASS = "text-[11px] font-[740] text-[#166481]";

export const AMOUNT_CLASS = "whitespace-nowrap font-[730] text-[#334d5c] dark:text-sre-ink";

export const DETAILS_LIST_CLASS = cn(
  "mt-[11px] grid grid-cols-2 gap-x-[18px]",
  "[&>div]:min-w-0 [&>div]:border-b [&>div]:border-[#eff2f3] [&>div]:py-[10px]",
  "[&>dt]:mb-[5px] [&>dt]:text-[12px] [&>dt]:text-[#91a0a5]",
  "[&>dd]:m-0 [&>dd]:flex [&>dd]:items-center [&>dd]:gap-[5px] [&>dd]:break-words",
  "[&>dd]:text-[11px] [&>dd]:font-[660] [&>dd]:text-[#385461]",
  "[&>dd>small]:text-[12px] [&>dd>small]:text-[#94a1a5]",
  "max-[460px]:[&>div:nth-last-child(-n+2)]:border-b max-[460px]:[&>div:nth-last-child(-n+2)]:border-[#eff2f3]",
  "max-[460px]:[&>div:last-child]:border-b-0",
);
