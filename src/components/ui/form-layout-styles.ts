import { cn } from "@/utils";

const LABEL_RULES =
  "[&_label]:flex [&_label]:min-w-0 [&_label]:flex-col [&_label]:gap-[6px] " +
  "[&_label]:text-[12px] [&_label]:font-[680] [&_label]:text-[#546b75] " +
  "[&_label>small]:inline [&_label>small]:text-[10px] [&_label>small]:font-[450] [&_label>small]:text-[#93a1a6] " +
  "dark:[&_label]:text-sre-muted dark:[&_label>small]:text-sre-muted-2";

export const FORM_CLASS = `flex flex-col gap-[10px] ${LABEL_RULES}`;

export const FORM_GRID_CLASS = `grid grid-cols-1 gap-x-3 gap-y-[13px] ${LABEL_RULES}`;

export const COMPACT_FORM_CLASS = "gap-2 [&_label]:gap-1 [&_.field-sre]:min-h-[34px]";

export const FORM_ACTIONS_CLASS =
  "mt-[3px] flex flex-wrap justify-end gap-2 max-md:justify-stretch max-md:[&>.btn-sre]:flex-1";

export const FIELD_WIDE_CLASS = "col-span-full max-md:col-auto";

export const withFormLayout = (base: string, extra?: string) => cn(base, extra);
