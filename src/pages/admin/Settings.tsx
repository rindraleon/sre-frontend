import { Link } from "react-router-dom";
import { ArrowRight, KeyRound, MapPinned, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { StatusBadge, PageHeader } from "@/components/ui";
import { EmailVerificationCard } from "@/components/forms/auth/email-verification-card";
import { ROUTES_ADMIN, SRE_REGION } from "@/constants";

export function AdminSettingsPage() {
  const { session } = useAuth();
  const { state } = useSre();
  const account = state.users.find((user) => user.id === session?.userId);
  return (
    <div className="page-content-sre">
      <PageHeader
        title="Paramètres"
        description="Périmètre de service et sécurité du compte administrateur."
        breadcrumb={["Accueil", "Paramètres"]}
      />
      <section className="card-sre region-settings-sre">
        <div className="card-sre__header">
          <div>
            <h2>Périmètre de service</h2>
            <p>Ce portail est configuré pour une seule région.</p>
          </div>
          <MapPinned size={18} />
        </div>
        <div className="region-setting-sre">
          <strong>{SRE_REGION}</strong>
          <StatusBadge status="ACTIF" />
        </div>
        <p className="text-help-sre">
          Les autres régions ne sont pas proposées par l’inscription, les formulaires ou les
          opérations contribuables.
        </p>
      </section>
      <section className="card-sre setting-row-sre">
        <span>
          <KeyRound size={18} />
        </span>
        <div>
          <h2>Mot de passe</h2>
          <p>
            {session?.mustChangePassword
              ? "Un changement est requis pour cette session."
              : "Modifiez le mot de passe du compte administrateur."}
          </p>
        </div>
        <Link
          to={ROUTES_ADMIN.passwordChange}
          className="button-sre button-sre--outline button-sre--small"
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
      <section className="security-note-sre">
        <ShieldCheck size={16} />
        <p>
          <strong>Configuration serveur</strong>
          <span>
            Les coordonnées institutionnelles, les règles fiscales et les notifications ne sont pas
            modifiables ici faute de routes de configuration backend. Aucune valeur officielle n’est
            préremplie.
          </span>
        </p>
      </section>
    </div>
  );
}
