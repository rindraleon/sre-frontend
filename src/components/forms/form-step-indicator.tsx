/** Accessible indicator shared by forms split into short steps. */
export function FormStepIndicator({
  step,
  steps,
}: Readonly<{ step: number; steps: readonly string[] }>) {
  const value = Math.min(Math.max(step + 1, 1), steps.length);
  const progression = steps.length ? (value / steps.length) * 100 : 0;
  return (
    <div
      className="form-step-indicator-sre"
      aria-label={`Étape ${value} sur ${steps.length}`}
    >
      <div
        className="form-step-indicator-sre__bar"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={value}
        aria-label="Progression du formulaire"
      >
        <span style={{ width: `${progression}%` }} />
      </div>
      <div className="form-step-indicator-sre__text">
        <span>
          Étape {value} sur {steps.length}
        </span>
        <strong>{steps[value - 1]}</strong>
      </div>
    </div>
  );
}
