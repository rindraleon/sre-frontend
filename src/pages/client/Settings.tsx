import { Link } from "react-router-dom";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader } from "@/components/ui";
import { EmailVerificationCard } from "@/components/forms/auth/email-verification-card";

export function ClientSettingsPage() {
  const { session } = useAuth();
  const { state } = useSre();
  const account = state.users.find((user) => user.id === session?.userId);
  return (
    <div className="page-content-sre">
      <PageHeader
        title="Paramètres du compte"
        description="Options de sécurité et informations de session."
        breadcrumb={["Accueil", "Paramètres"]}
      />
      <div className="settings-grid-sre">
        <section className="card-sre setting-row-sre">
          <span>
            <KeyRound size={18} />
          </span>
          <div>
            <h2>Mot de passe</h2>
            <p>
              Modifier le mot de passe
              {session?.mustChangePassword ? " · action requise" : ""}.
            </p>
          </div>
          <Link
            className="button-sre button-sre--outline button-sre--small"
            to="/client/changement-mot-de-passe"
          >
            Modifier <ArrowRight size={14} />
          </Link>
        </section>
        {session && (
          <EmailVerificationCard
            email={session.email}
            isEmailVerified={account?.isEmailVerified ?? false}
          />
        )}
        <section className="card-sre setting-row-sre">
          <span>
            <ShieldCheck size={18} />
          </span>
          <div>
            <h2>Confidentialité</h2>
            <p>Votre espace est limité aux données renvoyées pour votre compte par l’API.</p>
          </div>
        </section>
      </div>
      <div className="tax-note-sre">
        <span>i</span>
        <p>
          Les rappels d’échéances sont générés par le serveur (centre de notifications et, si le
          transport e-mail est configuré côté API, par courriel).
        </p>
      </div>
    </div>
  );
}
