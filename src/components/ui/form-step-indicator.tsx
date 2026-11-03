export function FormStepIndicator({
  step,
  steps,
}: Readonly<{ step: number; steps: readonly string[] }>) {
  const value = Math.min(Math.max(step + 1, 1), steps.length);
  const progression = steps.length ? (value / steps.length) * 100 : 0;
  return (
    <div
      className="mb-0.5 grid gap-2 rounded-[10px] border border-sre-border bg-sre-bg px-3 py-[10px]"
      aria-label={`Étape ${value} sur ${steps.length}`}
    >
      <div
        className="h-[5px] overflow-hidden rounded-full bg-sre-border"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={value}
        aria-label="Progression du formulaire"
      >
        <span
          className="block h-full rounded-[inherit] bg-sre-teal transition-[width] duration-200"
          style={{ width: `${progression}%` }}
        />
      </div>
      <div className="flex items-baseline justify-between gap-[10px] text-[10px] text-sre-muted">
        <span>
          Étape {value} sur {steps.length}
        </span>
        <strong className="text-[12px] font-[760] text-sre-ink">{steps[value - 1]}</strong>
      </div>
    </div>
  );
}
