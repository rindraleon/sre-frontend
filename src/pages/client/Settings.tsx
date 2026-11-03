import { cn } from "@/utils";
import { Link } from "react-router-dom";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { EmailVerificationCard } from "@/components/AuthComponents";
import { useAuth } from "@/contexts";
import { useSre } from "@/contexts";
import {
  CARD_CLASS,
  PAGE_CONTENT_CLASS,
  PageHeader,
  SETTINGS_GRID_CLASS,
  SETTING_ROW_CLASS,
  TAX_NOTE_CLASS,
  buttonVariants,
} from "@/components";

export function ClientSettingsPage() {
  const { session } = useAuth();
  const { state } = useSre();
  const account = state.users.find((user) => user.id === session?.userId);
  return (
    <div className={PAGE_CONTENT_CLASS}>
      <PageHeader
        title="Paramètres du compte"
        description="Options de sécurité et informations de session."
        breadcrumb={["Accueil", "Paramètres"]}
      />
      <div className={SETTINGS_GRID_CLASS}>
        <section className={cn(CARD_CLASS, SETTING_ROW_CLASS)}>
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
            className={buttonVariants({ variant: "outline", size: "small" })}
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
        <section className={cn(CARD_CLASS, SETTING_ROW_CLASS)}>
          <span>
            <ShieldCheck size={18} />
          </span>
          <div>
            <h2>Confidentialité</h2>
            <p>Votre espace est limité aux données renvoyées pour votre compte par l’API.</p>
          </div>
        </section>
      </div>
      <div className={TAX_NOTE_CLASS}>
        <span>i</span>
        <p>
          Les rappels d’échéances sont générés par le serveur (centre de notifications et, si le
          transport e-mail est configuré côté API, par courriel).
        </p>
      </div>
    </div>
  );
}
