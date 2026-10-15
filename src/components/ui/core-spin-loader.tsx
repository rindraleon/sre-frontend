import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** CoreSpin animé en CSS : aucune minuterie, aucun état asynchrone à nettoyer. */
export function CoreSpinLoader({
  libelle = "Chargement…",
  taille = 28,
  compact = false,
  className,
}: Readonly<{
  libelle?: string;
  taille?: number;
  /** Présentation compacte pour une action locale ou un bouton. */
  compact?: boolean;
  className?: string;
}>) {
  const style = { "--core-spin-size": `${Math.max(12, taille)}px` } as CSSProperties;

  return (
    <span
      className={cn("core-spin-sre", compact && "core-spin-sre--compact", className)}
      role="status"
      aria-label={libelle}
      style={style}
    >
      <span className="core-spin-sre__visual" aria-hidden="true">
        <i className="core-spin-sre__ring core-spin-sre__ring--outer" />
        <i className="core-spin-sre__ring core-spin-sre__ring--inner" />
        <i className="core-spin-sre__arc core-spin-sre__arc--main" />
        <i className="core-spin-sre__arc core-spin-sre__arc--reverse" />
        <i className="core-spin-sre__orbit">
          <i className="core-spin-sre__point" />
        </i>
        <i className="core-spin-sre__core" />
      </span>
      <span className="sr-only">{libelle}</span>
    </span>
  );
}

/** Loader centré dans la zone disponible pour une initialisation de page ou de route. */
export function PageLoader({
  libelle = "Chargement…",
  detail,
}: Readonly<{ libelle?: string; detail?: string }>) {
  return (
    <div className="page-loader-sre" aria-busy="true">
      <CoreSpinLoader libelle={libelle} taille={42} />
      <strong>{libelle}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}
