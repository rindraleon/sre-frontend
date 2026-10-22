import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSre } from "@/context/SreContext";
import { Button } from "@/components/ui";
import { AuthHeader } from "@/components/layout/auth-header";
import { isApiConfigured, getRegistrationStateApi } from "@/services/api-client";
import { RegisterForm } from "@/components/forms/auth/register-form";
import { ROUTES } from "@/constants";

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
      <div className="tax-note-sre" role="alert">
        <span>!</span>
        <p>
          Le service backend n’est pas configuré. Définissez VITE_API_URL puis redémarrez
          l’interface. Aucun compte local ou jeu de données de démonstration ne sera créé.
        </p>
      </div>
    );
  } else if (isInitialLoading || !isApiVerificationComplete) {
    registrationContent = (
      <div className="loading-sre">Vérification de l’initialisation du backend…</div>
    );
  } else if (apiVerificationError) {
    registrationContent = (
      <div className="tax-note-sre" role="alert">
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
    <div className="page-auth-sre">
      <AuthHeader
        overline="CRÉATION DE COMPTE"
        linkLabel="Déjà un compte ? Se connecter"
        linkPath={ROUTES.login}
      />
      <main className="auth-frame-sre auth-frame-sre--wide">
        <section className="auth-card-sre">
          <span className="overline-sre text-center">
            {isFirstAdministrator ? "INITIALISATION DE L’ADMINISTRATION" : "ESPACE CONTRIBUABLE"}
          </span>
          <h1 className="text-center">
            {isFirstAdministrator ? "Créer le premier administrateur" : "Créer mon compte"}
          </h1>
          <p className="text-center">
            {isFirstAdministrator
              ? "Un seul processus de création initiale est autorisé : ce compte deviendra l’administrateur. Le bouton disparaîtra dès la création effectuée."
              : "Créez votre accès pour consulter votre espace contribuable."}
          </p>
          {registrationContent}
          <p className="auth-link-secondary-sre">
            Déjà inscrit ? <Link to={ROUTES.login}>Se connecter</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
