import { cn } from "@/utils";
import { OVERLINE_CLASS } from "./text-styles";

export const PUBLIC_SITE_CLASS =
  "min-h-dvh overflow-x-clip bg-pub-page pt-[var(--sre-header-height,72px)] text-sre-ink";

export const PUBLIC_HEADER_CLASS = cn(
  "fixed inset-x-0 top-0 z-[60] flex min-h-[72px] items-center justify-between gap-5",
  "border-b border-pub-border bg-pub-header px-[clamp(22px,5.8vw,88px)] backdrop-blur-[14px]",
  "max-[720px]:min-h-16 max-[720px]:px-[18px]",
);

export const PUBLIC_NAVIGATION_CLASS =
  "ml-auto flex items-center gap-[clamp(18px,3vw,38px)] max-[720px]:hidden";

export const PUBLIC_NAV_LINK_CLASS =
  "text-[12px] font-semibold text-pub-muted transition-colors hover:text-sre-teal";

export const PUBLIC_HEADER_ACTIONS_CLASS = cn(
  "ml-3 flex items-center gap-[14px]",
  "max-[720px]:ml-auto max-[720px]:gap-[9px] max-[720px]:[&_.btn-sre]:min-h-8 max-[720px]:[&_.btn-sre]:px-[9px] max-[720px]:[&_.btn-sre]:text-[12px]",
  "max-[460px]:gap-[7px] max-[460px]:[&_.btn-sre]:min-h-[30px] max-[460px]:[&_.btn-sre]:px-[10px] max-[460px]:[&_.btn-sre]:text-[11.5px] max-[460px]:[&_.btn-sre]:whitespace-nowrap max-[460px]:[&_.btn-sre_svg]:w-[15px]",
);

export const PUBLIC_THEME_TOGGLE_CLASS = cn(
  "grid size-[34px] shrink-0 cursor-pointer place-items-center rounded-[9px] border border-sre-border bg-sre-paper p-0 text-sre-ink-2",
  "transition-colors hover:border-sre-teal hover:text-sre-teal",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sre-teal",
);

const BRAND_LOGO_BASE = "block shrink-0 object-contain";

export function publicBrandLogoClass(variant: "header" | "footer") {
  return cn(
    BRAND_LOGO_BASE,
    variant === "footer"
      ? "h-[49px] w-[74px] shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
      : "h-[46px] w-[68px]",
    "max-[600px]:h-[39px] max-[600px]:w-[58px]",
  );
}

export const PUBLIC_BRAND_TEXT_CLASS = "flex min-w-0 flex-col gap-[3px]";

export function publicBrandTitleClass(variant: "header" | "footer") {
  return cn(
    "text-[14px] font-[800] tracking-[-0.45px] [&_span]:text-pub-gold-soft",
    variant === "footer" ? "text-[#f4f7f6]" : "text-pub-heading max-[600px]:text-[12px]",
  );
}

export function publicBrandSubtitleClass(variant: "header" | "footer") {
  return cn(
    "overflow-hidden text-[10px] font-[760] uppercase tracking-[0.9px] text-pub-muted text-ellipsis whitespace-nowrap",
    variant === "footer"
      ? "text-[#aabfc0]"
      : "max-[600px]:max-w-[125px] max-[600px]:text-[8px] max-[600px]:tracking-[0.55px]",
  );
}

export const PUBLIC_BRAND_CLASS =
  "flex min-w-0 items-center gap-[10px] text-sre-ink max-[600px]:gap-[7px]";

export const PUBLIC_SCROLL_HINT_CLASS = cn(
  "absolute right-[clamp(22px,7.7vw,118px)] bottom-[19px]",
  "max-[720px]:right-[22px] max-[720px]:bottom-[14px]",
  "max-[460px]:right-auto max-[460px]:left-[18px]",
);

export const PUBLIC_SCROLL_HINT_LINK_CLASS =
  "inline-flex items-center gap-[7px] text-[11px] font-extrabold tracking-[0.85px] text-pub-faint";

export const PUBLIC_FOOTER_CLASS = cn(
  "relative isolate overflow-hidden px-[clamp(22px,7.7vw,118px)] pt-[29px]",
  "bg-[radial-gradient(ellipse_at_84%_-12%,rgba(48,112,113,0.3),transparent_45%),linear-gradient(140deg,#101c2c_0%,#132b33_54%,#101c2c_100%)]",
  "text-[#dce8e8] max-[600px]:px-[18px] max-[600px]:pt-[28px]",
  "after:pointer-events-none after:absolute after:-top-[110px] after:left-1/2 after:-z-10 after:size-[300px] after:-translate-x-1/2",
  "after:rounded-full after:border after:border-[rgba(197,220,216,0.06)]",
  "after:shadow-[0_0_0_32px_rgba(197,220,216,0.02),0_0_0_68px_rgba(197,220,216,0.015)] after:content-['']",
);

export const PUBLIC_FOOTER_WATERMARK_CLASS = cn(
  "pointer-events-none absolute top-[44%] left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2",
  "text-[clamp(76px,14vw,178px)] font-black tracking-[-0.085em] leading-none whitespace-nowrap",
  "text-white/[0.035]",
);

export const PUBLIC_FOOTER_CONTENT_CLASS = cn(
  "relative z-[1] mx-auto grid w-[min(100%,1180px)] items-center gap-[clamp(20px,3vw,40px)] pb-5",
  "[grid-template-columns:minmax(240px,1.05fr)_minmax(300px,1.3fr)_auto]",
  "max-[1020px]:[grid-template-columns:minmax(230px,1.25fr)_repeat(2,minmax(125px,0.75fr))]",
  "max-[600px]:grid-cols-1 max-[600px]:gap-[18px] max-[600px]:pb-[19px]",
);

export const PUBLIC_FOOTER_IDENTITY_TEXT_CLASS =
  "mt-[11px] max-w-[335px] text-justify text-[11px] leading-[1.65] text-[#aebfc1]";

export const PUBLIC_FOOTER_LIST_CLASS =
  "m-0 flex list-none flex-wrap items-center gap-x-[18px] gap-y-[9px] p-0";

export const PUBLIC_FOOTER_LINK_CLASS =
  "inline-flex items-center text-[10px] leading-[1.5] text-[#aebfc1] transition-colors hover:text-white";

export const PUBLIC_FOOTER_ACTIONS_CLASS =
  "flex flex-wrap items-center justify-end gap-x-[11px] gap-y-[8px] max-[600px]:justify-start";

export const PUBLIC_FOOTER_EXTERNAL_CLASS =
  "inline-flex items-center gap-[5px] text-[10px] text-[#aebfc1] transition-colors hover:text-white";

export const PUBLIC_FOOTER_BADGE_CLASS =
  "inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.7px] text-[#a9d5c8]";

export const PUBLIC_FOOTER_CTA_CLASS = cn(
  "inline-flex items-center gap-1.5 rounded-[8px] border border-[rgba(145,207,183,0.25)] bg-[rgba(145,207,183,0.08)] px-[11px] py-2",
  "text-[10px] font-extrabold text-[#d6e9e4] transition-colors",
  "hover:border-[rgba(145,207,183,0.4)] hover:bg-[rgba(145,207,183,0.14)] hover:text-white",
);

export const PUBLIC_FOOTER_BOTTOM_CLASS = cn(
  "relative z-[1] mx-auto flex min-h-[55px] w-[min(100%,1180px)] items-center justify-between gap-3",
  "border-t border-[rgba(220,232,232,0.13)] py-3 text-[9px] tracking-[0.35px] text-[#99afb0]",
  "max-[600px]:flex-col max-[600px]:items-start max-[600px]:justify-center max-[600px]:gap-1.5",
);

export const PUBLIC_FOOTER_LEGAL_CLASS =
  "flex flex-wrap items-center gap-x-4 gap-y-2 [&_a]:text-[#aebfc1] [&_a:hover]:text-white [&_a]:transition-colors max-[600px]:gap-x-3 max-[600px]:gap-y-[7px]";

export const PUBLIC_LEGAL_HEADER_CLASS = "!gap-[18px]";

export const PUBLIC_LEGAL_NAV_CLASS = cn(
  "ml-auto flex items-center gap-[clamp(13px,2.5vw,28px)]",
  "max-[760px]:gap-3 max-[600px]:gap-2",
  "max-[600px]:[&_.btn-sre]:min-h-8 max-[600px]:[&_.btn-sre]:px-[9px] max-[600px]:[&_.btn-sre]:text-[11px]",
);

export const PUBLIC_LEGAL_NAV_LINK_CLASS =
  "text-[11px] font-[750] text-pub-muted transition-colors hover:text-pub-accent max-[600px]:hidden";

export const PUBLIC_HERO_CLASS = cn(
  "relative grid min-h-[580px] items-center gap-[18px] overflow-hidden",
  "[grid-template-columns:minmax(0,1fr)_minmax(400px,0.9fr)]",
  "bg-[radial-gradient(ellipse_at_77%_44%,var(--pub-hero-glow),transparent_44%),linear-gradient(180deg,var(--pub-hero-from)_0%,var(--pub-hero-to)_100%)]",
  "px-[clamp(22px,7.7vw,118px)] pt-[55px] pb-[68px]",
  "before:pointer-events-none before:absolute before:inset-0 before:content-['']",
  "before:bg-[linear-gradient(var(--pub-grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--pub-grid-line)_1px,transparent_1px)] before:bg-[size:42px_42px]",
  "before:[mask-image:linear-gradient(90deg,transparent_38%,#000_80%,transparent)]",
  "max-[1180px]:[grid-template-columns:minmax(0,1fr)_minmax(340px,0.8fr)] max-[1180px]:px-[5vw]",
  "max-[920px]:[grid-template-columns:minmax(0,1fr)_minmax(300px,0.75fr)] max-[920px]:px-8",
  "max-[720px]:min-h-0 max-[720px]:grid-cols-1 max-[720px]:gap-[22px] max-[720px]:px-[22px] max-[720px]:pt-[47px] max-[720px]:pb-[53px]",
  "max-[460px]:px-[18px]",
);

export const PUBLIC_HERO_TEXT_CLASS = "relative z-[2] max-w-[570px] max-[720px]:max-w-[610px]";

export const PUBLIC_HERO_OVERLINE_CLASS = cn(
  OVERLINE_CLASS,
  "!flex items-center gap-[9px] !text-pub-accent-soft",
  "[&_i]:size-1.5 [&_i]:rounded-full [&_i]:bg-sre-teal",
  "[&_i]:shadow-[0_0_0_3px_color-mix(in_srgb,var(--sre-teal)_12%,transparent)]",
);

export const PUBLIC_HERO_TITLE_CLASS = cn(
  "mt-[18px] mb-[17px] text-[clamp(37px,4.4vw,59px)] font-[790] leading-[1.07] tracking-[-2.6px] text-pub-heading",
  "[&_em]:not-italic [&_em]:text-pub-accent-strong",
  "max-[920px]:text-[clamp(34px,5vw,48px)]",
  "max-[720px]:text-[clamp(36px,8vw,52px)]",
  "max-[460px]:text-[35px] max-[460px]:tracking-[-1.8px]",
);

export const PUBLIC_HERO_LEAD_CLASS =
  "m-0 max-w-[485px] text-justify text-[12px] leading-[1.75] text-pub-muted";

export const PUBLIC_HERO_ACTIONS_CLASS = cn(
  "mt-6 flex flex-wrap gap-[9px]",
  "max-[460px]:[&_.btn-sre]:min-h-[41px] max-[460px]:[&_.btn-sre]:px-3 max-[460px]:[&_.btn-sre]:text-[11px]",
);

export const PUBLIC_HERO_POINTS_CLASS = cn(
  "mt-[26px] flex flex-wrap gap-[17px]",
  "[&_span]:inline-flex [&_span]:items-center [&_span]:gap-1.5 [&_span]:text-[12px] [&_span]:font-[620] [&_span]:text-pub-muted",
  "[&_svg]:text-pub-accent-soft",
  "max-[460px]:gap-x-3 max-[460px]:gap-y-[9px] max-[460px]:[&_span]:text-[11px]",
);

export const PUBLIC_HERO_ILLUSTRATION_CLASS = cn(
  "relative flex min-h-[430px] items-center justify-center",
  "max-[720px]:min-h-[350px] max-[460px]:min-h-[320px]",
);

export const PUBLIC_HERO_PATH_ZONE_CLASS = cn(
  "relative isolate overflow-hidden rounded-[28px] border border-pub-border shadow-pub",
  "bg-[radial-gradient(ellipse_at_48%_43%,color-mix(in_srgb,var(--pub-accent-soft)_26%,transparent),transparent_56%),linear-gradient(145deg,var(--pub-glass),var(--pub-glass-soft))]",
  "before:absolute before:inset-[18px] before:-z-10 before:rounded-[20px] before:border before:content-['']",
  "before:border-[color-mix(in_srgb,var(--pub-accent)_14%,transparent)]",
  "max-[600px]:min-h-[310px] max-[600px]:rounded-[21px]",
);

export const PUBLIC_HERO_PATH_HALO_CLASS = cn(
  "absolute top-1/2 left-1/2 -z-10 aspect-square w-[min(72%,340px)] -translate-x-1/2 -translate-y-[52%]",
  "rounded-full border border-[color-mix(in_srgb,var(--pub-accent)_13%,transparent)]",
  "shadow-[0_0_0_28px_color-mix(in_srgb,var(--pub-accent)_3%,transparent),0_0_0_58px_color-mix(in_srgb,var(--pub-accent)_3%,transparent)]",
);

export const PUBLIC_HERO_PATH_BRAND_CLASS = cn(
  "min-h-full w-full px-6 pt-6 pb-[45px] [&_svg]:overflow-visible [&_svg]:drop-shadow-[0_7px_5px_rgba(0,0,0,0.14)]",
  "max-[600px]:px-3 max-[600px]:pt-4 max-[600px]:pb-10",
);

export const PUBLIC_HERO_PATH_FALLBACK_CLASS = cn(
  "flex min-h-[250px] flex-col items-center justify-center gap-3 text-center text-pub-muted",
  "[&_strong]:font-sans [&_strong]:text-[clamp(86px,13vw,148px)] [&_strong]:font-extrabold [&_strong]:tracking-[0.02em]",
  "[&_strong]:text-transparent [&_strong]:[-webkit-text-stroke:2px_var(--pub-accent)]",
  "[&_span]:text-[12px]",
);

export const PUBLIC_PROMISE_BANNER_CLASS = cn(
  "grid grid-cols-3 border-y border-pub-border bg-pub-surface px-[clamp(22px,7.7vw,118px)] py-[18px]",
  "max-[720px]:grid-cols-1 max-[720px]:px-[22px] max-[720px]:py-[10px]",
);

export const PUBLIC_PROMISE_ITEM_CLASS = cn(
  "grid items-center gap-x-[10px] gap-y-0.5 border-r border-pub-border-soft px-4 py-1",
  "[grid-template-columns:34px_minmax(0,1fr)]",
  "[&>span]:row-span-2 [&>span]:grid [&>span]:size-[31px] [&>span]:place-items-center [&>span]:rounded-[9px]",
  "[&>span]:bg-pub-accent-bg [&>span]:text-pub-accent",
  "[&_strong]:text-[11px] [&_strong]:text-pub-body",
  "[&_small]:text-[12px] [&_small]:leading-[1.45] [&_small]:text-pub-muted",
  "last:border-0",
  "max-[720px]:border-r-0 max-[720px]:border-b max-[720px]:border-pub-border-soft max-[720px]:px-0 max-[720px]:py-[9px]",
  "max-[720px]:last:border-b-0",
);

export const PUBLIC_SECTION_HEADER_CLASS = "mx-auto mb-[31px] max-w-[560px] text-center";

export const PUBLIC_SECTION_OVERLINE_CLASS = cn(OVERLINE_CLASS, "!text-pub-accent-soft");

export const PUBLIC_SECTION_TITLE_CLASS = cn(
  "mt-3 mb-[10px] text-[clamp(27px,3vw,36px)] font-[780] leading-[1.17] tracking-[-1.1px] text-pub-heading",
  "max-[720px]:text-[26px]",
);

export const PUBLIC_SECTION_LEAD_CLASS =
  "m-0 text-justify text-[12px] leading-[1.7] text-pub-muted";

export const PUBLIC_ANCHOR_CLASS = "scroll-mt-[calc(var(--sre-header-height,72px)+16px)]";

export const PUBLIC_SERVICES_SECTION_CLASS = cn(
  "bg-pub-surface px-[clamp(22px,7.7vw,118px)] pt-[76px] pb-[82px]",
  "max-[720px]:px-[22px] max-[720px]:pt-[55px] max-[720px]:pb-[55px]",
);

export const PUBLIC_SERVICES_GRID_CLASS = cn(
  "mx-auto grid max-w-[1130px] grid-cols-3 gap-[14px]",
  "max-[720px]:max-w-[480px] max-[720px]:grid-cols-1",
);

export const PUBLIC_SERVICE_CARD_CLASS = cn(
  "flex min-h-[238px] flex-col items-start rounded-xl border border-pub-border bg-pub-surface p-[21px] shadow-pub-sm",
  "transition-[transform,box-shadow] hover:-translate-y-[3px] hover:shadow-pub",
  "[&_h3]:mt-[7px] [&_h3]:mb-1.5 [&_h3]:text-[12px] [&_h3]:font-[740] [&_h3]:text-pub-heading-2",
  "[&_p]:m-0 [&_p]:mb-[15px] [&_p]:text-justify [&_p]:text-[11px] [&_p]:leading-[1.65] [&_p]:text-pub-muted",
  "[&_a]:mt-auto [&_a]:inline-flex [&_a]:items-center [&_a]:gap-[5px] [&_a]:text-[12px] [&_a]:font-[750] [&_a]:text-pub-accent",
  "max-[720px]:min-h-[205px]",
);

export const PUBLIC_SERVICE_ICON_CLASS =
  "grid size-[39px] place-items-center rounded-[10px] bg-pub-blue-bg text-pub-blue";

export const PUBLIC_SERVICE_INDEX_CLASS =
  "mt-[18px] text-[11px] font-extrabold tracking-[0.8px] text-pub-faint";

export const PUBLIC_STEPS_SECTION_CLASS = cn(
  "grid gap-[55px] bg-pub-surface-alt px-[clamp(22px,9vw,140px)] py-[78px]",
  "[grid-template-columns:minmax(0,0.85fr)_minmax(0,1.15fr)]",
  "max-[1180px]:gap-[30px]",
  "max-[720px]:grid-cols-1 max-[720px]:gap-6 max-[720px]:px-[22px] max-[720px]:py-[56px]",
);

export const PUBLIC_STEPS_LEFT_CLASS = cn(
  "max-w-[390px] self-center [&_.btn-sre]:mt-[17px]",
  "max-[720px]:max-w-[530px]",
);

export const PUBLIC_STEPS_LIST_CLASS = "flex flex-col";

export const PUBLIC_STEP_ITEM_CLASS = cn(
  "flex gap-[15px] border-b border-pub-border py-[13px] last:border-0",
  "[&>span]:grid [&>span]:size-[29px] [&>span]:shrink-0 [&>span]:place-items-center [&>span]:rounded-[9px]",
  "[&>span]:border [&>span]:border-pub-border-strong [&>span]:bg-pub-accent-bg [&>span]:text-[12px] [&>span]:font-extrabold [&>span]:text-pub-accent",
  "[&_h3]:mt-px [&_h3]:mb-1 [&_h3]:text-[12px] [&_h3]:text-pub-body",
  "[&_p]:m-0 [&_p]:max-w-[490px] [&_p]:text-justify [&_p]:text-[12px] [&_p]:leading-[1.65] [&_p]:text-pub-muted",
);

export const PUBLIC_CHANNELS_SECTION_CLASS = cn(
  "bg-pub-surface px-[clamp(22px,7.7vw,118px)] py-[72px]",
  "max-[720px]:px-[22px] max-[720px]:py-[55px]",
);

export const PUBLIC_CHANNELS_CARD_CLASS = cn(
  "mx-auto grid max-w-[1030px] items-center gap-[35px] rounded-2xl border border-pub-border px-[31px] py-[27px]",
  "bg-[linear-gradient(120deg,var(--pub-surface),var(--pub-surface-alt))]",
  "[grid-template-columns:minmax(0,1.2fr)_minmax(220px,0.7fr)]",
  "[&_h2]:mt-[10px] [&_h2]:mb-[10px] [&_h2]:text-[24px] [&_h2]:tracking-[-0.75px] [&_h2]:text-pub-heading-2",
  "[&_p]:m-0 [&_p]:max-w-[510px] [&_p]:text-justify [&_p]:text-[11px] [&_p]:leading-[1.7] [&_p]:text-pub-muted",
  "[&>div:first-child>small]:text-[11px] [&>div:first-child>small]:text-pub-faint",
  "max-[720px]:grid-cols-1 max-[720px]:gap-5 max-[720px]:p-[21px]",
);

export const PUBLIC_CHANNELS_OVERLINE_CLASS = cn(OVERLINE_CLASS, "!text-pub-gold");

export const PUBLIC_CHANNELS_LIST_CLASS = cn(
  "mt-[15px] mb-2 flex flex-wrap gap-[7px]",
  "[&_span]:inline-flex [&_span]:items-center [&_span]:gap-1.5 [&_span]:rounded-[7px] [&_span]:border [&_span]:border-pub-border",
  "[&_span]:bg-pub-surface [&_span]:px-[9px] [&_span]:py-[7px] [&_span]:text-[12px] [&_span]:font-bold [&_span]:text-pub-accent",
);

export const PUBLIC_CHANNELS_SEAL_CLASS = cn(
  "flex min-h-[166px] flex-col items-center justify-center rounded-xl border border-pub-border-gold bg-pub-gold-bg p-[17px] text-center text-pub-gold",
  "[&_strong]:mt-[10px] [&_strong]:mb-1.5 [&_strong]:text-[11px] [&_strong]:leading-[1.35] [&_strong]:text-pub-gold",
  "[&_span]:max-w-[210px] [&_span]:text-[12px] [&_span]:leading-[1.5] [&_span]:text-pub-muted-2",
  "max-[720px]:min-h-[130px]",
);

export const PUBLIC_TAXATION_SECTION_CLASS = cn(
  "relative overflow-hidden bg-pub-surface-alt px-[clamp(22px,7.7vw,118px)] pt-[78px] pb-[74px]",
  "bg-[radial-gradient(ellipse_at_92%_14%,color-mix(in_srgb,var(--pub-accent-soft)_22%,transparent),transparent_38%),var(--pub-surface-alt)]",
  "before:pointer-events-none before:absolute before:-top-[140px] before:-right-[120px] before:size-[330px] before:rounded-full before:content-['']",
  "before:border before:border-[color-mix(in_srgb,var(--pub-accent)_10%,transparent)]",
  "before:shadow-[0_0_0_30px_color-mix(in_srgb,var(--pub-accent)_3%,transparent),0_0_0_64px_color-mix(in_srgb,var(--pub-accent)_3%,transparent)]",
  "max-[600px]:px-[18px] max-[600px]:pt-[55px] max-[600px]:pb-[52px]",
);

export const PUBLIC_TAXATION_HEADER_CLASS =
  "relative z-[1] mb-[34px] !mx-0 max-w-[680px] !text-left";

export const PUBLIC_TAXATION_GRID_CLASS = cn(
  "relative z-[1] mx-auto grid w-[min(100%,1130px)] grid-cols-3 gap-[14px]",
  "max-[1020px]:grid-cols-2",
  "max-[600px]:grid-cols-1 max-[600px]:gap-[10px]",
);

export const PUBLIC_TAXATION_CARD_CLASS = cn(
  "flex min-h-[190px] flex-col items-start rounded-[15px] border border-pub-border bg-pub-glass px-5 pt-[19px] pb-5 shadow-pub-sm",
  "transition-[opacity,transform,border-color,box-shadow,background] duration-[620ms] ease-out",
  "hover:border-pub-border-accent hover:bg-pub-surface hover:shadow-pub",
  "[&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:text-[13px] [&_h3]:font-[780] [&_h3]:leading-[1.4] [&_h3]:text-pub-heading-2",
  "[&_p]:m-0 [&_p]:text-justify [&_p]:text-[11px] [&_p]:leading-[1.65] [&_p]:text-pub-muted",
  "max-[600px]:min-h-0 max-[600px]:p-4 max-[600px]:[&_h3]:mt-3",
);

export const PUBLIC_TAXATION_CARD_HEADER_CLASS = "flex w-full items-center justify-between gap-3";

export const PUBLIC_TAXATION_CARD_ICON_CLASS =
  "grid size-[39px] shrink-0 place-items-center rounded-xl border border-pub-border-strong bg-pub-accent-bg text-pub-accent";

export const PUBLIC_TAXATION_CARD_ACRONYM_CLASS =
  "rounded-full border border-pub-border bg-pub-surface-soft px-2 py-[5px] text-[9px] font-[850] tracking-[0.7px] text-pub-muted";

export const PUBLIC_TAX_NOTE_CLASS = cn(
  "relative z-[1] mx-auto mt-[22px] grid w-[min(100%,1130px)] items-center gap-[14px] rounded-[13px]",
  "border border-pub-border bg-pub-glass-soft px-[18px] py-[15px]",
  "[grid-template-columns:36px_minmax(0,1fr)_auto]",
  "[&_p]:m-0 [&_p]:text-justify [&_p]:text-[11px] [&_p]:leading-[1.6] [&_p]:text-pub-muted",
  "[&_a]:inline-flex [&_a]:items-center [&_a]:gap-[7px] [&_a]:whitespace-nowrap [&_a]:text-[11px] [&_a]:font-extrabold [&_a]:text-pub-accent [&_a:hover]:text-pub-accent-strong",
  "max-[600px]:grid-cols-[34px_minmax(0,1fr)] max-[600px]:gap-x-3 max-[600px]:gap-y-[9px] max-[600px]:p-[13px]",
  "max-[600px]:[&_a]:col-start-2 max-[600px]:[&_a]:whitespace-normal",
);

export const PUBLIC_TAX_NOTE_ICON_CLASS =
  "grid size-[34px] place-items-center rounded-[10px] bg-pub-gold-bg text-pub-gold";

export const PUBLIC_FINAL_CALL_CLASS = cn(
  "bg-[linear-gradient(120deg,#16465c,#0c7976)] px-[22px] pt-[57px] pb-[59px] text-center text-white",
  "[&_h2]:mt-[11px] [&_h2]:mb-[7px] [&_h2]:text-[clamp(25px,3vw,34px)] [&_h2]:tracking-[-1px]",
  "[&_p]:m-0 [&_p]:text-[11px] [&_p]:text-[#c4d9d7]",
  "[&>div]:mt-[19px] [&>div]:flex [&>div]:flex-wrap [&>div]:items-center [&>div]:justify-center [&>div]:gap-[17px]",
);

export const PUBLIC_FINAL_CALL_OVERLINE_CLASS = cn(OVERLINE_CLASS, "!text-[#b4d5ce]");

export const PUBLIC_FINAL_CALL_LINK_CLASS =
  "text-[11px] font-bold text-[#e3f1ee] underline underline-offset-[3px]";

export const PUBLIC_CONTACT_SECTION_CLASS = cn(
  "bg-[radial-gradient(ellipse_at_8%_14%,color-mix(in_srgb,var(--sre-teal-soft)_66%,transparent),transparent_38%),var(--sre-bg)]",
  "px-[clamp(22px,7.7vw,118px)] py-[clamp(54px,7.5vw,92px)] text-sre-ink",
  "max-[560px]:px-[18px] max-[560px]:py-[52px]",
);

export const PUBLIC_CONTACT_HEADER_CLASS = cn(
  "mx-auto mb-8 max-w-[690px] text-center",
  "[&_h2]:mt-[9px] [&_h2]:mb-[10px] [&_h2]:text-[clamp(26px,3.5vw,38px)] [&_h2]:font-[790] [&_h2]:leading-[1.14] [&_h2]:tracking-[-1.2px] [&_h2]:text-sre-ink",
  "[&_p]:mx-auto [&_p]:mb-0 [&_p]:max-w-[590px] [&_p]:text-[14px] [&_p]:leading-[1.7] [&_p]:text-sre-ink-2",
  "max-[560px]:mb-6 max-[560px]:text-left max-[560px]:[&_p]:ml-0",
);

export const PUBLIC_CONTACT_GRID_CLASS = cn(
  "mx-auto grid w-[min(100%,1020px)] items-start gap-[clamp(20px,4vw,40px)]",
  "[grid-template-columns:minmax(220px,0.78fr)_minmax(0,1.22fr)]",
  "max-[980px]:max-w-[700px] max-[980px]:grid-cols-1",
);

const PUBLIC_CONTACT_PANEL_CLASS =
  "min-w-0 rounded-2xl border border-sre-border bg-sre-paper shadow-pub-sm";

export const PUBLIC_CONTACT_ASIDE_CLASS = cn(
  PUBLIC_CONTACT_PANEL_CLASS,
  "p-[clamp(22px,3vw,32px)]",
  "[&_h3]:mt-[17px] [&_h3]:mb-2 [&_h3]:text-[18px] [&_h3]:font-[770] [&_h3]:leading-[1.3] [&_h3]:text-sre-ink",
  "[&>p]:m-0 [&>p]:text-justify [&>p]:text-[13px] [&>p]:leading-[1.7] [&>p]:text-sre-ink-2",
  "[&_ul]:my-[22px] [&_ul]:flex [&_ul]:list-none [&_ul]:flex-col [&_ul]:gap-3 [&_ul]:border-t [&_ul]:border-sre-border [&_ul]:px-0 [&_ul]:pt-[17px]",
  "[&_li]:flex [&_li]:items-start [&_li]:gap-[9px] [&_li]:text-[12px] [&_li]:leading-[1.5] [&_li]:text-sre-ink-2",
  "[&_li_svg]:mt-px [&_li_svg]:shrink-0 [&_li_svg]:text-sre-teal",
  "max-[980px]:grid max-[980px]:items-start max-[980px]:gap-x-[15px] max-[980px]:[grid-template-columns:auto_minmax(0,1fr)]",
  "max-[980px]:[&>span:first-child]:row-span-2",
  "max-[980px]:[&_h3]:mt-0 max-[980px]:[&_h3]:mb-[5px]",
  "max-[980px]:[&>p]:col-start-2",
  "max-[980px]:[&_ul]:col-span-full max-[980px]:[&>a]:col-span-full",
  "max-[560px]:block max-[560px]:p-5",
  "max-[560px]:[&_h3]:mt-[14px] max-[560px]:[&_h3]:mb-[7px]",
  "max-[560px]:[&>p]:col-auto max-[560px]:[&_ul]:col-auto",
);

export const PUBLIC_CONTACT_ICON_CLASS =
  "grid size-[42px] place-items-center rounded-xl border border-sre-border bg-sre-teal-soft text-sre-teal";

export const PUBLIC_CONTACT_HELP_CLASS =
  "inline-flex items-center gap-1.5 text-[12px] font-[750] text-sre-teal no-underline hover:underline hover:underline-offset-[3px]";

export const PUBLIC_CONTACT_FORM_PANEL_CLASS = cn(
  PUBLIC_CONTACT_PANEL_CLASS,
  "p-[clamp(20px,3vw,32px)] max-[560px]:px-4 max-[560px]:py-[18px]",
);

export const PUBLIC_CONTACT_FORM_CLASS = cn(
  "grid max-h-none grid-cols-1 gap-[15px] overflow-visible",
  "[&_textarea.field-sre]:min-h-[116px] [&_textarea.field-sre]:max-h-none [&_textarea.field-sre]:resize-y",
  "max-[560px]:gap-[13px]",
);

export const PUBLIC_CONTACT_FORM_HEADER_CLASS = cn(
  "mb-0.5 flex items-center gap-3",
  "[&>div]:flex [&>div]:min-w-0 [&>div]:flex-col [&>div]:gap-[3px]",
  "[&_strong]:text-[14px] [&_strong]:font-[780] [&_strong]:text-sre-ink",
  "[&_small]:text-[11px] [&_small]:leading-[1.55] [&_small]:text-sre-muted",
);

export const PUBLIC_CONTACT_FORM_HEADER_ICON_CLASS = "size-[38px] shrink-0";

export const PUBLIC_CONTACT_HONEYPOT_CLASS =
  "absolute !size-px !overflow-hidden whitespace-nowrap [clip-path:inset(50%)]";

export const PUBLIC_CONTACT_PRIVACY_CLASS =
  "mt-[-3px] mb-0 text-[11px] leading-[1.55] text-sre-muted";

export const PUBLIC_CONTACT_WARNING_CLASS = "m-0 text-[12px] text-sre-red";

export const PUBLIC_CONTACT_CONFIRMATION_CLASS = cn(
  "flex min-h-[290px] flex-col items-center justify-center gap-3 text-center",
  "[&_strong]:text-[17px] [&_strong]:text-sre-ink",
  "[&>p]:m-0 [&>p]:max-w-[420px] [&>p]:text-[13px] [&>p]:leading-[1.6] [&>p]:text-sre-ink-2",
);

export const PUBLIC_CONTACT_CONFIRMATION_ICON_CLASS =
  "grid size-12 place-items-center rounded-full text-sre-success bg-[color-mix(in_srgb,var(--sre-success)_13%,transparent)]";

export const PUBLIC_CONTACT_CONFIRMATION_ICON_TEST_CLASS =
  "!text-sre-warning !bg-[color-mix(in_srgb,var(--sre-warning)_15%,transparent)]";

export const PUBLIC_CONTACT_LINK_CLASS =
  "cursor-pointer border-0 bg-transparent py-[7px] text-[12px] font-[750] text-sre-teal";

export const PUBLIC_LEGAL_CONTENT_CLASS = cn(
  "mx-auto w-[min(100%_-_44px,1160px)] pt-[26px] pb-[76px]",
  "max-[600px]:w-[min(100%_-_32px,1160px)] max-[600px]:pt-[19px] max-[600px]:pb-[52px]",
);

export const PUBLIC_LEGAL_BREADCRUMB_CLASS =
  "mt-0.5 mb-[22px] flex items-center gap-[10px] text-[10px] font-[650] text-pub-muted-2";

export const PUBLIC_LEGAL_HERO_CLASS = cn(
  "relative grid min-h-[274px] items-center gap-8 overflow-hidden rounded-[22px] border border-pub-border p-[clamp(28px,5vw,52px)] shadow-pub",
  "[grid-template-columns:minmax(0,1.4fr)_minmax(230px,0.6fr)]",
  "bg-[radial-gradient(ellipse_at_90%_25%,color-mix(in_srgb,var(--pub-accent-soft)_22%,transparent),transparent_40%),linear-gradient(135deg,var(--pub-surface),var(--pub-surface-alt))]",
  "[&_h1]:mt-3 [&_h1]:mb-[11px] [&_h1]:text-[clamp(31px,4.5vw,48px)] [&_h1]:font-extrabold [&_h1]:leading-[1.1] [&_h1]:tracking-[-1.8px] [&_h1]:text-pub-heading",
  "max-[760px]:min-h-0 max-[760px]:gap-5 max-[760px]:[grid-template-columns:minmax(0,1fr)_190px]",
  "max-[600px]:grid-cols-1 max-[600px]:gap-5 max-[600px]:rounded-[17px] max-[600px]:px-[21px] max-[600px]:py-[25px]",
  "max-[600px]:[&_h1]:text-[clamp(30px,9vw,39px)]",
);

export const PUBLIC_LEGAL_HERO_TEXT_CLASS = "relative z-[1] max-w-[710px]";

export const PUBLIC_LEGAL_OVERLINE_CLASS =
  "text-[9px] font-[850] tracking-[1.7px] text-pub-accent-soft";

export const PUBLIC_LEGAL_HERO_LEAD_CLASS =
  "m-0 max-w-[650px] text-justify text-[12px] leading-[1.8] text-pub-muted";

export const PUBLIC_LEGAL_PLACE_CLASS =
  "mt-[18px] inline-flex items-center gap-[7px] text-[10px] font-[750] text-pub-muted";

export const PUBLIC_LEGAL_CARD_CLASS = cn(
  "relative flex min-h-[174px] flex-col items-start justify-center gap-[11px] overflow-hidden rounded-[18px] border border-pub-border-strong bg-pub-glass-soft p-[23px] shadow-pub-sm",
  "[&>strong]:relative [&>strong]:z-[1] [&>strong]:text-[13px] [&>strong]:text-pub-body-strong",
  "[&>small]:relative [&>small]:z-[1] [&>small]:text-[10px] [&>small]:text-pub-muted",
  "max-[600px]:min-h-[126px] max-[600px]:p-[17px]",
);

export const PUBLIC_LEGAL_CARD_ICON_CLASS = cn(
  "grid size-[46px] place-items-center rounded-[14px] border border-pub-border-strong bg-pub-accent-bg text-pub-accent",
  "max-[600px]:size-10",
);

export const PUBLIC_LEGAL_CARD_DECOR_CLASS = cn(
  "absolute -right-[42px] -bottom-[96px] size-[180px] rounded-full border",
  "border-[color-mix(in_srgb,var(--pub-accent)_13%,transparent)]",
  "shadow-[0_0_0_20px_color-mix(in_srgb,var(--pub-accent)_3%,transparent),0_0_0_44px_color-mix(in_srgb,var(--pub-accent)_3%,transparent)]",
);

export const PUBLIC_LEGAL_GRID_CLASS = cn(
  "mt-6 grid items-start gap-6 [grid-template-columns:230px_minmax(0,1fr)]",
  "max-[760px]:grid-cols-1",
);

export const PUBLIC_LEGAL_SUMMARY_CLASS = cn(
  "sticky top-[calc(var(--sre-header-height,72px)+19px)] flex flex-col gap-0.5 rounded-2xl border border-pub-border bg-pub-surface px-[15px] py-5 shadow-pub-sm",
  "max-[760px]:static max-[760px]:grid max-[760px]:gap-x-[7px] max-[760px]:gap-y-[3px] max-[760px]:[grid-template-columns:repeat(2,minmax(0,1fr))]",
  "max-[600px]:grid-cols-1 max-[600px]:px-[13px] max-[600px]:py-[15px]",
);

export const PUBLIC_LEGAL_SUMMARY_TITLE_CLASS = cn(
  "mb-[9px] ml-[7px] text-[9px] font-[850] uppercase tracking-[1.2px] text-pub-muted",
  "max-[760px]:col-span-full max-[600px]:col-auto",
);

export const PUBLIC_LEGAL_SUMMARY_LINK_CLASS = cn(
  "rounded-[8px] px-[7px] py-2 text-[10px] font-[660] leading-[1.4] text-pub-body transition-colors",
  "hover:bg-pub-accent-bg hover:text-pub-accent motion-reduce:transition-none",
);

export const PUBLIC_LEGAL_SUMMARY_HELP_CLASS = cn(
  "mx-[5px] mt-[13px] inline-flex items-center justify-between gap-1.5 border-t border-pub-border-soft pt-[13px] text-[10px] font-extrabold text-pub-accent",
  "max-[760px]:col-span-full max-[760px]:mt-[7px] max-[600px]:col-auto",
);

export const PUBLIC_LEGAL_TEXT_CLASS = "flex min-w-0 flex-col gap-[11px]";

export const PUBLIC_LEGAL_SECTION_CLASS = cn(
  "grid scroll-mt-[calc(var(--sre-header-height,72px)+18px)] gap-[15px] rounded-[15px] border border-pub-border bg-pub-surface px-[25px] py-[23px] shadow-pub-sm",
  "[grid-template-columns:34px_minmax(0,1fr)]",
  "[&_h2]:mt-0.5 [&_h2]:mb-[13px] [&_h2]:text-[16px] [&_h2]:font-extrabold [&_h2]:tracking-[-0.35px] [&_h2]:text-pub-heading",
  "max-[600px]:gap-[10px] max-[600px]:px-[15px] max-[600px]:py-[17px] max-[600px]:[grid-template-columns:26px_minmax(0,1fr)]",
  "max-[600px]:[&_h2]:mt-[3px] max-[600px]:[&_h2]:text-[14px]",
);

export const PUBLIC_LEGAL_SECTION_NUMBER_CLASS = cn(
  "grid size-[30px] place-items-center rounded-[10px] border border-pub-border-strong bg-pub-accent-bg text-[9px] font-[850] text-pub-accent",
  "max-[600px]:size-[25px] max-[600px]:rounded-[8px]",
);

export const PUBLIC_LEGAL_BODY_CLASS = cn(
  "text-justify text-[11px] leading-[1.8] text-pub-body",
  "[&_p]:mt-0 [&_p]:mb-[11px] [&_p:last-child]:mb-0",
  "[&_strong]:font-[780] [&_strong]:text-pub-body-strong",
  "[&_code]:rounded-[4px] [&_code]:bg-pub-surface-alt [&_code]:px-[5px] [&_code]:py-0.5 [&_code]:text-[0.92em] [&_code]:text-pub-body",
  "[&_a:not([data-law-link])]:font-[760] [&_a:not([data-law-link])]:text-pub-accent [&_a:not([data-law-link])]:underline",
  "[&_a:not([data-law-link])]:decoration-[color-mix(in_srgb,var(--pub-accent)_26%,transparent)] [&_a:not([data-law-link])]:underline-offset-[3px]",
);

export const PUBLIC_LEGAL_DEFINITIONS_CLASS = cn(
  "mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[11px] border border-pub-border bg-pub-border",
  "[&>div]:min-w-0 [&>div]:bg-pub-page [&>div]:px-[14px] [&>div]:py-3",
  "[&_dt]:mb-[5px] [&_dt]:text-[9px] [&_dt]:font-extrabold [&_dt]:tracking-[0.3px] [&_dt]:text-pub-muted-2",
  "[&_dd]:m-0 [&_dd]:text-[10px] [&_dd]:font-[690] [&_dd]:leading-[1.6] [&_dd]:text-pub-body",
  "max-[600px]:grid-cols-1",
);

export const PUBLIC_LEGAL_LIST_CLASS = cn(
  "mt-0 mb-3 flex flex-col gap-2 pl-[18px]",
  "[&_li]:pl-0.5 [&_li::marker]:text-pub-accent",
);

export const PUBLIC_LEGAL_NOTE_CLASS = cn(
  "mt-[14px] flex items-start gap-[10px] rounded-[10px] border border-pub-border bg-pub-surface-soft p-3",
  "text-justify text-[10px] leading-[1.65] text-pub-muted",
  "[&>svg]:shrink-0 [&>svg]:text-pub-accent",
);

export const PUBLIC_LEGAL_SOURCE_LINKS_CLASS = cn(
  "mt-[14px] flex flex-wrap gap-[9px]",
  "max-[600px]:flex-col max-[600px]:items-stretch max-[600px]:[&_a]:justify-between",
);

export const PUBLIC_LEGAL_SOURCE_LINK_CLASS = cn(
  "inline-flex min-h-9 items-center gap-[7px] rounded-[9px] border border-pub-border bg-pub-surface-soft px-3",
  "text-[10px] font-[790] text-pub-accent transition-colors motion-reduce:transition-none",
  "hover:border-pub-border-accent hover:bg-pub-accent-bg",
);

export const PUBLIC_LEGAL_ALERT_CLASS = cn(
  "mt-[22px] grid items-start gap-[13px] rounded-[13px] border border-pub-border-gold bg-pub-gold-bg px-[19px] py-[17px]",
  "[grid-template-columns:38px_minmax(0,1fr)]",
  "[&_strong]:text-[11px] [&_strong]:font-[850] [&_strong]:text-pub-gold",
  "[&_p]:mt-[5px] [&_p]:mb-0 [&_p]:text-justify [&_p]:text-[10px] [&_p]:leading-[1.65] [&_p]:text-pub-muted",
);

export const PUBLIC_LEGAL_ALERT_ICON_CLASS =
  "grid size-9 place-items-center rounded-[11px] bg-pub-gold-bg text-pub-gold";
