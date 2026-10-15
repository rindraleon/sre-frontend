import { Activity } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui";

export function AdminActivityLogPage() {
  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Journal d’activité"
        description="Consultez les événements d’audit lorsqu’ils seront exposés par le backend."
        filAriane={["Back-office", "Journal d’activité"]}
      />
      <div className="bandeau-info-sre">
        <span>
          <Activity size={17} />
        </span>
        <div>
          <strong>Journal serveur non disponible</strong>
          <p>Le navigateur ne produit ni ne conserve de trace présentée comme un audit officiel.</p>
        </div>
      </div>
      <EmptyState
        titre="Aucun journal consultable"
        description="Aucune route d’audit n’est actuellement exposée par l’API. Les actions réelles restent traitées par les services backend disponibles."
      />
    </div>
  );
}
