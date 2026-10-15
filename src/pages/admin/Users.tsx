import { Select } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { KeyRound, UserRoundCog } from "lucide-react";
import type { AppUser } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi, mapApiUser, type ApiUser } from "@/services/api-client";
import {
  StatusBadge,
  Button,
  ConfirmDialog,
  PageHeader,
  DataTable,
  type TableColumn,
} from "@/components/ui";
import { formatDate } from "@/utils/format";

export function AdminUsersPage() {
  const { etat, mettreAJourEtat, notifier } = useSre();
  const { session } = useAuth();
  const [recherche, definirRecherche] = useState("");
  const [roleFiltre, definirRoleFiltre] = useState("TOUS");
  const [page, definirPage] = useState(1);
  const [parPage, definirParPage] = useState(10);
  const [compteCible, definirCompteCible] = useState<AppUser | null>(null);
  const [traitement, definirTraitement] = useState(false);
  const [erreurAction, definirErreurAction] = useState("");
  const utilisateurs = useMemo(
    () =>
      etat.utilisateurs.filter(
        (compte) =>
          (roleFiltre === "TOUS" || compte.role === roleFiltre) &&
          `${compte.nom} ${compte.courriel} ${compte.role}`
            .toLowerCase()
            .includes(recherche.toLowerCase()),
      ),
    [etat.utilisateurs, roleFiltre, recherche],
  );

  const colonnes: TableColumn<AppUser>[] = [
    {
      id: "compte",
      titre: "Utilisateur",
      afficher: (compte) => (
        <div className="lien-identite-tableau-sre">
          <span className="avatar-ligne-sre">
            <UserRoundCog size={15} />
          </span>
          <span>
            <strong>{compte.nom}</strong>
            <small>{compte.courriel}</small>
          </span>
        </div>
      ),
      valeurTri: (compte) => compte.nom,
    },
    {
      id: "role",
      titre: "Rôle",
      afficher: (compte) => <StatusBadge statut={compte.role} />,
      valeurTri: (compte) => compte.role,
    },
    {
      id: "statut",
      titre: "Statut",
      afficher: (compte) => <StatusBadge statut={compte.statut} />,
      valeurTri: (compte) => compte.statut,
    },
    {
      id: "mdp",
      titre: "Sécurité",
      afficher: (compte) =>
        compte.changementMotDePasseRequis ? (
          <span className="texte-attention-sre">
            <KeyRound size={13} /> Changement requis
          </span>
        ) : (
          <span className="texte-succes-sre">Mot de passe défini</span>
        ),
    },
    {
      id: "cree",
      titre: "Créé le",
      afficher: (compte) => formatDate(compte.creeLe),
      valeurTri: (compte) => compte.creeLe,
    },
    {
      id: "connexion",
      titre: "Dernière connexion",
      afficher: (compte) => formatDate(compte.derniereConnexion, true),
      valeurTri: (compte) => compte.derniereConnexion ?? "",
    },
    {
      id: "action",
      titre: "Action",
      afficher: (compte) =>
        compte.id === session?.utilisateurId ? (
          <span className="texte-secondaire-sre">Session actuelle</span>
        ) : (
          <Button
            taille="petit"
            variante={compte.statut === "ACTIF" ? "danger" : "contour"}
            onClick={() => definirCompteCible(compte)}
          >
            {compte.statut === "ACTIF" ? "Désactiver" : "Réactiver"}
          </Button>
        ),
    },
  ];

  const confirmerChangementStatut = async () => {
    if (!compteCible || !session?.jetonApi) return;
    const statut = compteCible.statut === "ACTIF" ? "INACTIF" : "ACTIF";
    definirErreurAction("");
    definirTraitement(true);
    try {
      const reponse = await callApi<ApiUser>(
        `utilisateurs/${encodeURIComponent(compteCible.id)}/statut`,
        { method: "PATCH", token: session.jetonApi, body: { statut } },
      );
      const utilisateurMisAJour = mapApiUser(reponse);
      mettreAJourEtat((courant) => ({
        ...courant,
        utilisateurs: courant.utilisateurs.map((compte) =>
          compte.id === utilisateurMisAJour.id ? utilisateurMisAJour : compte,
        ),
        contribuables: courant.contribuables.map((contribuable) =>
          contribuable.utilisateurId === utilisateurMisAJour.id
            ? { ...contribuable, statut: utilisateurMisAJour.statut }
            : contribuable,
        ),
      }));
      notifier(
        statut === "ACTIF"
          ? "Compte réactivé sur le serveur."
          : "Compte désactivé sur le serveur. Les données sont conservées.",
        "succes",
      );
      definirCompteCible(null);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Le serveur n’a pas modifié le compte.";
      definirErreurAction(message);
      notifier(message, "erreur");
    } finally {
      definirTraitement(false);
    }
  };

  const reactiver = compteCible?.statut !== "ACTIF";
  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Comptes utilisateurs"
        description="Consultez les comptes et gérez leur statut d’accès."
        filAriane={["Back-office", "Comptes utilisateurs"]}
      />
      <DataTable
        lignes={utilisateurs}
        colonnes={colonnes}
        obtenirId={(compte) => compte.id}
        recherche={recherche}
        rechercher={definirRecherche}
        placeholder="Nom ou adresse e-mail…"
        actionsEntete={
          <label className="filtre-compact-sre">
            Rôle
            <Select
              value={roleFiltre}
              onChange={(event) => {
                definirRoleFiltre(event.target.value);
                definirPage(1);
              }}
            >
              <option value="TOUS">Tous les rôles</option>
              <option value="ADMIN">Administrateurs</option>
              <option value="CLIENT">Contribuables</option>
            </Select>
          </label>
        }
        espaceVide="Aucun utilisateur"
        messageVide="Aucun utilisateur ne correspond à votre recherche."
        page={page}
        parPage={parPage}
        changerPage={definirPage}
        changerParPage={definirParPage}
      />
      <ConfirmDialog
        ouvert={!!compteCible}
        titre={reactiver ? "Réactiver ce compte ?" : "Désactiver ce compte ?"}
        description={
          reactiver
            ? `L’accès de ${compteCible?.nom} sera réactivé sur le serveur.`
            : `L’accès de ${compteCible?.nom} sera suspendu. Les données associées seront conservées. Le dernier administrateur actif ne peut pas être désactivé.`
        }
        fermer={() => definirCompteCible(null)}
        confirmer={() => void confirmerChangementStatut()}
        libelleConfirmer={reactiver ? "Réactiver le compte" : "Désactiver le compte"}
        danger={!reactiver}
        chargement={traitement}
        erreur={erreurAction}
      />
    </div>
  );
}
