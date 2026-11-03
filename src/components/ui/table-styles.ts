import { cn } from "@/utils";

const SCROLL_CONTAINER = cn(
  "w-full max-w-full overflow-x-auto overscroll-x-contain [scrollbar-color:#dae4e7_transparent]",
  "[scrollbar-gutter:stable] [scrollbar-width:thin] dark:[scrollbar-color:var(--sre-border)_transparent]",
  "max-lg:!w-full max-lg:!overflow-visible",
);

const CARD_TABLE = [
  "max-lg:block max-lg:w-full max-lg:min-w-0 max-lg:border-separate max-lg:border-spacing-0",
  "max-lg:[&>thead]:hidden",
  "max-lg:[&>tbody]:grid max-lg:[&>tbody]:gap-[11px]",
  "max-lg:[&>tbody>tr]:block max-lg:[&>tbody>tr]:overflow-hidden",
  "max-lg:[&>tbody>tr]:rounded-xl max-lg:[&>tbody>tr]:border",
  "max-lg:[&>tbody>tr]:border-sre-border max-lg:[&>tbody>tr]:!bg-sre-paper",
  "max-lg:[&>tbody>tr]:shadow-[0_5px_16px_rgba(20,52,39,0.055)]",
  "max-lg:[&>tbody>tr]:transition-[box-shadow,border-color] max-lg:[&>tbody>tr]:duration-150",
  "max-lg:[&>tbody>tr:hover]:!bg-sre-paper",
  "max-lg:[&>tbody>tr:hover]:[border-color:color-mix(in_srgb,var(--sre-teal,#147f62)_38%,var(--sre-border,#dce7df))]",
  "max-lg:[&>tbody>tr:hover]:shadow-[0_8px_20px_rgba(20,52,39,0.09)]",
].join(" ");

const CARD_CELLS = [
  "max-lg:[&>tbody>tr>td]:grid max-lg:[&>tbody>tr>td]:!w-full",
  "max-lg:[&>tbody>tr>td]:min-w-0 max-lg:[&>tbody>tr>td]:min-h-0",
  "max-lg:[&>tbody>tr>td]:grid-cols-[minmax(96px,35%)_minmax(0,1fr)]",
  "max-lg:[&>tbody>tr>td]:items-start max-lg:[&>tbody>tr>td]:gap-[10px]",
  "max-lg:[&>tbody>tr>td]:p-[10px_12px] max-lg:[&>tbody>tr>td]:align-top",
  "max-lg:[&>tbody>tr>td]:text-[12px] max-lg:[&>tbody>tr>td]:leading-[1.45]",
  "max-lg:[&>tbody>tr>td]:text-sre-ink max-lg:[&>tbody>tr>td]:whitespace-normal",
  "max-lg:[&>tbody>tr>td]:[overflow-wrap:anywhere]",
  "max-lg:[&>tbody>tr>td]:border-0 max-lg:[&>tbody>tr>td]:border-b",
  "max-lg:[&>tbody>tr>td]:[border-bottom-color:color-mix(in_srgb,var(--sre-border,#dce7df)_72%,transparent)]",
  "max-lg:[&>tbody>tr>td::before]:[content:attr(data-label)]",
  "max-lg:[&>tbody>tr>td::before]:min-w-0 max-lg:[&>tbody>tr>td::before]:text-[10px]",
  "max-lg:[&>tbody>tr>td::before]:font-[760] max-lg:[&>tbody>tr>td::before]:leading-[1.4]",
  "max-lg:[&>tbody>tr>td::before]:text-sre-muted",
  "max-lg:[&>tbody>tr>td::before]:[overflow-wrap:anywhere]",
  "max-lg:[&>tbody>tr>td:last-child]:border-b-0",
  "max-lg:[&>tbody>tr>td>*]:min-w-0 max-lg:[&>tbody>tr>td>*]:max-w-full",
  "max-lg:[&>tbody>tr>td>*]:[overflow-wrap:anywhere]",
].join(" ");

const CARD_DETAILS = [
  "max-lg:[&_td_strong]:text-[12px]",
  "max-lg:[&_td_small]:whitespace-normal",
  "max-lg:[&_td_.sub-row-sre]:whitespace-normal",
].join(" ");

const CARD_NARROW = [
  "max-[480px]:[&>tbody]:gap-[9px]",
  "max-[480px]:[&>tbody>tr>td]:grid-cols-[minmax(84px,34%)_minmax(0,1fr)]",
  "max-[480px]:[&>tbody>tr>td]:gap-[8px] max-[480px]:[&>tbody>tr>td]:p-[9px_10px]",
  "max-[480px]:[&>tbody>tr>td]:text-[11.5px]",
].join(" ");

export const TABLE_SCROLL_CLASS = cn(
  SCROLL_CONTAINER,
  "max-lg:[&>.table-sre]:block max-lg:[&>.table-sre]:w-full max-lg:[&>.table-sre]:min-w-0",
  "max-lg:[&>.table-sre]:border-separate max-lg:[&>.table-sre]:border-spacing-0",
  "max-lg:[&>.table-sre>thead]:hidden",
  "max-lg:[&>.table-sre>tbody]:grid max-lg:[&>.table-sre>tbody]:gap-[11px]",
  "max-lg:[&>.table-sre>tbody>tr]:block max-lg:[&>.table-sre>tbody>tr]:overflow-hidden",
  "max-lg:[&>.table-sre>tbody>tr]:rounded-xl max-lg:[&>.table-sre>tbody>tr]:border",
  "max-lg:[&>.table-sre>tbody>tr]:border-sre-border max-lg:[&>.table-sre>tbody>tr]:!bg-sre-paper",
  "max-lg:[&>.table-sre>tbody>tr]:shadow-[0_5px_16px_rgba(20,52,39,0.055)]",
  "max-lg:[&>.table-sre>tbody>tr]:transition-[box-shadow,border-color] max-lg:[&>.table-sre>tbody>tr]:duration-150",
  "max-lg:[&>.table-sre>tbody>tr:hover]:!bg-sre-paper",
  "max-lg:[&>.table-sre>tbody>tr:hover]:[border-color:color-mix(in_srgb,var(--sre-teal,#147f62)_38%,var(--sre-border,#dce7df))]",
  "max-lg:[&>.table-sre>tbody>tr:hover]:shadow-[0_8px_20px_rgba(20,52,39,0.09)]",
  "max-lg:[&>.table-sre>tbody>tr>td]:grid max-lg:[&>.table-sre>tbody>tr>td]:!w-full",
  "max-lg:[&>.table-sre>tbody>tr>td]:min-w-0 max-lg:[&>.table-sre>tbody>tr>td]:min-h-0",
  "max-lg:[&>.table-sre>tbody>tr>td]:grid-cols-[minmax(96px,35%)_minmax(0,1fr)]",
  "max-lg:[&>.table-sre>tbody>tr>td]:items-start max-lg:[&>.table-sre>tbody>tr>td]:gap-[10px]",
  "max-lg:[&>.table-sre>tbody>tr>td]:p-[10px_12px] max-lg:[&>.table-sre>tbody>tr>td]:align-top",
  "max-lg:[&>.table-sre>tbody>tr>td]:text-[12px] max-lg:[&>.table-sre>tbody>tr>td]:leading-[1.45]",
  "max-lg:[&>.table-sre>tbody>tr>td]:text-sre-ink max-lg:[&>.table-sre>tbody>tr>td]:whitespace-normal",
  "max-lg:[&>.table-sre>tbody>tr>td]:[overflow-wrap:anywhere]",
  "max-lg:[&>.table-sre>tbody>tr>td]:border-0 max-lg:[&>.table-sre>tbody>tr>td]:border-b",
  "max-lg:[&>.table-sre>tbody>tr>td]:[border-bottom-color:color-mix(in_srgb,var(--sre-border,#dce7df)_72%,transparent)]",
  "max-lg:[&>.table-sre>tbody>tr>td::before]:[content:attr(data-label)]",
  "max-lg:[&>.table-sre>tbody>tr>td::before]:min-w-0 max-lg:[&>.table-sre>tbody>tr>td::before]:text-[10px]",
  "max-lg:[&>.table-sre>tbody>tr>td::before]:font-[760] max-lg:[&>.table-sre>tbody>tr>td::before]:leading-[1.4]",
  "max-lg:[&>.table-sre>tbody>tr>td::before]:text-sre-muted",
  "max-lg:[&>.table-sre>tbody>tr>td::before]:[overflow-wrap:anywhere]",
  "max-lg:[&>.table-sre>tbody>tr>td:last-child]:border-b-0",
  "max-lg:[&>.table-sre>tbody>tr>td>*]:min-w-0 max-lg:[&>.table-sre>tbody>tr>td>*]:max-w-full",
  "max-lg:[&>.table-sre>tbody>tr>td>*]:[overflow-wrap:anywhere]",
  "max-lg:[&>.table-sre_td_strong]:text-[12px]",
  "max-lg:[&>.table-sre_td_small]:whitespace-normal",
  "max-lg:[&>.table-sre_td_.sub-row-sre]:whitespace-normal",
  "max-[480px]:[&>.table-sre>tbody]:gap-[9px]",
  "max-[480px]:[&>.table-sre>tbody>tr>td]:grid-cols-[minmax(84px,34%)_minmax(0,1fr)]",
  "max-[480px]:[&>.table-sre>tbody>tr>td]:gap-[8px]",
  "max-[480px]:[&>.table-sre>tbody>tr>td]:p-[9px_10px]",
  "max-[480px]:[&>.table-sre>tbody>tr>td]:text-[11.5px]",
);

export const TABLE_CARDS_CLASS = cn(
  "overflow-x-auto",
  SCROLL_CONTAINER,
  "max-lg:[&>table]:block max-lg:[&>table]:w-full max-lg:[&>table]:min-w-0",
  CARD_TABLE,
  CARD_CELLS,
  CARD_DETAILS,
  CARD_NARROW,
);

export const TABLE_ACTIONS_CLASS = cn(
  "flex items-center gap-[7px]",
  "[&_.btn-sre]:whitespace-nowrap",
  "max-lg:flex-wrap max-lg:[&_.btn-sre]:whitespace-normal",
);

export const TABLE_IDENTITY_LINK_CLASS = cn(
  "flex items-center gap-2",
  "[&>span:last-child]:flex [&>span:last-child]:min-w-0 [&>span:last-child]:flex-col",
  "[&_strong]:max-w-[220px] [&_strong]:overflow-hidden [&_strong]:text-ellipsis [&_strong]:whitespace-nowrap",
  "max-lg:[&_strong]:max-w-full max-lg:[&_strong]:whitespace-normal",
  "max-lg:[&_strong]:[overflow-wrap:anywhere]",
);

export const ROW_AVATAR_CLASS =
  "grid size-[27px] flex-none place-items-center rounded-lg bg-[#eaf3f5] text-[#49798a] dark:bg-sre-blue-soft dark:text-sre-blue";

export const DATA_TABLE_TOOLBAR_CLASS = cn(
  "flex min-w-0 min-h-14 flex-wrap items-center gap-[8px_10px] rounded-[14px]",
  "border border-sre-border bg-sre-paper px-3 py-[9px] shadow-[0_3px_12px_rgba(20,52,39,0.035)]",
  "max-[700px]:items-stretch max-[700px]:p-[9px]",
);

export const DATA_TABLE_SEARCH_CLASS = cn(
  "flex min-h-9 w-[min(100%,270px)] min-w-[190px] flex-1 basis-[210px] items-center gap-2",
  "rounded-[10px] border border-sre-border bg-sre-bg px-[10px]",
  "transition-[border-color,box-shadow] duration-150",
  "focus-within:[border-color:color-mix(in_srgb,var(--sre-teal,#147f62)_48%,var(--sre-border,#dce7df))]",
  "focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--sre-teal,#147f62)_10%,transparent)]",
  "max-[700px]:w-full max-[700px]:min-w-[min(100%,190px)] max-[700px]:basis-full",
  "[&_input]:min-w-0 [&_input]:text-[12px] [&_input]:text-sre-ink",
  "[&_input::placeholder]:text-sre-muted",
);

export const DATA_TABLE_COUNT_CLASS = cn(
  "inline-flex min-h-[29px] shrink-0 items-center rounded-full border border-sre-border",
  "bg-sre-bg px-[9px] text-[10.5px] font-[690] tabular-nums whitespace-nowrap text-sre-muted",
);

export const DATA_TABLE_FILTERS_CLASS = cn(
  "flex min-w-0 flex-wrap items-center gap-[7px]",
  "[&_.compact-filter-sre]:min-h-9 [&_.compact-filter-sre]:rounded-[10px] [&_.compact-filter-sre]:bg-sre-paper",
  "max-[700px]:flex-[1_1_100%]",
);

export const DATA_TABLE_BULK_CLASS =
  "flex shrink-0 flex-wrap items-center gap-2 text-[11px] font-[670] text-sre-muted";

export const DATA_TABLE_PRIMARY_CLASS =
  "flex shrink-0 flex-wrap items-center gap-2 max-[700px]:ml-0 ml-auto";

export const DATA_TABLE_EMPTY_CLASS = cn(
  "min-w-0 overflow-hidden rounded-[14px] border border-sre-border bg-sre-paper",
);

export const DATA_TABLE_PAGINATION_CLASS = cn(
  "flex min-w-0 flex-wrap items-center justify-between gap-[9px_14px] rounded-xl",
  "border border-sre-border bg-sre-paper px-3 py-[9px] text-[11px] text-sre-muted",
  "max-[700px]:p-[8px_9px]",
);

export const DATA_TABLE_RANGE_CLASS = "tabular-nums";

export const DATA_TABLE_PAGE_SIZE_CLASS = cn(
  "inline-flex items-center gap-[7px]",
  "[&_select]:h-8 [&_select]:w-[72px] [&_select]:min-h-8",
);

export const DATA_TABLE_PAGE_CONTROLS_CLASS = cn(
  "inline-flex items-center gap-[7px]",
  "[&>span]:min-w-[95px] [&>span]:text-center [&>span]:tabular-nums",
);

export const TABLE_MOBILE_CONTROLS_CLASS = cn(
  "hidden",
  "max-lg:flex max-lg:flex-wrap max-lg:items-center max-lg:justify-between",
  "max-lg:gap-[10px_14px] max-lg:border-b max-lg:border-sre-border",
  "max-lg:bg-sre-bg max-lg:p-[10px_14px]",
  "max-[480px]:items-stretch max-[480px]:gap-[7px] max-[480px]:p-[9px_10px]",
);

export const TABLE_MOBILE_SELECTION_CLASS = cn(
  "max-lg:inline-flex max-lg:min-h-9 max-lg:items-center max-lg:gap-2",
  "max-lg:cursor-pointer max-lg:text-[11px] max-lg:font-[650] max-lg:text-sre-ink",
  "max-lg:[&_input]:size-[17px] max-lg:[&_input]:shrink-0",
  "max-[480px]:min-h-8",
);

export const TABLE_MOBILE_SORT_CLASS = cn(
  "max-lg:flex max-lg:min-w-[min(100%,290px)] max-lg:flex-[1_1_280px]",
  "max-lg:items-center max-lg:justify-end max-lg:gap-2",
  "max-lg:[&_label]:grid max-lg:[&_label]:min-w-0 max-lg:[&_label]:flex-[1_1_auto]",
  "max-lg:[&_label]:grid-cols-[auto_minmax(0,1fr)] max-lg:[&_label]:items-center",
  "max-lg:[&_label]:gap-2 max-lg:[&_label]:text-[10px] max-lg:[&_label]:font-bold",
  "max-lg:[&_label]:text-sre-muted",
  "max-lg:[&_select]:min-h-9 max-lg:[&_select]:min-w-0 max-lg:[&_select]:text-[11px]",
  "max-lg:[&>button]:inline-flex max-lg:[&>button]:min-h-9 max-lg:[&>button]:shrink-0",
  "max-lg:[&>button]:items-center max-lg:[&>button]:justify-center max-lg:[&>button]:gap-[5px]",
  "max-lg:[&>button]:rounded-lg max-lg:[&>button]:border max-lg:[&>button]:border-sre-border",
  "max-lg:[&>button]:bg-sre-paper max-lg:[&>button]:px-[10px] max-lg:[&>button]:text-[10px]",
  "max-lg:[&>button]:font-bold max-lg:[&>button]:text-sre-ink",
  "max-lg:[&>button:disabled]:cursor-not-allowed max-lg:[&>button:disabled]:opacity-50",
  "max-[480px]:min-w-full max-[480px]:basis-full",
  "max-[480px]:[&_label]:grid-cols-[60px_minmax(0,1fr)]",
  "max-[480px]:[&>button_span]:hidden",
);
