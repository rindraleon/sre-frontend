import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import { useAuth, roleHomePath } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { isApiConfigured } from "@/services/api-client";
import { ROUTES } from "@/constants";
import { useApiForm } from "@/hooks";
import { loginSchema, type LoginFormValues } from "@/validation/auth.schema";
import { FormField, PasswordField, SubmitButton, FormError } from "@/components/forms/form-field";

export const LOGIN_VIDE: LoginFormValues = { courriel: "", motDePasse: "" };

export function LoginForm() {
  const [rechercheParams] = useSearchParams();
  const navigation = useNavigate();
  const { connecter } = useAuth();
  const { notifier, chargementInitial } = useSre();
  const retour = rechercheParams.get("retour");
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    erreur,
    definirErreur,
    reinitialiserErreur,
    traiterEchec,
  } = useApiForm<LoginFormValues>({
    schema: loginSchema,
    valeursInitiales: LOGIN_VIDE,
    messageRepli: "Impossible de vérifier la connexion. Réessayez.",
  });

  const soumettre = handleSubmit(async (valeurs) => {
    reinitialiserErreur();
    try {
      const session = await connecter(valeurs.courriel, valeurs.motDePasse);
      if (!session) {
        definirErreur("Identifiants invalides : vérifiez votre adresse e-mail et votre mot de passe.");
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
      const configurationRequise =
        session.changementMotDePasseRequis || !session.profilComplete;
      const destination = configurationRequise
        ? `${cheminRacine}/configuration-initiale`
        : (retourAutorise ?? cheminRacine);
      navigation(destination, { replace: true });
    } catch (cause) {
      traiterEchec(cause);
    }
  });

  return (
    <>
      <h1 className="text-center">Se connecter</h1>
      <p className="text-center">
        Accédez à votre espace contribuable ou au back-office avec votre compte serveur. À la
        première connexion d’un compte créé par l’administration, saisissez le mot de passe
        provisoire reçu pour configurer votre espace.
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
        <PasswordField
          libelle="Mot de passe"
          erreur={errors.motDePasse}
          requis
          autoComplete="current-password"
          placeholder="Votre mot de passe"
          {...register("motDePasse")}
        />
        <div className="champ-label-lien-sre">
          <span aria-hidden="true" />
          <Link to={ROUTES.motDePasseOublie}>Mot de passe oublié ?</Link>
        </div>
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
    </>
  );
}
