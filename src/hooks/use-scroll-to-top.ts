import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export type ScrollToTopBehavior = Extract<ScrollBehavior, "instant" | "smooth">;

export type UseScrollToTopOptions = {
  behavior?: ScrollToTopBehavior;
};

export function shouldScrollToTop(hash: string): boolean {
  return hash === "";
}

export function resolveScrollBehavior(
  behavior: ScrollToTopBehavior,
  reducedMotion: boolean,
): ScrollToTopBehavior {
  return reducedMotion ? "instant" : behavior;
}

export function useScrollToTop({ behavior = "instant" }: UseScrollToTopOptions = {}) {
  const { pathname, hash } = useLocation();
  const previousRestoration = useRef<ScrollRestoration | undefined>(undefined);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;
    previousRestoration.current = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previousRestoration.current ?? "auto";
    };
  }, []);

  useEffect(() => {
    if (!shouldScrollToTop(hash)) return;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const mode = resolveScrollBehavior(behavior, reducedMotion);
    frame.current = window.requestAnimationFrame(() => {
      frame.current = window.requestAnimationFrame(() => {
        frame.current = null;
        window.scrollTo({ top: 0, left: 0, behavior: mode });
      });
    });
    return () => {
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [pathname, hash, behavior]);
}

export const BACK_TO_TOP_MIN_SCROLL = 320;

export function resolveBackToTopThreshold(viewportHeight: number): number {
  return Math.max(BACK_TO_TOP_MIN_SCROLL, Math.round(viewportHeight * 0.6));
}

export function isScrollablePage(documentHeight: number, viewportHeight: number): boolean {
  return documentHeight - viewportHeight > 240;
}
