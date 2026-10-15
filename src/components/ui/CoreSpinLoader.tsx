import { LoaderCircle } from "lucide-react";

/**
 * CoreSpin Loader — indicateur de chargement unique du portail.
 * Accessible (role="status", libellé), animation désactivée si
 * l'utilisateur préfère les mouvements réduits (règle CSS globale).
 */
export function CoreSpinLoader({
  libelle = "Chargement…",
  taille = 28,
}: Readonly<{ libelle?: string; taille?: number }>) {
  return (
    <span className="core-spin-sre" role="status" aria-label={libelle}>
      <LoaderCircle size={taille} aria-hidden="true" />
    </span>
  );
}

/** Loader centré dans la zone disponible (chargement de page ou de session). */
export function PageLoader({
  libelle = "Chargement…",
  detail,
}: Readonly<{ libelle?: string; detail?: string }>) {
  return (
    <div className="page-loader-sre" aria-busy="true">
      <CoreSpinLoader libelle={libelle} taille={34} />
      <strong>{libelle}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}
