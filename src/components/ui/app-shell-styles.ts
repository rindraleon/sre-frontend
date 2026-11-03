import { cn } from "@/utils";

export const APP_SHELL_CLASS = "flex min-h-dvh bg-sre-bg text-sre-ink print:!bg-white";

export const APP_CONTENT_CLASS =
  "flex min-h-dvh min-w-0 flex-1 flex-col print:!m-0 print:!block print:!h-auto print:!min-h-0 print:!w-auto print:!overflow-visible print:!bg-white print:!p-0";

export const sidebarClass = (isOpen: boolean) =>
  cn(
    "sticky top-0 z-50 flex h-dvh flex-[0_0_258px] flex-col overflow-hidden border-r border-sre-border bg-sre-paper",
    "w-[258px]",
    "max-[1180px]:w-[236px] max-[1180px]:basis-[236px]",
    "max-[920px]:fixed max-[920px]:inset-y-0 max-[920px]:left-0 max-[920px]:z-[90] max-[920px]:h-dvh max-[920px]:w-[272px]",
    "max-[920px]:-translate-x-[105%] max-[920px]:transition-transform max-[920px]:duration-200",
    "max-[920px]:shadow-[12px_0_35px_rgba(14,40,51,0.15)]",
    isOpen && "max-[920px]:translate-x-0",
    "print:!hidden",
  );

export const BRAND_LINK_CLASS = "flex min-w-0 items-center gap-[11px] text-sre-ink";

export const SIDEBAR_BRAND_CLASS =
  "flex h-[72px] min-w-0 flex-[0_0_72px] items-center gap-[11px] px-[19px] text-sre-ink";

export const SIDEBAR_CLOSE_CLASS = cn(
  "absolute top-[14px] right-3 hidden size-[38px] cursor-pointer place-items-center",
  "border border-sre-border bg-sre-paper text-sre-ink max-[920px]:grid",
  "rounded-[var(--radius-button)]",
);

export const SIDEBAR_LABEL_CLASS =
  "px-5 pb-2 text-[12px] font-[800] tracking-[1.05px] text-[#9ba8ad]";

export const SIDEBAR_NAV_CLASS =
  "flex-1 overflow-y-auto px-[10px] pb-3 [scrollbar-color:#dfe7e9_transparent] [scrollbar-width:thin]";

export const NAV_LINK_CLASS = cn(
  "relative my-0.5 flex min-h-[38px] items-center gap-[11px] rounded-lg border border-transparent",
  "px-[10px] text-[11px] font-[560] text-[#687b86] transition-[background-color,color,border-color] duration-150",
  "hover:bg-[#f5f8f9] hover:text-sre-ink",
  "[&>svg]:shrink-0 [&>svg]:text-[#8b9ca4]",
  "[&>span]:min-w-0 [&>span]:flex-1",
  "dark:text-sre-muted dark:[&>svg]:text-sre-muted-2 dark:hover:bg-sre-blue-soft",
  "max-lg:text-[12px]",
);

export const NAV_LINK_ACTIVE_CLASS = cn(
  "border-[#dce9ed] bg-[#eef5f6] font-[720] text-sre-blue-dark [&>svg]:text-sre-teal",
  "dark:border-sre-border dark:bg-sre-blue-soft dark:text-sre-ink",
);

export const NAV_BADGE_CLASS = cn(
  "inline-grid h-[19px] min-w-[19px] place-items-center rounded-md bg-[#fcf0e3] px-[5px]",
  "text-[11px] font-[800] not-italic text-[#9a5d2e]",
  "dark:bg-sre-gold-soft dark:text-sre-gold",
);

export const MENU_OVERLAY_CLASS = cn(
  "hidden",
  "max-[920px]:fixed max-[920px]:inset-0 max-[920px]:z-[80] max-[920px]:block",
  "max-[920px]:border-0 max-[920px]:bg-[rgba(17,39,50,0.35)]",
);

export const TOPBAR_CLASS = cn(
  "sticky top-0 z-[35] flex min-h-[66px] items-center justify-between gap-4",
  "border-b border-sre-border bg-white/[0.94] px-[30px] backdrop-blur-md",
  "max-[1180px]:px-[22px] max-[720px]:min-h-[60px] max-[720px]:px-3.5 max-[460px]:px-2.5",
  "dark:bg-sre-paper",
  "print:!hidden",
);

export const TOPBAR_LEFT_CLASS = cn(
  "flex min-w-0 items-center gap-[17px] max-[720px]:gap-2",
  "[&>div]:flex [&>div]:min-w-0 [&>div]:flex-col [&>div]:gap-[3px]",
  "[&>div>span]:text-[12px] [&>div>span]:font-[800] [&>div>span]:tracking-[1.1px] [&>div>span]:text-[#a0acb1]",
  "[&>div>span]:max-[720px]:text-[11px]",
  "[&>div>strong]:overflow-hidden [&>div>strong]:text-[11px] [&>div>strong]:font-[710] [&>div>strong]:text-ellipsis",
  "[&>div>strong]:whitespace-nowrap [&>div>strong]:text-sre-ink",
  "[&>div>strong]:max-[720px]:max-w-[170px] [&>div>strong]:max-[460px]:max-w-[120px]",
);

export const TOPBAR_RIGHT_CLASS = "flex min-w-0 items-center gap-3.5 max-[720px]:gap-2";

export const TOPBAR_MENU_BUTTON_CLASS = cn(
  "hidden size-[34px] place-items-center border border-sre-border bg-sre-paper text-sre-ink",
  "rounded-[var(--radius-button)] max-[920px]:grid max-[460px]:size-[30px]",
);

export const TOPBAR_ACTION_CLASS = cn(
  "relative grid size-[34px] place-items-center rounded-lg border border-transparent text-[#7a8a92]",
  "hover:border-sre-border hover:bg-[#f6f9fa] hover:text-sre-blue dark:hover:bg-sre-blue-soft",
  "[&>i]:absolute [&>i]:top-px [&>i]:right-px [&>i]:grid [&>i]:h-[15px] [&>i]:min-w-[15px]",
  "[&>i]:place-items-center [&>i]:rounded-full [&>i]:border-2 [&>i]:border-white",
  "[&>i]:bg-[#c56a56] [&>i]:px-[3px] [&>i]:text-[12px] [&>i]:not-italic [&>i]:text-white",
  "dark:[&>i]:border-sre-paper",
);

export const SESSION_BUTTON_CLASS = cn(
  "flex cursor-pointer items-center gap-2 rounded-[10px] border-0 bg-transparent px-1.5 py-1 text-left",
  "hover:bg-[rgba(21,86,116,0.07)]",
  "[&>span]:grid [&>span]:size-[33px] [&>span]:flex-none [&>span]:place-items-center",
  "[&>span]:rounded-full [&>span]:border-2 [&>span]:border-white [&>span]:bg-[#e5f0f2]",
  "[&>span]:text-[11px] [&>span]:font-[800] [&>span]:text-sre-blue",
  "[&>span]:shadow-[0_0_0_1px_var(--sre-border)]",
  "[&>span]:max-[720px]:size-[29px]",
  "[&>div]:flex [&>div]:max-w-[158px] [&>div]:flex-col [&>div]:gap-[3px] [&>div]:max-[720px]:hidden",
  "[&>strong]:overflow-hidden [&>strong]:text-[12px] [&>strong]:text-ellipsis [&>strong]:whitespace-nowrap",
  "[&>strong]:text-sre-ink",
  "[&>small]:text-[11px] [&>small]:text-sre-muted-2",
  "max-[460px]:hidden",
);

export const USER_MENU_PANEL_CLASS = cn(
  "absolute top-[calc(100%+8px)] right-0 z-[120] flex w-[min(264px,calc(100vw-24px))]",
  "animate-[appear_0.15s_ease-out] flex-col gap-0.5 rounded-xl border border-sre-border",
  "bg-sre-paper p-2 shadow-[0_18px_44px_rgba(15,34,64,0.16)]",
);

export const USER_MENU_IDENTITY_CLASS = cn(
  "mb-1.5 flex flex-col gap-0.5 border-b border-sre-border px-[10px] pt-2 pb-[10px]",
  "[&_strong]:text-[13px] [&_strong]:text-sre-ink [&_strong]:[overflow-wrap:anywhere]",
  "[&_small]:text-[12px] [&_small]:text-sre-muted [&_small]:[overflow-wrap:anywhere]",
);

export const USER_MENU_ITEM_CLASS = cn(
  "flex min-h-10 w-full cursor-pointer items-center gap-[9px] rounded-lg border-0 bg-transparent",
  "px-[10px] py-2 text-left text-[13px] font-[620] text-sre-ink",
  "hover:bg-sre-blue-soft focus-visible:bg-sre-blue-soft",
  "rounded-[var(--radius-button)]",
);

export const APP_FOOTER_CLASS = cn(
  "flex min-h-[42px] items-center justify-between gap-3 border-t border-sre-border",
  "bg-sre-paper px-[30px] text-[11px] text-[#95a2a8]",
  "max-[1180px]:px-[22px]",
  "max-[720px]:min-h-[38px] max-[720px]:flex-col max-[720px]:items-start max-[720px]:justify-center",
  "max-[720px]:gap-[3px] max-[720px]:px-4 max-[720px]:py-1.5",
  "[&>span:last-child]:inline-flex [&>span:last-child]:items-center [&>span:last-child]:gap-[5px]",
  "[&>span:last-child]:text-[#718f89]",
  "dark:text-sre-muted dark:[&>span:last-child]:text-sre-ink-2",
  "print:!hidden",
);

export const CONTENT_AREA_CLASS = cn(
  "mx-auto w-full max-w-[1660px] flex-1 px-[30px] pt-[27px] pb-[34px]",
  "max-[1180px]:px-[22px] max-[720px]:pt-[19px] max-[720px]:pb-[26px]",
  "max-[460px]:!px-[11px]",
  "print:!m-0 print:!block print:!h-auto print:!w-auto print:!overflow-visible print:!bg-white print:!p-0",
);

export const BREADCRUMB_CLASS = cn(
  "mb-[11px] flex flex-wrap items-center gap-[7px] text-[11px] text-[#a0acb2]",
  "[&_i]:mr-[7px] [&_i]:not-italic [&_i]:text-[#c2cbce]",
);

export const NAVIGATION_PROGRESS_CLASS = cn(
  "pointer-events-none fixed inset-x-0 top-0 z-[1200] h-[3px] overflow-hidden bg-transparent",
  "[&>span]:block [&>span]:h-full [&>span]:w-[40%]",
  "[&>span]:bg-[linear-gradient(90deg,var(--sre-teal),var(--sre-blue))]",
  "[&>span]:animate-nav-progress motion-reduce:[&>span]:w-full motion-reduce:[&>span]:animate-none",
);
