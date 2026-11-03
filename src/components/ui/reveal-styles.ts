import { cn } from "@/utils";

export const REVEAL_CLASS = cn(
  "motion-safe:opacity-0 motion-safe:transition-[opacity,transform]",
  "motion-safe:duration-[620ms] motion-safe:ease-out will-change-[opacity,transform]",
);

export const REVEAL_UP_CLASS = "motion-safe:translate-y-[26px]";

export const REVEAL_LEFT_CLASS = "motion-safe:-translate-x-[28px]";

export const REVEAL_RIGHT_CLASS = "motion-safe:translate-x-[28px]";

export const REVEAL_ZOOM_CLASS = "motion-safe:scale-[0.94]";

const REVEAL_DELAYS = [
  "",
  "motion-safe:[transition-delay:80ms]",
  "motion-safe:[transition-delay:160ms]",
  "motion-safe:[transition-delay:240ms]",
  "motion-safe:[transition-delay:320ms]",
  "motion-safe:[transition-delay:400ms]",
] as const;

export const revealDelayClass = (step?: number) =>
  REVEAL_DELAYS[Math.min(Math.max(step ?? 0, 0), 5)];
