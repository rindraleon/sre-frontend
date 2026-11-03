import { cn } from "@/utils";

export const RECEIPT_CLASS = cn(
  "max-w-[820px] overflow-hidden rounded-[14px] border border-[#dbe4e9] bg-white text-[#0f2a42] shadow-sre",
  "print:border-[#cbd5e1] print:shadow-none",
);

export const RECEIPT_BANNER_CLASS = cn(
  "relative overflow-hidden px-[30px] pt-[26px] pb-[28px] text-white",
  "bg-[radial-gradient(circle_135px_at_96%_8%,rgba(22,70,93,0.92),transparent_100%),radial-gradient(circle_210px_at_92%_18%,rgba(26,82,107,0.65),transparent_100%),#0f2a42]",
  "print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]",
  "max-[720px]:px-[18px]",
);

export const RECEIPT_BRAND_CLASS = "flex items-center gap-3";

export const RECEIPT_BADGE_ICON_CLASS =
  "grid size-[38px] shrink-0 place-items-center rounded-[9px] bg-[#0f8a8c] text-white";

export const RECEIPT_BRAND_NAME_CLASS =
  "block text-[13px] font-extrabold tracking-[0.04em] text-white";

export const RECEIPT_BRAND_ISSUER_CLASS = "mt-0.5 block text-[11.5px] text-[#b8cad8]";

export const RECEIPT_TITLE_CLASS =
  "mt-[18px] mb-1.5 text-[clamp(19px,2.5vw,26px)] font-extrabold tracking-[0.02em] text-white";

export const RECEIPT_SUBTITLE_CLASS = "m-0 text-[11.5px] tracking-[0.05em] text-[#b8cad8]";

export const RECEIPT_RIBBON_CLASS = cn(
  "absolute right-[26px] bottom-4 rotate-[5deg] rounded-[6px] bg-[#efa34b] px-[14px] py-[5px]",
  "text-[10px] font-extrabold tracking-[0.05em] text-[#0f2a42]",
  "max-[720px]:static max-[720px]:mt-[10px] max-[720px]:inline-block max-[720px]:rotate-0",
);

export const RECEIPT_SHEET_CLASS = cn(
  "grid gap-[18px] bg-white px-[30px] pt-6 pb-[26px] max-[720px]:px-[18px]",
);

export const RECEIPT_META_CARD_CLASS = cn(
  "grid gap-4 rounded-[10px] bg-[#f2f6f9] px-5 py-[15px] [grid-template-columns:repeat(2,minmax(0,1fr))]",
  "[&>div:last-child]:border-l [&>div:last-child]:border-[#dbe4e9] [&>div:last-child]:pl-[18px]",
  "[&_span]:block [&_span]:text-[10px] [&_span]:font-bold [&_span]:tracking-[0.06em] [&_span]:text-[#5b6e80]",
  "[&_strong]:mt-[5px] [&_strong]:block [&_strong]:text-[15.5px] [&_strong]:font-extrabold [&_strong]:text-[#0f2a42] [&_strong]:[overflow-wrap:anywhere]",
  "max-[720px]:[grid-template-columns:1fr]",
  "max-[720px]:[&>div:last-child]:border-t max-[720px]:[&>div:last-child]:border-l-0 max-[720px]:[&>div:last-child]:pt-[10px] max-[720px]:[&>div:last-child]:pl-0",
);

export const RECEIPT_STATUS_ROW_CLASS = "mt-[-8px] flex justify-end";

export const RECEIPT_PILL_CLASS =
  "inline-flex items-center rounded-full bg-[#e9f6f0] px-[14px] py-[5px] text-[10.5px] font-extrabold tracking-[0.05em] text-[#16856b]";

export const RECEIPT_PILL_ACK_CLASS = "!bg-[#fef3c7] !text-[#92400e]";

export const RECEIPT_SECTION_CLASS = cn(
  "[&>h3]:relative [&>h3]:m-0 [&>h3]:mb-3 [&>h3]:pb-2 [&>h3]:text-[12.5px] [&>h3]:font-extrabold [&>h3]:tracking-[0.04em] [&>h3]:text-[#0f2a42]",
  "[&>h3]:after:absolute [&>h3]:after:bottom-0 [&>h3]:after:left-0 [&>h3]:after:h-[3px] [&>h3]:after:w-16 [&>h3]:after:rounded-[2px] [&>h3]:after:bg-[#0f8a8c] [&>h3]:after:content-['']",
);

export const RECEIPT_TAXPAYER_CARD_CLASS = cn(
  "grid gap-x-[22px] gap-y-[14px] rounded-[10px] bg-[#f2f6f9] px-5 py-4",
  "[grid-template-columns:minmax(0,1.15fr)_minmax(0,1fr)]",
  "[&_span]:block [&_span]:text-[10px] [&_span]:font-bold [&_span]:tracking-[0.06em] [&_span]:text-[#5b6e80]",
  "[&_strong]:mt-1 [&_strong]:block [&_strong]:text-[14px] [&_strong]:font-extrabold [&_strong]:text-[#0f2a42]",
  "[&_b]:mt-1 [&_b]:block [&_b]:text-[12.5px] [&_b]:font-bold [&_b]:text-[#0f2a42] [&_b]:[overflow-wrap:anywhere]",
  "max-[720px]:[grid-template-columns:1fr]",
);

export const RECEIPT_TABLE_CLASS = cn(
  "m-0 rounded-[10px] border border-[#dbe4e9] bg-white",
  "[&>div]:flex [&>div]:items-baseline [&>div]:justify-between [&>div]:gap-[14px] [&>div]:px-[18px] [&>div]:py-[11px]",
  "[&>div+div]:border-t [&>div+div]:border-[#e6edf2]",
  "[&_dt]:text-[12.5px] [&_dt]:text-[#5b6e80]",
  "[&_dd]:m-0 [&_dd]:text-right [&_dd]:text-[12.5px] [&_dd]:font-extrabold [&_dd]:text-[#0f2a42] [&_dd]:[overflow-wrap:anywhere]",
  "max-[720px]:[&>div]:flex-col max-[720px]:[&>div]:gap-0.5 max-[720px]:[&_dd]:text-left",
);

export const RECEIPT_AMOUNT_BOX_CLASS = cn(
  "flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-[10px] bg-[#e9f6f0] px-5 py-4",
  "[&_span]:block [&_span]:text-[10.5px] [&_span]:font-extrabold [&_span]:tracking-[0.05em] [&_span]:text-[#16856b]",
  "[&_strong]:mt-[3px] [&_strong]:block [&_strong]:text-[clamp(22px,2.8vw,28px)] [&_strong]:font-extrabold [&_strong]:text-[#0f2a42]",
  "[&_p]:m-0 [&_p]:text-right [&_p]:text-[12px] [&_p]:text-[#5b6e80]",
  "max-[720px]:[&_p]:text-left",
);

export const RECEIPT_AMOUNT_BOX_ACK_CLASS = "!bg-[#fef3c7] [&_span]:!text-[#92400e]";

export const RECEIPT_VERIFICATION_CLASS = cn(
  "grid items-center gap-[18px] pt-1 [grid-template-columns:minmax(0,1fr)_260px]",
  "max-[720px]:[grid-template-columns:1fr]",
);

export const RECEIPT_VERIFICATION_TEXT_CLASS = cn(
  "[&_h3]:m-0 [&_h3]:mb-1.5 [&_h3]:text-[12px] [&_h3]:font-extrabold [&_h3]:tracking-[0.04em] [&_h3]:text-[#0f2a42]",
  "[&_p]:my-[3px] [&_p]:text-[12px] [&_p]:text-[#5b6e80]",
  "[&_.fiscal-receipt-auth-code_strong]:text-[#0f2a42]",
);

export const RECEIPT_AUTH_CODE_CLASS = "[&_strong]:!text-[#0f2a42]";

export const RECEIPT_TRACE_NOTE_CLASS = "!mt-1.5 !text-[11.5px]";

export const RECEIPT_STAMP_CLASS = cn(
  "grid justify-items-start gap-[7px] pt-0.5",
  "[&_strong]:text-[9px] [&_strong]:tracking-[0.04em] [&_strong]:text-[#5b6e80]",
  "[&>div]:min-h-[66px] [&>div]:w-[min(100%,220px)] [&>div]:rounded-[7px] [&>div]:border [&>div]:border-dashed [&>div]:border-[#aab9c5]",
  "max-[720px]:justify-items-stretch",
);

export const RECEIPT_BARCODE_CLASS = cn(
  "m-0 grid gap-[5px] rounded-[9px] border border-[#dbe4e9] bg-white px-3 pt-[10px] pb-[9px] text-center",
  "[&_svg]:block [&_svg]:h-11 [&_svg]:w-full",
);

export const RECEIPT_BARCODE_CAPTION_CLASS =
  "text-[9.5px] font-extrabold tracking-[0.06em] text-[#6c7e8f]";

export const RECEIPT_BARCODE_VALUE_CLASS =
  "font-mono text-[11px] font-extrabold tracking-[0.03em] text-[#0f2a42]";

export const RECEIPT_FOOTER_CLASS = cn(
  "border-t border-[#dbe4e9] pt-[14px] text-center",
  "[&_p]:m-0 [&_p]:text-[11.5px] [&_p]:text-[#5b6e80]",
  "[&_small]:mt-1 [&_small]:block [&_small]:text-[10.5px] [&_small]:italic [&_small]:text-[#6c7e8f]",
);

export const RECEIPT_ACTIONS_CLASS = "flex flex-wrap justify-end gap-2 print:hidden";
