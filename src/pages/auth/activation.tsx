import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { AuthHeader } from "@/components/Layout";
import { ActivationForm } from "@/components/AuthComponents";
import { lookupActivationApi } from "@/services/auth";

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
        const information = await lookupActivationApi(token);
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
    <div className="flex min-h-dvh flex-col bg-pub-surface-alt text-sre-ink bg-[image:radial-gradient(ellipse_at_80%_15%,color-mix(in_srgb,var(--pub-accent-soft)_20%,transparent),transparent_32%)]">
      <AuthHeader
        overline="ACTIVATION DE VOTRE ESPACE"
        linkLabel="Connexion"
        linkPath="/connexion"
      />
      <main className="flex w-full flex-1 items-start justify-center px-5 py-[42px]">
        <section className="w-[min(100%,435px)] rounded-[14px] border border-pub-border bg-pub-glass px-7 py-[26px] shadow-pub-sm">
          {state.inProgress && <p className="text-center">Vérification du lien d’activation…</p>}
          {!state.inProgress && state.valid === false && (
            <>
              <h1 className="text-center">Lien d’activation non valide</h1>
              <p className="text-center" role="alert">
                {state.message}
              </p>
              <p className="mt-[15px] text-center text-[12px] text-pub-muted text-center">
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
