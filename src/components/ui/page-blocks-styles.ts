import { cn } from "@/utils";

export const NOTIFICATION_CARD_CLASS = cn(
  "flex gap-[11px] rounded-[10px] border border-sre-border bg-sre-paper p-[13px_14px]",
  "[&>div]:min-w-0 [&>div]:flex-1",
  "[&>span]:grid [&>span]:size-[31px] [&>span]:flex-none [&>span]:place-items-center",
  "[&>span]:rounded-[9px] [&>span]:bg-[#eef5f6] [&>span]:text-sre-blue",
  "[&_p]:my-[5px] [&_p]:mb-[9px] [&_p]:text-[11px] [&_p]:leading-[1.6] [&_p]:text-[#788b92]",
);

export const NOTIFICATION_CARD_UNREAD_CLASS = "border-l-[3px] border-l-sre-teal bg-[#fbfdfd]";

export const NOTIFICATION_CARD_ROW_CLASS = cn(
  "flex justify-between gap-[10px]",
  "max-[460px]:flex-col max-[460px]:items-start max-[460px]:gap-1",
  "[&_strong]:text-[12px] [&_strong]:text-[#3e5964]",
  "[&_small]:whitespace-nowrap [&_small]:text-[12px] [&_small]:text-[#9ba7ab]",
);

export const NOTIFICATION_CARD_FOOTER_CLASS = cn(
  "flex flex-wrap items-center gap-[6px]",
  "[&>a]:inline-flex [&>a]:cursor-pointer [&>a]:items-center [&>a]:gap-1 [&>a]:border-0",
  "[&>a]:bg-transparent [&>a]:px-0 [&>a]:py-[3px] [&>a]:text-[12px] [&>a]:font-[680] [&>a]:text-sre-blue",
  "[&>button]:inline-flex [&>button]:cursor-pointer [&>button]:items-center [&>button]:gap-1",
  "[&>button]:border-0 [&>button]:bg-transparent [&>button]:px-0 [&>button]:py-[3px]",
  "[&>button]:text-[12px] [&>button]:font-[680] [&>button]:text-sre-blue",
);

export const SETTINGS_GRID_CLASS = "mb-3.5 grid grid-cols-2 gap-[13px] max-[720px]:grid-cols-1";

export const ADMIN_SETTINGS_GRID_CLASS = cn(
  "grid items-start gap-3.5",
  "[grid-template-columns:minmax(0,1.25fr)_minmax(280px,0.75fr)]",
  "max-[920px]:[grid-template-columns:minmax(0,1fr)_minmax(245px,0.8fr)]",
  "max-[720px]:grid-cols-1",
);

export const SETTING_ROW_CLASS = cn(
  "flex items-center gap-[10px] p-[13px]",
  "[&>span]:grid [&>span]:size-[31px] [&>span]:flex-none [&>span]:place-items-center",
  "[&>span]:rounded-lg [&>span]:bg-[#eef5f6] [&>span]:text-sre-blue",
  "[&>div]:min-w-0 [&>div]:flex-1",
  "[&_h2]:m-0 [&_h2]:text-[12px] [&_h2]:text-sre-ink",
  "[&_p]:mt-1 [&_p]:mb-0 [&_p]:text-[12px] [&_p]:leading-[1.5] [&_p]:text-[#85949b]",
);

export const PROFILE_NOTE_CLASS = "mt-[13px]";

export const PASSWORD_CHANGE_CLASS = cn(
  "max-w-[580px] p-[25px]",
  "[&_h1]:mx-0 [&_h1]:mt-[10px] [&_h1]:mb-[7px] [&_h1]:text-[21px] [&_h1]:tracking-[-0.55px]",
  "[&_h1]:text-sre-ink",
  "[&>p]:mt-0 [&>p]:mb-[18px] [&>p]:text-[12px] [&>p]:leading-[1.55] [&>p]:text-[#7a8d94]",
);

export const OBLIGATION_MINI_ROW_CLASS = cn(
  "grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-[10px]",
  "border-t border-[#eff2f3] px-0 py-[10px]",
  "[&>div]:flex [&>div]:min-w-0 [&>div]:flex-col [&>div]:gap-[3px]",
  "[&_strong]:overflow-hidden [&_strong]:text-ellipsis [&_strong]:whitespace-nowrap",
  "[&_strong]:text-[12px] [&_strong]:text-[#506873]",
  "[&_small]:text-[11px] [&_small]:text-[#99a5a9]",
  "[&_span]:whitespace-nowrap [&_span]:text-[12px] [&_span]:font-[700] [&_span]:text-[#536d77]",
);

export const EXCEL_DROP_ZONE_CLASS = cn(
  "flex min-h-[290px] flex-col items-center justify-center border-dashed p-7 text-center",
  "bg-[linear-gradient(140deg,#fff,#f8fbfb)] dark:bg-sre-paper",
  "[&_h2]:m-0 [&_h2]:text-[12px] [&_h2]:text-sre-ink",
  "[&>p]:mx-auto [&>p]:mt-[7px] [&>p]:mb-[15px] [&>p]:max-w-[530px] [&>p]:text-[11px] [&>p]:leading-[1.65] [&>p]:text-[#82939a]",
  "[&_label]:relative [&_label]:cursor-pointer",
  "[&_input[type=file]]:absolute [&_input[type=file]]:inset-0 [&_input[type=file]]:size-full",
  "[&_input[type=file]]:cursor-pointer [&_input[type=file]]:opacity-0",
);

export const EXCEL_DROP_ZONE_ICON_CLASS = cn(
  "mb-3 grid size-[55px] place-items-center rounded-2xl border border-[#dfeaec]",
  "bg-[#eff6f7] text-[#2b7688] dark:border-sre-border dark:bg-sre-blue-soft",
);

export const IMPORT_HELP_CLASS = cn(
  "mt-4 max-w-[570px] rounded-lg border border-[#e8edef] bg-sre-paper p-[11px_14px] text-left",
  "[&_strong]:text-[12px] [&_strong]:text-[#5c747d]",
  "[&_p]:mt-1 [&_p]:mb-0 [&_p]:text-[12px] [&_p]:leading-[1.55] [&_p]:text-[#91a0a5]",
);

export const FILE_IMPORT_CLASS = cn(
  "mb-3.5 flex items-center justify-between gap-3",
  "max-[460px]:flex-col max-[460px]:items-start",
  "[&>div:first-child]:flex [&>div:first-child]:items-center [&>div:first-child]:gap-[9px]",
  "[&>div:first-child>div]:flex [&>div:first-child>div]:flex-col [&>div:first-child>div]:gap-1",
  "[&_strong]:text-[11px] [&_strong]:text-[#425e69]",
  "[&_small]:text-[12px] [&_small]:text-[#93a0a5]",
  "[&>div:last-child]:max-[460px]:w-full [&>div:last-child]:max-[460px]:justify-between",
);

export const FILE_ICON_CLASS =
  "grid size-[34px] place-items-center rounded-[9px] bg-[#eaf3f5] text-[#37788c]";

export const EXCEL_MAPPING_GRID_CLASS = cn(
  "grid grid-cols-3 gap-[11px] max-[720px]:grid-cols-2 max-[460px]:grid-cols-1",
  "[&_label]:flex [&_label]:min-w-0 [&_label]:flex-col [&_label]:gap-[5px]",
  "[&_label]:text-[12px] [&_label]:font-[680] [&_label]:text-[#627981]",
  "[&_label_em]:text-[11px] [&_label_em]:not-italic [&_label_em]:text-[#a5683e]",
  "[&_.field-sre]:min-h-8 [&_.field-sre]:text-[12px]",
);

export const IMPORT_STEP_BADGE_CLASS = cn(
  "grid h-[25px] min-w-[31px] place-items-center rounded-[7px] bg-[#eff5f6] px-[7px]",
  "text-[12px] font-[750] text-[#4d7580]",
);

export const EXCEL_PREVIEW_TABLE_CLASS = cn(
  "!min-w-[600px]",
  "[&_td]:max-w-[180px] [&_td]:overflow-hidden [&_td]:text-ellipsis [&_td]:whitespace-nowrap",
);

export const IMPORT_TEMPLATE_LINK_CLASS = cn(
  "mt-[9px] inline-flex items-center gap-1.5 text-[12px] font-[730] text-[#347c7a]",
  "hover:underline hover:underline-offset-[3px]",
);

export const ANALYSIS_RESULT_CLASS = "mb-3.5";

export const IMPORT_ANALYSIS_SUMMARY_CLASS = cn(
  "mb-[13px] flex flex-wrap gap-[9px]",
  "max-[460px]:[&>div]:min-w-[calc(50%-5px)]",
  "[&>div]:flex [&>div]:min-w-[100px] [&>div]:flex-col [&>div]:gap-1",
  "[&>div]:rounded-lg [&>div]:border [&>div]:border-[#e7ecee] [&>div]:bg-[#fbfcfc]",
  "[&>div]:px-3 [&>div]:py-[9px]",
  "[&>div_strong]:text-[16px] [&>div_strong]:text-[#345865]",
  "[&>div_span]:text-[12px] [&>div_span]:text-[#87969a]",
  "dark:[&>div]:border-sre-border dark:[&>div]:bg-sre-teal-soft",
);

const SUMMARY_TONES = {
  valid: "border-[#dfece6] bg-[#f3f8f5] dark:border-[#285342] dark:bg-[#14302a]",
  duplicate: "border-[#efe5d8] bg-[#fbf7f0] dark:border-[#554323] dark:bg-[#322714]",
  error: "border-[#eedede] bg-[#fcf5f5] dark:border-[#6e3438] dark:bg-[#3a1d20]",
} as const;

export const importSummaryToneClass = (tone: keyof typeof SUMMARY_TONES) =>
  cn("!rounded-lg !border", SUMMARY_TONES[tone]);

export const IMPORT_ROW_ERROR_CLASS =
  "my-0.5 block max-w-[300px] whitespace-normal !text-[11px] !leading-[1.4] text-[#a04c4d]";

export const IMPORT_ERROR_DETAILS_CLASS = cn(
  "my-3 text-[12px] text-[#9c6643]",
  "[&_summary]:inline-flex [&_summary]:cursor-pointer [&_summary]:items-center [&_summary]:gap-[5px]",
  "[&_ul]:max-h-[190px] [&_ul]:overflow-auto [&_ul]:rounded-[7px] [&_ul]:border [&_ul]:border-[#efe7dc]",
  "[&_ul]:bg-[#fcf9f4] [&_ul]:p-[10px_10px_10px_25px] [&_ul]:leading-[1.7] [&_ul]:text-[#916e58]",
  "dark:[&_ul]:border-sre-border dark:[&_ul]:bg-sre-blue-soft dark:[&_ul]:text-sre-muted",
);

export const IMPORT_REPORT_CLASS = "mt-3.5";

export const PAYMENT_DECISION_ACTIONS_CLASS = cn(
  "mt-[13px] flex flex-wrap gap-[7px] border-t border-[#edf0f1] pt-[13px]",
  "[&_.btn-sre]:max-[720px]:flex-[1_1_auto]",
);

export const PAYMENT_MODE_CHOICE_CLASS = "grid grid-cols-2 gap-2 max-[460px]:grid-cols-1";

export const PAYMENT_MODE_CLASS = cn(
  "flex min-h-14 cursor-pointer items-center gap-2 rounded-lg border border-[#e1e9eb]",
  "bg-sre-paper p-2 text-left text-[#6d828a] dark:border-sre-border dark:text-sre-ink-2",
  "[&>span]:flex [&>span]:min-w-0 [&>span]:flex-1 [&>span]:flex-col [&>span]:gap-1",
  "[&_strong]:text-[12px] [&_strong]:text-[#435e68] dark:[&_strong]:text-sre-ink",
  "[&_small]:text-[11px] [&_small]:text-[#92a0a5] dark:[&_small]:text-sre-muted",
);

export const PAYMENT_MODE_ACTIVE_CLASS = cn(
  "border-[#8bb9b7] bg-[#f3faf8] text-sre-teal shadow-[0_0_0_2px_rgba(8,127,122,0.06)]",
  "dark:bg-sre-teal-soft",
  "[&_strong]:text-[#166e69]",
);

export const PAYMENT_FORM_GRID_CLASS = cn(
  "grid items-start gap-3.5 [grid-template-columns:minmax(0,1.35fr)_minmax(260px,0.7fr)]",
  "max-[920px]:[grid-template-columns:minmax(0,1fr)_minmax(245px,0.8fr)]",
  "max-[720px]:grid-cols-1",
  "[&>form]:max-[900px]:order-1",
  "[&>aside]:max-[900px]:order-2",
);
