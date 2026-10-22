import { useEffect } from "react";
import type { RefObject } from "react";

export function useHeaderHeight(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () =>
      document.documentElement.style.setProperty(
        "--sre-header-height",
        `${element.offsetHeight}px`,
      );
    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("resize", update);
        document.documentElement.style.removeProperty("--sre-header-height");
      };
    }
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--sre-header-height");
    };
  }, [ref]);
}
