import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { AuthHeader } from "@/components/Layout";
import { LoginForm } from "@/components/AuthComponents";
import { getRegistrationStateApi } from "@/services/auth";
import { ROUTES } from "@/data";

export function LoginPage() {
  const [isAdministratorInitialized, setAdministratorInitialized] = useState<boolean | null>(null);

  useEffect(() => {
    let isActive = true;
    getRegistrationStateApi()
      .then((state) => {
        if (isActive) setAdministratorInitialized(state.administrateurInitialise);
      })
      .catch(() => {
        if (isActive) setAdministratorInitialized(true);
      });
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-pub-surface-alt text-sre-ink bg-[image:radial-gradient(ellipse_at_80%_15%,color-mix(in_srgb,var(--pub-accent-soft)_20%,transparent),transparent_32%)]">
      <AuthHeader
        overline="ACCÈS AUX SERVICES FISCAUX"
        linkLabel="Retour au portail"
        linkPath="/accueil"
      />
      <main className="flex w-full flex-1 items-start justify-center px-5 py-[42px]">
        <section className="w-[min(100%,435px)] rounded-[14px] border border-pub-border bg-pub-glass px-7 py-[26px] shadow-pub-sm">
          <LoginForm />
          <p className="mt-[15px] text-center text-[12px] text-pub-muted">
            Pas encore de compte ?{" "}
            <Link className="font-[750] text-sre-blue" to={ROUTES.registration}>
              Créer un compte
            </Link>
          </p>
          {isAdministratorInitialized === false && (
            <div className="mt-[13px] flex flex-col gap-[5px] border-t border-pub-border-soft pt-[13px] text-center">
              <span className="text-[11px] text-pub-muted-2">
                Aucun administrateur n’existe encore.
              </span>
              <Link
                className="inline-flex items-center justify-center gap-[5px] text-[12px] font-[680] text-pub-accent"
                to={ROUTES.registration}
              >
                <ShieldCheck size={13} /> Créer le premier administrateur <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
