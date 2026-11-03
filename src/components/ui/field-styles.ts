import { cn } from "@/utils";

const FIELD_BASE =
  "field-sre w-full rounded-[7px] border border-[#dde5e8] bg-white px-[10px] text-[12px] font-[470] text-sre-ink outline-none transition " +
  "placeholder:text-[#a5b1b5] focus:border-[#8eafb8] focus:shadow-[0_0_0_3px_rgba(21,86,116,0.07)] " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  "dark:border-sre-border dark:bg-sre-paper dark:text-sre-ink dark:placeholder:text-[#7e97a1]";

export const FIELD_INPUT_CLASS = cn(FIELD_BASE, "min-h-[37px]");

export const FIELD_SELECT_CLASS = cn(FIELD_BASE, "min-h-[37px] pr-[26px]");

export const FIELD_TEXTAREA_CLASS = cn(
  FIELD_BASE,
  "min-h-[74px] resize-y px-[10px] py-[9px] font-[450] leading-[1.5]",
);
