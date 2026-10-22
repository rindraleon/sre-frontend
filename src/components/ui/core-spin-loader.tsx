import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** CoreSpin animated in CSS: no timer, no async state to clean up. */
export function CoreSpinLoader({
  label = "Chargement…",
  size = 28,
  compact = false,
  className,
}: Readonly<{
  label?: string;
  size?: number;
  /** Compact presentation for a local action or a button. */
  compact?: boolean;
  className?: string;
}>) {
  const style = { "--core-spin-size": `${Math.max(12, size)}px` } as CSSProperties;

  return (
    <span
      className={cn("core-spin-sre", compact && "core-spin-sre--compact", className)}
      role="status"
      aria-label={label}
      style={style}
    >
      <span className="core-spin-sre__visual" aria-hidden="true">
        <i className="core-spin-sre__ring core-spin-sre__ring--outer" />
        <i className="core-spin-sre__ring core-spin-sre__ring--inner" />
        <i className="core-spin-sre__arc core-spin-sre__arc--main" />
        <i className="core-spin-sre__arc core-spin-sre__arc--reverse" />
        <i className="core-spin-sre__orbit">
          <i className="core-spin-sre__dot" />
        </i>
        <i className="core-spin-sre__core" />
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Loader centered in the available area for a page or route initialization. */
export function PageLoader({
  label = "Chargement…",
  detail,
}: Readonly<{ label?: string; detail?: string }>) {
  return (
    <div className="page-loader-sre" aria-busy="true">
      <CoreSpinLoader label={label} size={42} />
      <strong>{label}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}
