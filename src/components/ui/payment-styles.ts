import { cn } from "@/utils";

export const PAYMENT_STEPS_CLASS = cn(
  "mb-1 grid grid-cols-4 gap-[clamp(4px,1vw,8px)]",
  "[&>button]:flex [&>button]:min-w-0 [&>button]:cursor-pointer [&>button]:items-center [&>button]:gap-[7px]",
  "[&>button]:rounded-[10px] [&>button]:border [&>button]:border-sre-border [&>button]:bg-sre-paper [&>button]:px-[10px] [&>button]:py-2",
  "[&>button]:text-left [&>button]:text-[12px] [&>button]:font-semibold [&>button]:text-sre-muted",
  "[&>button]:transition-[border-color,color,background]",
  "[&>button:hover]:border-sre-teal [&>button:hover]:text-sre-ink",
  "[&_span[data-step-index]]:grid [&_span[data-step-index]]:size-5 [&_span[data-step-index]]:shrink-0",
  "[&_span[data-step-index]]:place-items-center [&_span[data-step-index]]:rounded-full",
  "[&_span[data-step-index]]:bg-sre-muted-2 [&_span[data-step-index]]:text-[11px] [&_span[data-step-index]]:font-extrabold",
  "[&_span[data-step-index]]:text-sre-paper",
  "[&_strong]:line-clamp-2 [&_strong]:min-w-0 [&_strong]:overflow-hidden [&_strong]:leading-[1.2]",
  "[&_strong]:[overflow-wrap:anywhere]",
  "max-[620px]:gap-1 max-[620px]:[&>button]:flex-col max-[620px]:[&>button]:justify-center max-[620px]:[&>button]:gap-1",
  "max-[620px]:[&>button]:rounded-[8px] max-[620px]:[&>button]:px-[3px] max-[620px]:[&>button]:py-[6px]",
  "max-[620px]:[&>button]:text-center max-[620px]:[&>button]:text-[9px]",
  "max-[620px]:[&_span[data-step-index]]:size-[18px] max-[620px]:[&_span[data-step-index]]:text-[10px]",
  "max-[620px]:[&_strong]:text-[9px] max-[620px]:[&_strong]:leading-[1.15]",
);

export const PAYMENT_STEP_ACTIVE_CLASS = cn(
  "!border-[color-mix(in_srgb,var(--sre-teal)_45%,transparent)] !bg-sre-blue-soft !text-sre-blue",
  "[&_span[data-step-index]]:!bg-sre-teal",
);

export const TAX_TYPE_GROUPS_CLASS = "grid gap-[14px]";

export const TAX_TYPE_GROUP_CLASS = "grid gap-2";

export const TAX_TYPE_GROUP_HEAD_CLASS = cn(
  "flex items-center justify-between gap-[10px]",
  "[&_h3]:m-0 [&_h3]:text-[12px] [&_h3]:font-extrabold [&_h3]:uppercase [&_h3]:tracking-[0.04em] [&_h3]:text-sre-ink",
  "[&_span]:text-[11px] [&_span]:font-bold [&_span]:text-sre-muted",
);

export const TAX_TYPE_SEARCH_CLASS = cn(
  "flex items-center gap-2 rounded-[10px] border border-sre-border bg-sre-paper px-[11px] text-sre-muted",
  "[&_input]:w-full [&_input]:min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-0 [&_input]:py-[9px]",
  "[&_input]:text-[13px] [&_input]:text-sre-ink [&_input]:outline-none",
);

export const TAX_TYPE_EMPTY_CLASS =
  "rounded-[11px] border border-dashed border-sre-border p-4 text-center text-[12.5px] text-sre-muted";

export const TAX_TYPE_GRID_CLASS = cn(
  "grid gap-[10px] [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]",
  "max-[620px]:[grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr))]",
);

export const TAX_TYPE_CARD_CLASS = cn(
  "flex cursor-pointer flex-col gap-1 rounded-[11px] border border-sre-border bg-sre-paper px-3 py-[11px] text-left",
  "transition-[border-color,box-shadow,transform] hover:-translate-y-px hover:border-sre-teal hover:shadow-sre",
  "aria-pressed:border-sre-teal aria-pressed:bg-sre-blue-soft aria-pressed:shadow-[inset_0_0_0_1px_var(--sre-teal)]",
  "[&>strong]:text-[13px] [&>strong]:leading-[1.35] [&>strong]:text-sre-ink [&>strong]:[overflow-wrap:anywhere]",
  "[&>small]:text-[11.5px] [&>small]:text-sre-muted",
);

export const TAX_TYPE_META_CLASS = cn(
  "mt-0.5 flex flex-wrap gap-[5px]",
  "[&>span]:rounded-full [&>span]:border [&>span]:border-sre-border [&>span]:bg-sre-paper [&>span]:px-[7px] [&>span]:py-px",
  "[&>span]:text-[10.5px] [&>span]:font-bold [&>span]:text-sre-blue",
);

export const AMOUNT_INPUT_CLASS = cn(
  "flex items-center gap-[10px] rounded-[10px] border border-sre-border bg-sre-paper px-3",
  "focus-within:border-sre-teal focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--sre-teal)_16%,transparent)]",
  "[&_input]:w-full [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-0 [&_input]:py-[11px]",
  "[&_input]:text-[19px] [&_input]:font-extrabold [&_input]:text-sre-ink [&_input]:outline-none",
  "[&>span]:text-[12px] [&>span]:font-extrabold [&>span]:text-sre-muted",
);

export const AMOUNT_PRESETS_CLASS = cn(
  "flex flex-wrap gap-1.5",
  "[&>button]:cursor-pointer [&>button]:rounded-full [&>button]:border [&>button]:border-transparent",
  "[&>button]:bg-sre-blue-soft [&>button]:px-[10px] [&>button]:py-[5px]",
  "[&>button]:text-[11.5px] [&>button]:font-bold [&>button]:text-sre-blue",
  "[&>button:hover]:border-sre-teal",
);

export const FISCAL_PERIOD_PICKER_CLASS = "grid grid-cols-2 gap-3 max-[620px]:gap-2";

export const PAYMENT_FORM_CLASS = "!grid content-start gap-[13px]";

export const PAYMENT_SUMMARY_STICKY_CLASS =
  "!top-[84px] max-[900px]:!static max-[900px]:order-2 max-[900px]:[grid-row:auto]";

export const PAYMENT_FORM_ORDER_CLASS = "max-[900px]:order-1 max-[900px]:[grid-row:auto]";

export const SUMMARY_LINES_CLASS = cn(
  "m-0 grid gap-[7px]",
  "[&>div]:flex [&>div]:items-baseline [&>div]:justify-between [&>div]:gap-[10px]",
  "[&>div]:border-b [&>div]:border-dashed [&>div]:border-sre-border [&>div]:pb-1.5",
  "[&_dt]:text-[11.5px] [&_dt]:text-sre-muted",
  "[&_dd]:m-0 [&_dd]:text-right [&_dd]:text-[12.5px] [&_dd]:font-bold [&_dd]:text-sre-ink",
);

export const SUMMARY_EMPTY_VALUE_CLASS = "!font-semibold !text-sre-muted-2";

export const STATUS_TRACK_CLASS = cn(
  "grid gap-[10px] rounded-xl border border-sre-border bg-sre-paper px-4 py-[14px] print:hidden",
  "[&>p]:m-0 [&>p]:text-[12px] [&>p]:text-sre-muted",
);

export const STATUS_TRACK_STEPS_CLASS = cn(
  "flex flex-wrap gap-1.5",
  "[&>span]:flex-1 [&>span]:basis-[120px] [&>span]:rounded-[8px] [&>span]:border [&>span]:border-sre-border",
  "[&>span]:bg-sre-bg [&>span]:px-[10px] [&>span]:py-[7px] [&>span]:text-center",
  "[&>span]:text-[11px] [&>span]:font-bold [&>span]:text-sre-muted",
);

export const STATUS_TRACK_ACTIVE_CLASS = "!border-sre-blue !bg-sre-blue !text-sre-paper";

export const STATUS_TRACK_FAILED_CLASS = "!border-sre-red !bg-sre-red !text-sre-paper";

export const FILTER_BAR_CLASS = cn(
  "grid gap-[10px] rounded-xl border border-sre-border bg-sre-paper px-[14px] py-[13px]",
  "[grid-template-columns:repeat(auto-fit,minmax(168px,1fr))]",
  "[&_label]:grid [&_label]:gap-1 [&_label]:text-[11px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-[0.04em] [&_label]:text-sre-muted",
  "[&_label_select]:min-h-[34px] [&_label_select]:rounded-[8px] [&_label_select]:border [&_label_select]:border-sre-border",
  "[&_label_select]:bg-sre-paper [&_label_select]:px-[9px] [&_label_select]:text-[12.5px] [&_label_select]:font-semibold",
  "[&_label_select]:text-sre-ink [&_label_select]:normal-case [&_label_select]:tracking-normal",
  "[&_label_input]:min-h-[34px] [&_label_input]:rounded-[8px] [&_label_input]:border [&_label_input]:border-sre-border",
  "[&_label_input]:bg-sre-paper [&_label_input]:px-[9px] [&_label_input]:text-[12.5px] [&_label_input]:font-semibold",
  "[&_label_input]:text-sre-ink [&_label_input]:normal-case [&_label_input]:tracking-normal",
  "max-[620px]:grid-cols-1",
);

export const FILTER_BAR_ACTIONS_CLASS = "flex items-end gap-2";

export const FILTER_SUMMARY_CLASS = "mt-2 flex flex-wrap items-center gap-1.5";

export const CHART_BARS_CLASS = "grid gap-2";

export const CHART_BAR_ROW_CLASS = cn(
  "grid items-center gap-[9px] text-[12px]",
  "[grid-template-columns:minmax(118px,1.05fr)_minmax(0,2.4fr)_auto]",
  "[&>span:first-child]:line-clamp-2 [&>span:first-child]:overflow-hidden [&>span:first-child]:font-semibold",
  "[&>span:first-child]:leading-[1.25] [&>span:first-child]:text-sre-ink-2",
  "[&>strong]:whitespace-nowrap [&>strong]:text-[11.5px] [&>strong]:font-extrabold [&>strong]:text-sre-ink",
  "max-[620px]:[grid-template-columns:minmax(78px,1fr)_minmax(0,2fr)]",
  "max-[620px]:[&>strong]:col-start-2 max-[620px]:[&>strong]:justify-self-end",
);

export const CHART_BAR_TRACK_CLASS =
  "h-[9px] overflow-hidden rounded-full bg-sre-bg [&>i]:block [&>i]:h-full [&>i]:rounded-[inherit] [&>i]:bg-[linear-gradient(90deg,var(--sre-teal),var(--sre-blue))]";

export const MINI_LIST_CLASS = cn(
  "m-0 grid list-none gap-1.5 p-0",
  "[&>li]:flex [&>li]:items-center [&>li]:justify-between [&>li]:gap-[10px]",
  "[&>li]:rounded-[9px] [&>li]:border [&>li]:border-sre-border [&>li]:bg-sre-bg [&>li]:px-[10px] [&>li]:py-2",
  "[&>li]:text-[12px]",
  "[&_strong]:text-[12px] [&_strong]:text-sre-ink",
  "[&_small]:block [&_small]:text-[10.5px] [&_small]:text-sre-muted",
);

export const INLINE_LOADER_CLASS = cn(
  "flex items-center gap-2 rounded-[10px] border border-dashed border-sre-border bg-sre-bg px-[14px] py-3",
  "text-[12px] text-sre-muted",
  "[&>i]:size-3 [&>i]:animate-spin [&>i]:rounded-full [&>i]:border-2 [&>i]:border-sre-border",
  "[&>i]:border-t-sre-teal [&>i]:[animation-duration:0.75s]",
);
