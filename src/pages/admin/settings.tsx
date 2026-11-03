import { cn } from "@/utils";
import { Link } from "react-router-dom";
import { ArrowRight, KeyRound, MapPinned, ShieldCheck } from "lucide-react";
import { EmailVerificationCard } from "@/components/AuthComponents";
import { useAuth } from "@/contexts";
import { useSre } from "@/contexts";
import {
  CARD_CLASS,
  CARD_HEADER_CLASS,
  PAGE_CONTENT_CLASS,
  PageHeader,
  SECURITY_NOTE_CLASS,
  SETTING_ROW_CLASS,
  StatusBadge,
  TEXT_HELP_CLASS,
  buttonVariants,
} from "@/components";
import { ROUTES_ADMIN, SRE_REGION } from "@/data";

export function AdminSettingsPage() {
  const { session } = useAuth();
  const { state } = useSre();
  const account = state.users.find((user) => user.id === session?.userId);
  return (
    <div className={PAGE_CONTENT_CLASS}>
      <PageHeader
        title="Paramètres"
        description="Périmètre de service et sécurité du compte administrateur."
        breadcrumb={["Accueil", "Paramètres"]}
      />
      <section className={cn(CARD_CLASS, "")}>
        <div className={CARD_HEADER_CLASS}>
          <div>
            <h2>Périmètre de service</h2>
            <p>Ce portail est configuré pour une seule région.</p>
          </div>
          <MapPinned size={18} />
        </div>
        <div className="">
          <strong>{SRE_REGION}</strong>
          <StatusBadge status="ACTIF" />
        </div>
        <p className={TEXT_HELP_CLASS}>
          Les autres régions ne sont pas proposées par l’inscription, les formulaires ou les
          opérations contribuables.
        </p>
      </section>
      <section className={cn(CARD_CLASS, SETTING_ROW_CLASS)}>
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
          className={buttonVariants({ variant: "outline", size: "small" })}
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
      <section className={SECURITY_NOTE_CLASS}>
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
