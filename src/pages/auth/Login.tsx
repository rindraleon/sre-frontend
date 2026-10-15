import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
import { useAuth, roleHomePath } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { isApiConfigured } from "@/services/api-client";
import { AuthHeader } from "@/components/layout/auth-header";
import { loginSchema, type LoginFormValues } from "@/validation/auth.schema";
import { applyApiErrors, apiErrorMessage } from "@/validation/apiErrors";
import { FormField, PasswordField, SubmitButton, FormError } from "@/components/forms/form-field";

export function LoginPage() {
  const [erreur, definirErreur] = useState("");
  const [rechercheParams] = useSearchParams();
  const navigation = useNavigate();
  const { connecter } = useAuth();
  const { notifier, chargementInitial } = useSre();
  const retour = rechercheParams.get("retour");
  const formulaire = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { courriel: "", motDePasse: "" },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = formulaire;

  const soumettre = handleSubmit(async (valeurs) => {
    definirErreur("");
    try {
      const session = await connecter(valeurs.courriel, valeurs.motDePasse);
      if (!session) {
        definirErreur("Adresse e-mail ou mot de passe incorrect, ou compte inactif.");
        return;
      }
      notifier(
        `Connexion réussie à votre espace ${session.role === "ADMIN" ? "administratif" : "contribuable"}.`,
        "succes",
      );
      const cheminRacine = roleHomePath(session.role);
      const cheminRetour = retour?.split("?")[0] ?? "";
      const retourAutorise =
        retour && (cheminRetour === cheminRacine || cheminRetour.startsWith(`${cheminRacine}/`))
          ? retour
          : null;
      const destination = session.changementMotDePasseRequis
        ? `${cheminRacine}/changement-mot-de-passe`
        : (retourAutorise ?? cheminRacine);
      navigation(destination, { replace: true });
    } catch (cause) {
      const globales = applyApiErrors(formulaire, cause);
      definirErreur(
        globales.length
          ? globales.join(" ")
          : apiErrorMessage(cause, "Impossible de vérifier la connexion. Réessayez."),
      );
    }
  });

  return (
    <div className="page-auth-sre">
      <AuthHeader
        surTitre="ACCÈS AUX SERVICES FISCAUX"
        libelleLien="Retour au portail"
        cheminLien="/accueil"
      />
      <main className="auth-cadre-sre">
        <section className="auth-carte-sre">
          <h1 className="text-center">Se connecter</h1>
          <p className="text-center">
            Accédez à votre espace contribuable ou au back-office avec votre compte serveur.
          </p>
          <form onSubmit={soumettre} className="formulaire-sre" noValidate>
            <FormField libelle="Adresse e-mail" erreur={errors.courriel} requis>
              {(proprietes) => (
                <span className="champ-sre champ-sre--icone">
                  <Mail size={16} aria-hidden="true" />
                  <input
                    {...proprietes}
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    placeholder="nom@exemple.mg"
                    {...register("courriel")}
                  />
                </span>
              )}
            </FormField>
            <div className="champ-label-lien-sre">
              <span aria-hidden="true" />
              {isApiConfigured ? (
                <span className="lien-reset-indisponible-sre">
                  Réinitialisation email à configurer
                </span>
              ) : (
                <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
              )}
            </div>
            <PasswordField
              libelle="Mot de passe"
              erreur={errors.motDePasse}
              requis
              autoComplete="current-password"
              placeholder="Votre mot de passe"
              {...register("motDePasse")}
            />
            <FormError message={erreur} />
            <SubmitButton
              enCours={isSubmitting}
              libelleEnCours="Vérification…"
              disabled={chargementInitial || !isApiConfigured}
            >
              {chargementInitial ? (
                "Chargement des comptes…"
              ) : (
                <>
                  Se connecter <ArrowRight size={16} />
                </>
              )}
            </SubmitButton>
          </form>
          <p className="auth-lien-secondaire-sre">
            Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
          </p>
          <div className="auth-premier-admin-sre">
            <span>Première visite ?</span>
            <Link to="/inscription">
              Créer le premier compte administrateur ou un compte contribuable{" "}
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
