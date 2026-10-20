/** Indicateur accessible commun aux formulaires découpés en étapes courtes. */
export function FormStepIndicator({
  etape,
  etapes,
}: Readonly<{ etape: number; etapes: readonly string[] }>) {
  const valeur = Math.min(Math.max(etape + 1, 1), etapes.length);
  const progression = etapes.length ? (valeur / etapes.length) * 100 : 0;
  return (
    <div
      className="indicateur-etape-formulaire-sre"
      aria-label={`Étape ${valeur} sur ${etapes.length}`}
    >
      <div
        className="indicateur-etape-formulaire-sre__barre"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={etapes.length}
        aria-valuenow={valeur}
        aria-label="Progression du formulaire"
      >
        <span style={{ width: `${progression}%` }} />
      </div>
      <div className="indicateur-etape-formulaire-sre__texte">
        <span>
          Étape {valeur} sur {etapes.length}
        </span>
        <strong>{etapes[valeur - 1]}</strong>
      </div>
    </div>
  );
}
