import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeftRight,
  Bell,
  Building2,
  Calculator,
  ChartNoAxesCombined,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  Gauge,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  UserRound,
  WalletCards,
} from "lucide-react";
import { utiliserAuthentificationSre } from "@/contexte/contexte-authentification-sre";
import { utiliserSre } from "@/contexte/contexte-sre";
import { initiales } from "@/utilitaires/formatage";
import { REGION_SRE } from "@/utilitaires/constantes-sre";
import { ConfirmationSre } from "@/composants/ui/composants-sre";

const menuAdministration = [
  { titre: "Tableau de bord", chemin: "/admin", icone: Gauge },
  { titre: "Contribuables", chemin: "/admin/contribuables", icone: Users },
  { titre: "Entreprises", chemin: "/admin/entreprises", icone: Building2 },
  { titre: "Comptes utilisateurs", chemin: "/admin/utilisateurs", icone: UserRound },
  { titre: "Types d’impôts", chemin: "/admin/types-impots", icone: Calculator },
  { titre: "Obligations fiscales", chemin: "/admin/obligations", icone: FileText },
  {
    titre: "Vérification des paiements",
    chemin: "/admin/paiements-a-verifier",
    icone: ClipboardCheck,
  },
  { titre: "Historique des paiements", chemin: "/admin/paiements", icone: ArrowLeftRight },
  { titre: "Import Excel", chemin: "/admin/import-excel", icone: FileSpreadsheet },
  { titre: "Rapports & statistiques", chemin: "/admin/rapports", icone: ChartNoAxesCombined },
  { titre: "Journal d’activité", chemin: "/admin/journal", icone: Activity },
  { titre: "Paramètres", chemin: "/admin/parametres", icone: Settings },
];
const menuClient = [
  { titre: "Vue d’ensemble", chemin: "/client", icone: Gauge },
  { titre: "Mes impôts", chemin: "/client/obligations", icone: Calculator },
  { titre: "Déclarer un paiement", chemin: "/client/paiements/nouveau", icone: WalletCards },
  { titre: "Historique des paiements", chemin: "/client/paiements", icone: ArrowLeftRight },
  { titre: "Mes reçus", chemin: "/client/documents", icone: FileText },
  { titre: "Notifications", chemin: "/client/notifications", icone: Bell },
  { titre: "Profil fiscal", chemin: "/client/profil", icone: UserRound },
  { titre: "Paramètres", chemin: "/client/parametres", icone: Settings },
];

export function LayoutSre() {
  const emplacement = useLocation();
  const navigation = useNavigate();
  const [menuMobile, definirMenuMobile] = useState(false);
  const [confirmationDeconnexion, definirConfirmationDeconnexion] = useState(false);
  const { session, deconnecter } = utiliserAuthentificationSre();
  const { etat } = utiliserSre();
  if (!session) return null;
  const estAdmin = session.role === "ADMIN";
  const menus = estAdmin ? menuAdministration : menuClient;
  const notificationsNonLues = etat.notifications.filter(
    (notification) =>
      !notification.lue &&
      (estAdmin
        ? notification.roleDestinataire === "ADMIN" ||
          notification.utilisateurId === session.utilisateurId
        : notification.utilisateurId === session.utilisateurId),
  ).length;
  const titrePage =
    menus.find(
      (element) =>
        element.chemin === emplacement.pathname ||
        (element.chemin !== "/admin" &&
          element.chemin !== "/client" &&
          emplacement.pathname.startsWith(`${element.chemin}/`)),
    )?.titre ?? (estAdmin ? "Administration" : "Mon espace contribuable");
  const initialesUtilisateur = initiales(session.nom) || "SRE";
  const seDeconnecter = () => {
    definirConfirmationDeconnexion(false);
    deconnecter();
    navigation("/accueil", { replace: true });
  };

  return (
    <div className="application-sre">
      {menuMobile && (
        <button
          className="voile-menu-sre"
          aria-label="Fermer la navigation"
          onClick={() => definirMenuMobile(false)}
        />
      )}
      <aside className={`barre-laterale-sre ${menuMobile ? "barre-laterale-sre--mobile" : ""}`}>
        <Link
          className="marque-sre"
          to={estAdmin ? "/admin" : "/client"}
          onClick={() => definirMenuMobile(false)}
        >
          <span>
            <ShieldCheck size={21} />
          </span>
          <div>
            <strong>
              SRE<span>·</span>Fiscale
            </strong>
            <small>Service Régional des Impots</small>
          </div>
        </Link>
        <div className="menu-sre__label">{estAdmin ? "GESTION FISCALE" : "MON ESPACE"}</div>
        <nav className="navigation-sre" aria-label="Navigation principale">
          {menus.map(({ titre, chemin, icone: Icone }) => (
            <NavLink
              key={chemin}
              end={chemin === "/admin" || chemin === "/client"}
              to={chemin}
              onClick={() => definirMenuMobile(false)}
              className={({ isActive }) =>
                `navigation-sre__lien ${isActive ? "navigation-sre__lien--actif" : ""}`
              }
            >
              <Icone size={17} />
              <span>{titre}</span>
              {titre === "Vérification des paiements" &&
                etat.paiements.filter((paiement) => paiement.statut === "EN_VERIFICATION").length >
                  0 && (
                  <i>
                    {
                      etat.paiements.filter((paiement) => paiement.statut === "EN_VERIFICATION")
                        .length
                    }
                  </i>
                )}
              {titre === "Mes reçus" &&
                etat.documentsPaiement.filter(
                  (document) =>
                    document.contribuableId === session.contribuableId &&
                    document.statut === "VALIDE",
                ).length > 0 && (
                  <i>
                    {
                      etat.documentsPaiement.filter(
                        (document) =>
                          document.contribuableId === session.contribuableId &&
                          document.statut === "VALIDE",
                      ).length
                    }
                  </i>
                )}
              {titre === "Notifications" && notificationsNonLues > 0 && (
                <i>{notificationsNonLues}</i>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="barre-laterale-sre__pied">
          <button className="deconnexion-sre" onClick={() => definirConfirmationDeconnexion(true)}>
            <LogOut size={15} /> Se déconnecter
          </button>
          <Link className="retour-public-sre" to="/accueil">
            <WalletCards size={14} /> Portail public
          </Link>
        </div>
      </aside>
      <div className="contenu-application-sre">
        <header className="entete-application-sre">
          <div className="entete-application-sre__gauche">
            <button
              className="bouton-menu-sre"
              aria-label="Ouvrir le menu"
              onClick={() => definirMenuMobile(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <span>{estAdmin ? "BACK-OFFICE" : "ESPACE CONTRIBUABLE"}</span>
              <strong>{titrePage}</strong>
            </div>
          </div>
          <div className="entete-application-sre__droite">
            <Link
              className="bouton-notification-sre"
              to={estAdmin ? "/admin/notifications" : "/client/notifications"}
              aria-label={`${notificationsNonLues} notifications non lues`}
            >
              <Bell size={17} />
              {notificationsNonLues > 0 && <i>{notificationsNonLues}</i>}
            </Link>
            <div className="entete-session-sre">
              <span>{initialesUtilisateur}</span>
              <div>
                <strong>{session.nom}</strong>
                <small>{estAdmin ? "Administrateur" : "Contribuable"}</small>
              </div>
            </div>
          </div>
        </header>
        <main className="zone-contenu-sre">
          <Outlet />
        </main>
        <footer className="pied-application-sre">
          <span>Service régional · {REGION_SRE}</span>
          <span>
            <ShieldCheck size={13} /> Aucune opération financière n’est exécutée
          </span>
        </footer>
      </div>
      <ConfirmationSre
        ouvert={confirmationDeconnexion}
        titre="Se déconnecter ?"
        description="Votre session sera fermée sur cet appareil. Vous devrez vous authentifier à nouveau pour accéder à votre espace."
        fermer={() => definirConfirmationDeconnexion(false)}
        confirmer={seDeconnecter}
        libelleConfirmer="Se déconnecter"
      />
    </div>
  );
}
