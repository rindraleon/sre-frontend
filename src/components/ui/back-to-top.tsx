import { useCallback, useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "@/utils";
import { isScrollablePage, resolveBackToTopThreshold } from "@/hooks";
import { BACK_TO_TOP_CLASS, BACK_TO_TOP_HIDDEN_CLASS } from "./back-to-top-styles";

export type BackToTopProps = {
  threshold?: number;
  label?: string;
};

export function BackToTop({
  threshold,
  label = "Revenir en haut de la page",
}: Readonly<BackToTopProps>) {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const limit = threshold ?? resolveBackToTopThreshold(window.innerHeight);
      setVisible(
        isScrollablePage(document.documentElement.scrollHeight, window.innerHeight) &&
          window.scrollY > limit,
      );
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    observer?.observe(document.body);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname, threshold]);

  const backToTop = useCallback(() => {
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    window.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? "instant" : "smooth" });
  }, []);

  return (
    <button
      type="button"
      onClick={backToTop}
      aria-label={label}
      title={label}
      tabIndex={visible ? 0 : -1}
      data-visible={visible ? "true" : "false"}
      className={cn(BACK_TO_TOP_CLASS, !visible && BACK_TO_TOP_HIDDEN_CLASS)}
    >
      <ArrowUp size={18} strokeWidth={2.4} aria-hidden="true" />
    </button>
  );
}
