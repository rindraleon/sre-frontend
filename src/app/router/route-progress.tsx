import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export function RouteProgress() {
  const emplacement = useLocation();
  const [visible, setVisible] = useState(false);
  const minuteur = useRef<number | null>(null);
  const premiereRenderisation = useRef(true);

  useEffect(() => {
    if (premiereRenderisation.current) {
      premiereRenderisation.current = false;
      return;
    }
    setVisible(true);
    if (minuteur.current) window.clearTimeout(minuteur.current);
    minuteur.current = window.setTimeout(() => setVisible(false), 420);
    return () => {
      if (minuteur.current) window.clearTimeout(minuteur.current);
    };
  }, [emplacement.pathname]);

  if (!visible) return null;
  return (
    <div
      className="progression-navigation-sre"
      role="status"
      aria-label="Chargement de la page"
      aria-live="polite"
    >
      <span />
    </div>
  );
}
