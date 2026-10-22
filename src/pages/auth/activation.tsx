import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { AuthHeader } from "@/components/layout/auth-header";
import { ActivationForm } from "@/components/forms/auth/activation-form";
import { callApi } from "@/services/api-client";

interface ActivationState {
  inProgress: boolean;
  valid: boolean | null;
  message: string;
  maskedEmail?: string;
  name?: string;
  expiresAt?: string;
}


export function ActivationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("jeton") ?? "";
  const [state, setState] = useState<ActivationState>({
    inProgress: true,
    valid: null,
    message: "Vérification du lien d’activation…",
  });

  useEffect(() => {
    let isActive = true;
    const verify = async () => {
      if (!token) {
        setState({
          inProgress: false,
          valid: false,
          message: "Lien d’activation incomplet : aucun jeton fourni.",
        });
        return;
      }
      try {
        const information = await callApi<{
          valide: boolean;
          courrielMasque: string;
          nom: string;
          expireLe: string;
        }>(`auth/activation/${encodeURIComponent(token)}`);
        if (!isActive) return;
        setState({
          inProgress: false,
          valid: true,
          message: "Lien d’activation valide.",
          maskedEmail: information.courrielMasque,
          name: information.nom,
          expiresAt: information.expireLe,
        });
      } catch (cause) {
        if (!isActive) return;
        setState({
          inProgress: false,
          valid: false,
          message:
            cause instanceof Error
              ? cause.message
              : "Lien d’activation invalide, déjà utilisé ou expiré.",
        });
      }
    };
    void verify();
    return () => {
      isActive = false;
    };
  }, [token]);

  return (
    <div className="page-auth-sre">
      <AuthHeader overline="ACTIVATION DE VOTRE ESPACE" linkLabel="Connexion" linkPath="/connexion" />
      <main className="auth-frame-sre">
        <section className="auth-card-sre">
          {state.inProgress && (
            <p className="text-center">Vérification du lien d’activation…</p>
          )}
          {!state.inProgress && state.valid === false && (
            <>
              <h1 className="text-center">Lien d’activation non valide</h1>
              <p className="text-center" role="alert">
                {state.message}
              </p>
              <p className="auth-link-secondary-sre text-center">
                Demandez un nouveau lien à votre administration, ou{" "}
                <Link to="/connexion">connectez-vous avec votre mot de passe provisoire</Link>.
              </p>
            </>
          )}
          {!state.inProgress && state.valid === true && (
            <>
              <p className="text-center">
                <ShieldCheck size={16} aria-hidden="true" /> Bonjour {state.name || "…"} — compte{" "}
                {state.maskedEmail}
              </p>
              <ActivationForm />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
