import { cn } from "@/utils";

export const HELP_PAGE_CLASS = "min-h-[100dvh] bg-sre-bg";

export const HELP_PAGE_AREA_CLASS = "!min-h-0 !bg-transparent";

export const HELP_CONTENT_CLASS = "mx-auto max-w-[1060px] px-[18px] pt-[26px] pb-[60px]";

export const HELP_HEADER_CLASS = cn(
  "[&_h1]:m-0 [&_h1]:mb-1.5 [&_h1]:flex [&_h1]:items-center [&_h1]:gap-[9px]",
  "[&_h1]:text-[22px] [&_h1]:text-sre-ink",
  "[&_p]:m-0 [&_p]:mb-[18px] [&_p]:text-[13px] [&_p]:text-sre-ink-2",
);

export const HELP_BODY_CLASS =
  "grid grid-cols-[220px_minmax(0,1fr)] gap-[18px] max-[860px]:grid-cols-1";

export const HELP_TOC_CLASS = cn(
  "sticky top-[14px] flex flex-col gap-[7px] self-start rounded-[12px] border border-sre-border",
  "bg-sre-paper p-[14px]",
  "[&_strong]:text-[11px] [&_strong]:uppercase [&_strong]:tracking-[0.08em] [&_strong]:text-sre-ink-2",
  "[&_a]:text-[12.5px] [&_a]:text-sre-blue-dark [&_a]:no-underline [&_a:hover]:underline",
  "max-[860px]:static",
);

export const HELP_SECTIONS_CLASS = "flex flex-col gap-[14px]";

export const HELP_SECTION_CLASS = cn(
  "scroll-mt-[16px] rounded-[12px] border border-sre-border bg-sre-paper px-5 py-[18px]",
  "[&_h2]:m-0 [&_h2]:mb-1.5 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-2",
  "[&_h2]:text-[15.5px] [&_h2]:text-sre-ink",
  "[&_ul]:m-0 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-[7px] [&_ul]:pl-[18px]",
  "[&_li]:text-[12.5px] [&_li]:leading-[1.55] [&_li]:text-sre-ink",
);

export const HELP_SUMMARY_CLASS = "m-0 mb-2.5 text-[12.5px] text-sre-ink-2";

export const HELP_FOOTER_CLASS =
  "mx-0.5 mt-1.5 text-[12.5px] text-sre-ink-2 [&_a]:font-[650] [&_a]:text-sre-blue-dark";
