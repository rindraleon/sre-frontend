import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import { useAuth, roleHomePath } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { isApiConfigured } from "@/services/api-client";
import { ROUTES } from "@/constants";
import { useApiForm } from "@/hooks";
import { loginSchema, type LoginFormValues } from "@/validation/auth.schema";
import { FormField, PasswordField, SubmitButton, FormError } from "@/components/forms/form-field";

export const EMPTY_LOGIN: LoginFormValues = { courriel: "", motDePasse: "" };

export function LoginForm() {
  const [searchParams] = useSearchParams();
  const navigation = useNavigate();
  const { logIn } = useAuth();
  const { notify, isInitialLoading } = useSre();
  const returnTo = searchParams.get("retour");
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    error,
    setError,
    resetError,
    handleFailure,
  } = useApiForm<LoginFormValues>({
    schema: loginSchema,
    initialValues: EMPTY_LOGIN,
    fallbackMessage: "Impossible de vérifier la connexion. Réessayez.",
  });

  const onSubmit = handleSubmit(async (values) => {
    resetError();
    try {
      const session = await logIn(values.courriel, values.motDePasse);
      if (!session) {
        setError("Identifiants invalides : vérifiez votre adresse e-mail et votre mot de passe.");
        return;
      }
      notify(
        `Connexion réussie à votre espace ${session.role === "ADMIN" ? "administratif" : "contribuable"}.`,
        "success",
      );
      const rootPath = roleHomePath(session.role);
      const returnPath = returnTo?.split("?")[0] ?? "";
      const isReturnPathAllowed =
        returnTo && (returnPath === rootPath || returnPath.startsWith(`${rootPath}/`))
          ? returnTo
          : null;
      const configurationRequired =
        session.mustChangePassword || !session.isProfileComplete;
      const destination = configurationRequired
        ? `${rootPath}/configuration-initiale`
        : (isReturnPathAllowed ?? rootPath);
      navigation(destination, { replace: true });
    } catch (cause) {
      handleFailure(cause);
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
      <form onSubmit={onSubmit} className="form-sre" noValidate>
        <FormField label="Adresse e-mail" error={errors.courriel} required>
          {(props) => (
            <span className="field-sre field-sre--icon">
              <Mail size={16} aria-hidden="true" />
              <input
                {...props}
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
          label="Mot de passe"
          error={errors.motDePasse}
          required
          autoComplete="current-password"
          placeholder="Votre mot de passe"
          {...register("motDePasse")}
        />
        <div className="field-label-link-sre">
          <span aria-hidden="true" />
          <Link to={ROUTES.forgotPassword}>Mot de passe oublié ?</Link>
        </div>
        <FormError message={error} />
        <SubmitButton
          inProgress={isSubmitting}
          pendingLabel="Vérification…"
          disabled={isInitialLoading || !isApiConfigured}
        >
          {isInitialLoading ? (
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
