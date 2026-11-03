import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import { useAuth, roleHomePath , useSre } from "@/contexts";
import { isApiConfigured } from "@/services/api";
import { ROUTES } from "@/data";
import { useApiForm } from "@/hooks";
import { loginSchema, type LoginFormValues } from "@/schemas";
import { FormField, PasswordField, SubmitButton, FormError, FORM_CLASS } from "@/components";
import { cn } from "@/utils";

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
      const configurationRequired = session.mustChangePassword || !session.isProfileComplete;
      const destination = configurationRequired
        ? `${rootPath}/configuration-initiale`
        : (isReturnPathAllowed ?? rootPath);
      void navigation(destination, { replace: true });
    } catch (cause) {
      handleFailure(cause);
    }
  });

  return (
    <>
      <h1 className="my-[7px] text-[23px] font-[780] tracking-[-0.75px] text-sre-ink text-center">
        Se connecter
      </h1>
      <p className="mb-[17px] mt-0 text-[11px] leading-[1.6] text-pub-muted text-center">
        Accédez à votre espace contribuable ou au back-office avec votre compte serveur. À la
        première connexion d’un compte créé par l’administration, saisissez le mot de passe
        provisoire reçu pour configurer votre espace.
      </p>
      <form onSubmit={onSubmit} className={cn(FORM_CLASS)} noValidate>
        <FormField label="Adresse e-mail" error={errors.courriel} required>
          {(props) => (
            <span className="flex min-h-[39px] items-center gap-2 rounded-[7px] border border-pub-border bg-pub-surface px-[10px] text-pub-muted [&_input]:min-h-[35px] [&_input]:border-0 [&_input]:bg-transparent [&_input]:p-0 [&_input]:outline-none [&_input]:shadow-none">
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
        <div className="flex items-center justify-between gap-2 [&_a]:text-[12px] [&_a]:font-[680] [&_a]:text-sre-teal">
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
