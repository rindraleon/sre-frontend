import { cn } from "@/utils";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSre } from "@/contexts";
import { Button, TAX_NOTE_CLASS, OVERLINE_CLASS } from "@/components";
import { AuthHeader } from "@/components/Layout";
import { isApiConfigured } from "@/services/api";
import { RegisterForm } from "@/components/AuthComponents";
import { getRegistrationStateApi } from "@/services/auth";
import { ROUTES } from "@/data";

export function RegisterPage() {
  const { state, isInitialLoading, updateState } = useSre();
  const [isApiVerificationComplete, setVerificationApiCompleted] = useState(!isApiConfigured);
  const [apiVerificationError, setApiVerificationError] = useState<string | null>(null);
  const [apiVerificationAttempt, setApiVerificationAttempt] = useState(0);

  useEffect(() => {
    if (!isApiConfigured) return;
    let isActive = true;
    setVerificationApiCompleted(false);
    setApiVerificationError(null);
    getRegistrationStateApi()
      .then((result) => {
        if (isActive)
          updateState((current) => ({
            ...current,
            isAdministratorInitialized: result.administrateurInitialise,
          }));
      })
      .catch((cause) => {
        if (isActive)
          setApiVerificationError(
            cause instanceof Error ? cause.message : "Impossible de vérifier l’état de l’API SRE.",
          );
      })
      .finally(() => {
        if (isActive) setVerificationApiCompleted(true);
      });
    return () => {
      isActive = false;
    };
  }, [updateState, apiVerificationAttempt]);

  const isFirstAdministrator = Boolean(
    isApiConfigured &&
    !isInitialLoading &&
    isApiVerificationComplete &&
    !apiVerificationError &&
    !state.isAdministratorInitialized &&
    !state.users.some((user) => user.role === "ADMIN"),
  );

  let registrationContent;
  if (!isApiConfigured) {
    registrationContent = (
      <div className={TAX_NOTE_CLASS} role="alert">
        <span>!</span>
        <p>
          Le service backend n’est pas configuré. Définissez VITE_API_URL puis redémarrez
          l’interface. Aucun compte local ou jeu de données de démonstration ne sera créé.
        </p>
      </div>
    );
  } else if (isInitialLoading || !isApiVerificationComplete) {
    registrationContent = (
      <div className="p-4 text-center text-[11px] text-pub-muted">
        Vérification de l’initialisation du backend…
      </div>
    );
  } else if (apiVerificationError) {
    registrationContent = (
      <div className={TAX_NOTE_CLASS} role="alert">
        <span>!</span>
        <div>
          <p>{apiVerificationError}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setApiVerificationError(null);
              setVerificationApiCompleted(false);
              setApiVerificationAttempt((attempt) => attempt + 1);
            }}
          >
            Réessayer la vérification
          </Button>
        </div>
      </div>
    );
  } else {
    registrationContent = (
      <RegisterForm
        key={isFirstAdministrator ? "premier-admin" : "contribuable"}
        isFirstAdministrator={isFirstAdministrator}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-pub-surface-alt text-sre-ink bg-[image:radial-gradient(ellipse_at_80%_15%,color-mix(in_srgb,var(--pub-accent-soft)_20%,transparent),transparent_32%)]">
      <AuthHeader
        overline="CRÉATION DE COMPTE"
        linkLabel="Déjà un compte ? Se connecter"
        linkPath={ROUTES.login}
      />
      <main className="flex w-full flex-1 items-start justify-center px-5 pb-8 pt-[29px]">
        <section className="w-[min(100%,675px)] rounded-[14px] border border-pub-border bg-pub-glass px-7 py-[26px] shadow-pub-sm">
          <span className={cn(OVERLINE_CLASS, "text-center")}>
            {isFirstAdministrator ? "INITIALISATION DE L’ADMINISTRATION" : "ESPACE CONTRIBUABLE"}
          </span>
          <h1 className="my-[7px] text-[23px] font-[780] tracking-[-0.75px] text-sre-ink text-center">
            {isFirstAdministrator ? "Créer le premier administrateur" : "Créer mon compte"}
          </h1>
          <p className="mb-[17px] mt-0 text-[11px] leading-[1.6] text-pub-muted text-center">
            {isFirstAdministrator
              ? "Un seul processus de création initiale est autorisé : ce compte deviendra l’administrateur. Le bouton disparaîtra dès la création effectuée."
              : "Créez votre accès pour consulter votre espace contribuable."}
          </p>
          {registrationContent}
          <p className="mt-[15px] text-center text-[12px] text-pub-muted">
            Déjà inscrit ?{" "}
            <Link className="font-[750] text-sre-blue" to={ROUTES.login}>
              Se connecter
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
