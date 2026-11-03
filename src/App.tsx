import { AppRoutes, RouteProgress } from "@/routes";
import { BackToTop, ToastRegion } from "@/components";
import { useScrollToTop } from "@/hooks";

export function App() {
  useScrollToTop();

  return (
    <>
      <RouteProgress />
      <AppRoutes />
      <BackToTop />
      <ToastRegion />
    </>
  );
}
