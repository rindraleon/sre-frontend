import { useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, pathMatchesRole, roleHomePath } from "@/contexts";
import { LoginPage } from "@/pages/auth";
import { HelpPage } from "@/pages/help";
import { useSre } from "@/contexts";
import { ConfirmDialog, PageLoader, Button, FORM_ACTIONS_CLASS } from "@/components";
import { cn } from "@/utils";

export function ProtectedRoute({
  role,
  children,
}: Readonly<{ role: "ADMIN" | "CLIENT"; children: ReactNode }>) {
  const {
    session,
    logOut,
    isApiVerificationInProgress,
    apiVerificationError,
    retryApiVerification,
  } = useAuth();
  const { isInitialLoading } = useSre();
  const location = useLocation();
  const [confirmationLogout, setConfirmationLogout] = useState(false);
  const confirmLogout = () => {
    setConfirmationLogout(false);
    logOut();
  };

  if (isInitialLoading || isApiVerificationInProgress) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-pub-surface-alt text-sre-ink">
        <span className="mb-[5px] grid size-[43px] place-items-center rounded-xl bg-sre-teal text-[12px] font-[850] text-white">
          SRE
        </span>
        <PageLoader
          label="Préparation de votre espace…"
          detail="Vérification de la session et chargement depuis le serveur"
        />
      </div>
    );
  }
  if (!session) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/connexion?${new URLSearchParams({ retour: returnTo })}`} replace />;
  }
  if (apiVerificationError) {
    return (
      <>
        <main
          className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-pub-surface-alt text-sre-ink"
          role="alert"
        >
          <span className="mb-[5px] grid size-[43px] place-items-center rounded-xl bg-sre-teal text-[12px] font-[850] text-white">
            SRE
          </span>
          <strong>Impossible de charger les données du serveur.</strong>
          <small>{apiVerificationError}</small>
          <div className={cn(FORM_ACTIONS_CLASS)}>
            <Button variant="primary" onClick={retryApiVerification}>
              Réessayer
            </Button>
            <Button variant="outline" onClick={() => setConfirmationLogout(true)}>
              Se déconnecter
            </Button>
          </div>
        </main>
        <ConfirmDialog
          open={confirmationLogout}
          title="Se déconnecter ?"
          description="Votre session sera fermée sur cet appareil. Vous devrez vous authentifier à nouveau pour accéder à votre espace."
          close={() => setConfirmationLogout(false)}
          confirm={confirmLogout}
          confirmLabel="Se déconnecter"
        />
      </>
    );
  }
  if (!pathMatchesRole(location.pathname, role) || session.role !== role) {
    return <Navigate to={roleHomePath(session.role)} replace />;
  }
  const configurationRequired = session.mustChangePassword || !session.isProfileComplete;
  const setupPath = `${roleHomePath(role)}/configuration-initiale`;
  if (configurationRequired && location.pathname !== setupPath) {
    return <Navigate to={setupPath} replace />;
  }
  return children;
}

export function LoginRoute() {
  const { session } = useAuth();
  if (session) {
    const rootPath = roleHomePath(session.role);
    const configurationRequired = session.mustChangePassword || !session.isProfileComplete;
    return (
      <Navigate
        to={configurationRequired ? `${rootPath}/configuration-initiale` : rootPath}
        replace
      />
    );
  }
  return <LoginPage />;
}

export function HelpRoute() {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to={`/connexion?${new URLSearchParams({ retour: "/aide" })}`} replace />;
  }
  return <HelpPage />;
}
