import { Link } from "react-router-dom";
import { ArrowRight, KeyRound, MapPinned, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge, PageHeader } from "@/components/ui";
import { ROUTES_ADMIN, SRE_REGION } from "@/constants";

export function AdminSettingsPage() {
  const { session } = useAuth();
  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Paramètres"
        description="Périmètre de service et sécurité du compte administrateur."
        filAriane={["Back-office", "Paramètres"]}
      />
      <section className="carte-sre parametres-region-sre">
        <div className="carte-sre__entete">
          <div>
            <h2>Périmètre de service</h2>
            <p>Ce portail est configuré pour une seule région.</p>
          </div>
          <MapPinned size={18} />
        </div>
        <div className="parametre-region-sre">
          <strong>{SRE_REGION}</strong>
          <StatusBadge statut="ACTIF" />
        </div>
        <p className="texte-aide-sre">
          Les autres régions ne sont pas proposées par l’inscription, les formulaires ou les
          opérations contribuables.
        </p>
      </section>
      <section className="carte-sre parametre-ligne-sre">
        <span>
          <KeyRound size={18} />
        </span>
        <div>
          <h2>Mot de passe</h2>
          <p>
            {session?.changementMotDePasseRequis
              ? "Un changement est requis pour cette session."
              : "Modifiez le mot de passe du compte administrateur."}
          </p>
        </div>
        <Link
          to={ROUTES_ADMIN.changementMotDePasse}
          className="bouton-sre bouton-sre--contour bouton-sre--petit"
        >
          Modifier <ArrowRight size={14} />
        </Link>
      </section>
      <section className="note-securite-sre">
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
