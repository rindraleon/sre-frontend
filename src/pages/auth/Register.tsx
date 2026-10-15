import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSre } from "@/context/SreContext";
import { Button } from "@/components/ui";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { isApiConfigured, getRegistrationStateApi } from "@/services/api";

export function RegisterPage() {
  const { etat, chargementInitial, mettreAJourEtat } = useSre();
  const [verificationApiTerminee, definirVerificationApiTerminee] = useState(!isApiConfigured);
  const [erreurVerificationApi, definirErreurVerificationApi] = useState<string | null>(null);
  const [tentativeVerificationApi, definirTentativeVerificationApi] = useState(0);
  useEffect(() => {
    if (!isApiConfigured) return;
    let actif = true;
    definirVerificationApiTerminee(false);
    definirErreurVerificationApi(null);
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
          definirErreurVerificationApi(
            cause instanceof Error ? cause.message : "Impossible de vérifier l’état de l’API SRE.",
          );
      })
      .finally(() => {
        if (actif) definirVerificationApiTerminee(true);
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

  return (
    <div className="page-auth-sre">
      <AuthHeader
        surTitre="CRÉATION DE COMPTE"
        libelleLien="Déjà un compte ? Se connecter"
        cheminLien="/connexion"
      />
      <main className="auth-cadre-sre auth-cadre-sre--large">
        <section className="auth-carte-sre">
          <span className="sur-titre-sre text-center">
            {premierAdministrateur ? "INITIALISATION DE L’ADMINISTRATION" : "ESPACE CONTRIBUABLE"}
          </span>
          <h1 className="text-center">
            {premierAdministrateur ? "Créer le premier compte" : "Créer mon compte"}
          </h1>
          <p className="text-center">
            {premierAdministrateur
              ? "Conformément à la règle de première initialisation, ce compte deviendra l’administrateur. Les inscriptions suivantes seront des comptes contribuables."
              : "Créez votre accès pour consulter votre espace contribuable."}
          </p>
          {!isApiConfigured ? (
            <div className="note-fiscale-sre" role="alert">
              <span>!</span>
              <p>
                Le service backend n’est pas configuré. Définissez VITE_API_URL puis redémarrez
                l’interface. Aucun compte local ou jeu de données de démonstration ne sera créé.
              </p>
            </div>
          ) : chargementInitial || !verificationApiTerminee ? (
            <div className="chargement-sre">Vérification de l’initialisation du backend…</div>
          ) : erreurVerificationApi ? (
            <div className="note-fiscale-sre" role="alert">
              <span>!</span>
              <div>
                <p>{erreurVerificationApi}</p>
                <Button
                  type="button"
                  variante="contour"
                  onClick={() => {
                    definirErreurVerificationApi(null);
                    definirVerificationApiTerminee(false);
                    definirTentativeVerificationApi((tentative) => tentative + 1);
                  }}
                >
                  Réessayer la vérification
                </Button>
              </div>
            </div>
          ) : (
            <RegisterForm
              // Remontage quand le régime (premier admin / contribuable) est connu :
              // le schéma de validation en dépend.
              key={premierAdministrateur ? "premier-admin" : "contribuable"}
              premierAdministrateur={premierAdministrateur}
            />
          )}
          <p className="auth-lien-secondaire-sre">
            Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

import { RegisterForm } from "@/components/auth/RegisterForm";
