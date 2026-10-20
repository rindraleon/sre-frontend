import { useEffect } from "react";
import type { RefObject } from "react";

export function useHauteurEntete(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const maj = () =>
      document.documentElement.style.setProperty(
        "--hauteur-entete-sre",
        `${element.offsetHeight}px`,
      );
    maj();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", maj);
      return () => {
        window.removeEventListener("resize", maj);
        document.documentElement.style.removeProperty("--hauteur-entete-sre");
      };
    }
    const observateur = new ResizeObserver(maj);
    observateur.observe(element);
    return () => {
      observateur.disconnect();
      document.documentElement.style.removeProperty("--hauteur-entete-sre");
    };
  }, [ref]);
}
