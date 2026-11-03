import { cn } from "@/utils";

export const KPI_GRID_CLASS =
  "grid gap-[10px] [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]";

export const KPI_CLASS =
  "flex flex-col gap-[3px] rounded-xl border border-sre-border bg-sre-paper px-[14px] py-[13px] " +
  "[&>span]:flex [&>span]:items-center [&>span]:gap-1.5 [&>span]:text-[10.5px] [&>span]:font-[800] " +
  "[&>span]:uppercase [&>span]:tracking-[0.05em] [&>span]:text-sre-muted " +
  "[&>strong]:text-[21px] [&>strong]:font-[800] [&>strong]:break-words [&>strong]:text-sre-ink " +
  "[&>small]:text-[11px] [&>small]:text-sre-muted";

export const KPI_CONFIRMED_CLASS = cn(
  KPI_CLASS,
  "is-confirmed border-[color-mix(in_srgb,var(--sre-success)_35%,var(--sre-border))] " +
    "bg-[linear-gradient(180deg,var(--sre-teal-soft),var(--sre-paper)_65%)]",
);

const BADGE_BASE =
  "inline-flex min-h-[22px] items-center gap-[5px] whitespace-nowrap rounded-[6px] border px-[7px] " +
  "text-[12px] font-[740] [&_i]:size-[5px] [&_i]:flex-none [&_i]:rounded-full [&_i]:bg-current";

const BADGE_TONES = {
  neutral: "border-[#e5eaec] bg-[#f7f9fa] text-[#667680]",
  success: "border-[#dfefe9] bg-[#f0f8f5] text-[#357f69]",
  attention: "border-[#f0e7d9] bg-[#fbf6ed] text-[#a87335]",
  warning: "border-[#efe3d1] bg-[#fbf4e9] text-[#936129]",
  error: "border-[#f0dddd] bg-[#fbf0f0] text-[#a44849]",
  blue: "border-[#dfecef] bg-[#eff6f7] text-[#326f87]",
  violet: "border-[#e7e2f0] bg-[#f5f2f9] text-[#725e9d]",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export const badgeClass = (tone: BadgeTone = "neutral") => cn(BADGE_BASE, BADGE_TONES[tone]);

export const COMPACT_FILTER_CLASS =
  "compact-filter-sre inline-flex min-h-8 items-center gap-[7px] whitespace-nowrap rounded-[7px] border border-[#e2e8ea] " +
  "bg-white px-2 text-[11px] text-[#85949b] " +
  "[&_select]:max-w-[190px] [&_select]:border-0 [&_select]:bg-transparent [&_select]:text-[11px] [&_select]:text-sre-ink [&_select]:outline-none " +
  "dark:border-sre-border dark:bg-sre-paper dark:text-sre-ink-2 dark:focus-within:border-sre-teal " +
  "dark:[&_select]:bg-sre-paper dark:[&_select]:text-sre-ink dark:[&_select]:[color-scheme:dark] " +
  "dark:[&_option]:bg-sre-paper dark:[&_option]:text-sre-ink " +
  "max-[720px]:[&_select]:max-w-[155px]";

export const FILTER_CHIP_CLASS =
  "inline-flex items-center gap-[5px] rounded-full border border-sre-border bg-sre-blue-soft " +
  "px-[9px] py-[3px] text-[11px] font-[700] text-sre-blue";

export const STAT_CARD_SRE_CLASS = cn(
  "flex min-w-0 items-start gap-3 rounded-[11px] border border-sre-border",
  "bg-sre-paper px-3.5 py-4 shadow-[0_2px_8px_rgba(20,46,63,0.02)]",
  "max-[720px]:gap-2 max-[720px]:px-[9px] max-[720px]:py-3 max-[460px]:flex-col",
  "dark:border-sre-border dark:bg-sre-paper",
  "dark:[&>div>span]:text-sre-muted dark:[&>div>strong]:text-sre-ink",
  "[&>div]:flex [&>div]:min-w-0 [&>div]:flex-col [&>div]:gap-1",
  "[&>div>span]:overflow-hidden [&>div>span]:text-ellipsis [&>div>span]:whitespace-nowrap",
  "[&>div>span]:text-[11px] [&>div>span]:font-[600] [&>div>span]:text-[#778891]",
  "[&>div>span]:max-[460px]:whitespace-normal",
  "[&>div>strong]:overflow-hidden [&>div>strong]:text-ellipsis [&>div>strong]:whitespace-nowrap",
  "[&>div>strong]:text-[clamp(16px,1.6vw,21px)] [&>div>strong]:font-[790]",
  "[&>div>strong]:tracking-[-0.6px] [&>div>strong]:text-sre-ink",
  "[&>div>strong]:max-[720px]:text-[17px] [&>div>strong]:max-[460px]:text-[16px]",
  "[&>div>small]:overflow-hidden [&>div>small]:text-ellipsis [&>div>small]:text-[10px]",
  "[&>div>small]:leading-[1.4] [&>div>small]:text-[#92a0a6]",
);

const STAT_ICON_TONES = {
  blue: "bg-[#e8f2f6] text-[#276c88]",
  green: "bg-[#e8f5f1] text-[#278478]",
  orange: "bg-[#fbf2e5] text-[#b27936]",
  violet: "bg-[#f1eef7] text-[#7662a6]",
  red: "bg-[#fbebeb] text-[#a84d4d]",
} as const;

export const statCardIconClass = (tone: keyof typeof STAT_ICON_TONES = "blue") =>
  cn(
    "grid size-[34px] flex-none place-items-center rounded-[9px] max-[720px]:size-[29px]",
    STAT_ICON_TONES[tone],
  );

export const MONO_CLASS = "font-mono tracking-[0.02em]";

export const SUCCESS_TEXT_CLASS =
  "inline-flex items-center gap-1 text-[12px] font-[700] text-[#45806c] dark:text-sre-success";

export const ATTENTION_TEXT_CLASS =
  "inline-flex items-center gap-1 text-[12px] font-[720] text-[#a26e30] dark:text-sre-warning";

export const SUBTLE_LINK_CLASS =
  "inline-flex items-center gap-[5px] whitespace-nowrap text-[11px] font-[700] text-sre-blue transition-colors hover:text-sre-teal";
