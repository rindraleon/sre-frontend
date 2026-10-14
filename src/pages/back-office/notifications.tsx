import { Bell, Mail, ShieldCheck } from "lucide-react";
import { EntetePageSre, EtatVideSre } from "@/composants/ui/composants-sre";

export function NotificationsAdministrationSre() {
  return (
    <div className="page-contenu-sre">
      <EntetePageSre
        titre="Notifications & e-mails"
        description="Centre de communication administratif."
        filAriane={["Back-office", "Notifications"]}
      />
      <div className="bandeau-info-sre">
        <span>
          <Mail size={17} />
        </span>
        <div>
          <strong>Aucun envoi n’est simulé.</strong>
          <p>
            L’API ne fournit pas encore de service de notification ou de messagerie. Aucun aperçu
            fictif n’est créé.
          </p>
        </div>
      </div>
      <EtatVideSre
        titre="Service de notifications non configuré"
        description="Les alertes et e-mails apparaîtront ici lorsqu’un service backend sera intégré."
      />
      <section className="note-securite-sre">
        <ShieldCheck size={16} />
        <p>
          <strong>État du service</strong>
          <span>Aucune notification n’est générée localement et aucun e-mail n’est envoyé.</span>
        </p>
        <Bell size={15} />
      </section>
    </div>
  );
}
