import type { CSSProperties } from "react";
import { cn } from "@/utils";

export const CORE_SPIN_CLASS =
  "inline-flex size-[var(--core-spin-size,28px)] flex-none items-center justify-center align-middle text-sre-teal";

const CORE_SPIN_VISUAL = "relative isolate block size-full";

const CORE_SPIN_SHAPE = "absolute block rounded-full";

const CORE_SPIN_OUTER =
  "inset-[4%] border border-[color-mix(in_srgb,currentColor_25%,transparent)] border-t-current animate-core-spin-outer motion-reduce:animate-none";
const CORE_SPIN_INNER =
  "inset-[22%] border border-[color-mix(in_srgb,currentColor_18%,transparent)] border-b-current animate-core-spin-inner motion-reduce:animate-none";
const coreSpinMain = (compact: boolean) =>
  cn(
    "inset-[10%] border-transparent border-t-current border-r-current",
    "[filter:drop-shadow(0_0_3px_color-mix(in_srgb,currentColor_28%,transparent))]",
    "animate-core-spin-main motion-reduce:animate-none",
    compact ? "border" : "border-2",
  );
const CORE_SPIN_REVERSE =
  "inset-[30%] border border-transparent border-b-[color-mix(in_srgb,currentColor_72%,transparent)] border-l-[color-mix(in_srgb,currentColor_42%,transparent)] animate-core-spin-reverse motion-reduce:animate-none";
const CORE_SPIN_ORBIT = "inset-0 animate-core-spin-orbit motion-reduce:animate-none";
const CORE_SPIN_DOT =
  "absolute top-[2%] left-1/2 size-[12%] -translate-x-1/2 rounded-full bg-current shadow-[0_0_6px_color-mix(in_srgb,currentColor_55%,transparent)]";
const CORE_SPIN_CORE =
  "absolute top-1/2 left-1/2 size-[13%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-current shadow-[0_0_0_3px_color-mix(in_srgb,currentColor_12%,transparent)] animate-core-spin-core motion-reduce:animate-none";

export function CoreSpinLoader({
  label = "Chargement…",
  size = 28,
  compact = false,
  className,
}: Readonly<{
  label?: string;
  size?: number;
  compact?: boolean;
  className?: string;
}>) {
  const style = { "--core-spin-size": `${Math.max(12, size)}px` } as CSSProperties;

  return (
    <span className={cn(CORE_SPIN_CLASS, className)} role="status" aria-label={label} style={style}>
      <span className={CORE_SPIN_VISUAL} aria-hidden="true">
        <i className={cn(CORE_SPIN_SHAPE, CORE_SPIN_OUTER)} />
        <i className={cn(CORE_SPIN_SHAPE, CORE_SPIN_INNER)} />
        <i className={cn(CORE_SPIN_SHAPE, coreSpinMain(compact))} />
        <i className={cn(CORE_SPIN_SHAPE, CORE_SPIN_REVERSE)} />
        <i className={CORE_SPIN_ORBIT}>
          <i className={CORE_SPIN_DOT} />
        </i>
        <i className={CORE_SPIN_CORE} />
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export const PAGE_LOADER_CLASS = cn(
  "flex flex-col items-center gap-2 px-4 py-7 text-center text-sre-ink",
  "[&>strong]:text-[14px]",
  "[&_small]:text-[12px] [&_small]:leading-[1.5] [&_small]:text-sre-muted",
);

export function PageLoader({
  label = "Chargement…",
  detail,
}: Readonly<{ label?: string; detail?: string }>) {
  return (
    <div className={PAGE_LOADER_CLASS} aria-busy="true">
      <CoreSpinLoader label={label} size={42} />
      <strong>{label}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}
