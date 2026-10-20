import { Link } from "react-router-dom";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader } from "@/components/ui";
import { EmailVerificationCard } from "@/components/forms/auth/email-verification-card";

export function ClientSettingsPage() {
  const { session } = useAuth();
  const { etat } = useSre();
  const compte = etat.utilisateurs.find((utilisateur) => utilisateur.id === session?.utilisateurId);
  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Paramètres du compte"
        description="Options de sécurité et informations de session."
        filAriane={["Accueil", "Paramètres"]}
      />
      <div className="grille-parametres-sre">
        <section className="carte-sre parametre-ligne-sre">
          <span>
            <KeyRound size={18} />
          </span>
          <div>
            <h2>Mot de passe</h2>
            <p>
              Modifier le mot de passe
              {session?.changementMotDePasseRequis ? " · action requise" : ""}.
            </p>
          </div>
          <Link
            className="bouton-sre bouton-sre--contour bouton-sre--petit"
            to="/client/changement-mot-de-passe"
          >
            Modifier <ArrowRight size={14} />
          </Link>
        </section>
        {session && (
          <EmailVerificationCard
            courriel={session.courriel}
            courrielVerifie={compte?.courrielVerifie ?? false}
          />
        )}
        <section className="carte-sre parametre-ligne-sre">
          <span>
            <ShieldCheck size={18} />
          </span>
          <div>
            <h2>Confidentialité</h2>
            <p>Votre espace est limité aux données renvoyées pour votre compte par l’API.</p>
          </div>
        </section>
      </div>
      <div className="note-fiscale-sre">
        <span>i</span>
        <p>
          Les rappels d’échéances sont générés par le serveur (centre de notifications et, si le
          transport e-mail est configuré côté API, par courriel).
        </p>
      </div>
    </div>
  );
}
