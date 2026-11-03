import { cn } from "@/utils";

export const BACK_TO_TOP_CLASS = cn(
  "fixed right-[18px] z-50 grid size-[42px] place-items-center rounded-full",
  "bottom-[calc(18px+env(safe-area-inset-bottom))]",
  "border border-sre-border bg-sre-paper text-sre-ink shadow-sre",
  "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
  "hover:border-sre-teal hover:bg-sre-teal-soft hover:text-sre-blue-dark",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sre-teal",
  "print:!hidden",
  "max-[600px]:right-[12px] max-[600px]:bottom-[calc(12px+env(safe-area-inset-bottom))]",
  "max-[600px]:size-[38px]",
);

export const BACK_TO_TOP_HIDDEN_CLASS = "pointer-events-none translate-y-2 opacity-0";
