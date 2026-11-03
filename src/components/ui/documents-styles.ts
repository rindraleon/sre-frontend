import { cn } from "@/utils";

export const DOCUMENTS_LIST_CLASS = "mt-[18px] border-t border-[#e8edf2] pt-[15px]";

export const DOCUMENTS_ROW_CLASS = cn(
  "flex items-center justify-between gap-3 border-t border-[#edf1f4] px-0.5 py-[11px] text-[#254b60] no-underline",
  "[&>span]:flex [&>span]:min-w-0 [&>span]:flex-col [&>span]:gap-1",
  "[&_strong]:text-[11px] [&_strong]:text-[#31566a] [&_strong]:[overflow-wrap:anywhere]",
  "[&_small]:text-[12px] [&_small]:leading-[1.4] [&_small]:text-[#718096]",
  "[&>svg]:shrink-0",
  "hover:[&_strong]:text-[#16756f] hover:[&_strong]:underline",
);

export const DOCUMENT_PAGE_CLASS = "print:!m-0 print:!p-0";

export const DOCUMENT_LINK_HIDDEN_CLASS = "hidden";

export const DOCUMENT_SCREEN_ONLY_CLASS = "print:!hidden";
