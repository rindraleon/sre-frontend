import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSre } from "@/context/SreContext";
import { Button } from "@/components/ui";
import { AuthHeader } from "@/components/layout/auth-header";
import { isApiConfigured, getRegistrationStateApi } from "@/services/api-client";
import { RegisterForm } from "@/components/forms/auth/register-form";
import { ROUTES } from "@/constants";

export function RegisterPage() {
  const { etat, chargementInitial, mettreAJourEtat } = useSre();
  const [verificationApiTerminee, setVerificationApiTerminee] = useState(!isApiConfigured);
  const [erreurVerificationApi, setErreurVerificationApi] = useState<string | null>(null);
  const [tentativeVerificationApi, setTentativeVerificationApi] = useState(0);

  useEffect(() => {
    if (!isApiConfigured) return;
    let actif = true;
    setVerificationApiTerminee(false);
    setErreurVerificationApi(null);
    getRegistrationStateApi()
      .then((resultat) => {
        if (actif)
          mettreAJourEtat((courant) => ({
            ...courant,
            administrateurInitialise: resultat.administrateurInitialise,
          }));
      })
      .catch((cause) => {
        if (actif)
          setErreurVerificationApi(
            cause instanceof Error ? cause.message : "Impossible de vérifier l’état de l’API SRE.",
          );
      })
      .finally(() => {
        if (actif) setVerificationApiTerminee(true);
      });
    return () => {
      actif = false;
    };
  }, [mettreAJourEtat, tentativeVerificationApi]);

  const premierAdministrateur = Boolean(
    isApiConfigured &&
    !chargementInitial &&
    verificationApiTerminee &&
    !erreurVerificationApi &&
    !etat.administrateurInitialise &&
    !etat.utilisateurs.some((utilisateur) => utilisateur.role === "ADMIN"),
  );

  let contenuInscription;
  if (!isApiConfigured) {
    contenuInscription = (
      <div className="note-fiscale-sre" role="alert">
        <span>!</span>
        <p>
          Le service backend n’est pas configuré. Définissez VITE_API_URL puis redémarrez
          l’interface. Aucun compte local ou jeu de données de démonstration ne sera créé.
        </p>
      </div>
    );
  } else if (chargementInitial || !verificationApiTerminee) {
    contenuInscription = (
      <div className="chargement-sre">Vérification de l’initialisation du backend…</div>
    );
  } else if (erreurVerificationApi) {
    contenuInscription = (
      <div className="note-fiscale-sre" role="alert">
        <span>!</span>
        <div>
          <p>{erreurVerificationApi}</p>
          <Button
            type="button"
            variante="contour"
            onClick={() => {
              setErreurVerificationApi(null);
              setVerificationApiTerminee(false);
              setTentativeVerificationApi((tentative) => tentative + 1);
            }}
          >
            Réessayer la vérification
          </Button>
        </div>
      </div>
    );
  } else {
    contenuInscription = (
      <RegisterForm
        key={premierAdministrateur ? "premier-admin" : "contribuable"}
        premierAdministrateur={premierAdministrateur}
      />
    );
  }

  return (
    <div className="page-auth-sre">
      <AuthHeader
        surTitre="CRÉATION DE COMPTE"
        libelleLien="Déjà un compte ? Se connecter"
        cheminLien={ROUTES.connexion}
      />
      <main className="auth-cadre-sre auth-cadre-sre--large">
        <section className="auth-carte-sre">
          <span className="sur-titre-sre text-center">
            {premierAdministrateur ? "INITIALISATION DE L’ADMINISTRATION" : "ESPACE CONTRIBUABLE"}
          </span>
          <h1 className="text-center">
            {premierAdministrateur ? "Créer le premier administrateur" : "Créer mon compte"}
          </h1>
          <p className="text-center">
            {premierAdministrateur
              ? "Un seul processus de création initiale est autorisé : ce compte deviendra l’administrateur. Le bouton disparaîtra dès la création effectuée."
              : "Créez votre accès pour consulter votre espace contribuable."}
          </p>
          {contenuInscription}
          <p className="auth-lien-secondaire-sre">
            Déjà inscrit ? <Link to={ROUTES.connexion}>Se connecter</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
