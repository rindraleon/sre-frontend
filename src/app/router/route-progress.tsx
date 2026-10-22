import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export function RouteProgress() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setVisible(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisible(false), 420);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [location.pathname]);

  if (!visible) return null;
  return (
    <div
      className="navigation-progress-sre"
      role="status"
      aria-label="Chargement de la page"
      aria-live="polite"
    >
      <span />
    </div>
  );
}
