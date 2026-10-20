import { useEffect } from "react";

export function useReveal() {
  useEffect(() => {
    const cibles = Array.from(
      document.querySelectorAll<HTMLElement>("[data-revelation]"),
    );
    if (cibles.length === 0) return;
    const mouvementReduit = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (mouvementReduit || typeof IntersectionObserver === "undefined") {
      for (const cible of cibles) cible.classList.add("revelation-visible");
      return;
    }
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (entree.isIntersecting) {
            entree.target.classList.add("revelation-visible");
            observateur.unobserve(entree.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    for (const cible of cibles) observateur.observe(cible);
    return () => observateur.disconnect();
  }, []);
}
