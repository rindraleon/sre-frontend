import { useMemo, useState } from "react";
import { KeyRound, UserRoundCog } from "lucide-react";
import type { UtilisateurSre } from "@/types/sre";
import { utiliserAuthentificationSre } from "@/contexte/contexte-authentification-sre";
import { utiliserSre } from "@/contexte/contexte-sre";
import { appelerApiSre, mapperUtilisateur, type UtilisateurApiSre } from "@/services/api-sre";
import {
  BadgeSre,
  BoutonSre,
  ConfirmationSre,
  EntetePageSre,
  TableauSre,
  type ColonneTableauSre,
} from "@/composants/ui/composants-sre";
import { formaterDate } from "@/utilitaires/formatage";

export function UtilisateursAdministrationSre() {
  const { etat, mettreAJourEtat, notifier } = utiliserSre();
  const { session } = utiliserAuthentificationSre();
  const [recherche, definirRecherche] = useState("");
  const [roleFiltre, definirRoleFiltre] = useState("TOUS");
  const [page, definirPage] = useState(1);
  const [parPage, definirParPage] = useState(10);
  const [compteCible, definirCompteCible] = useState<UtilisateurSre | null>(null);
  const [traitement, definirTraitement] = useState(false);
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

  const colonnes: ColonneTableauSre<UtilisateurSre>[] = [
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
      afficher: (compte) => <BadgeSre statut={compte.role} />,
      valeurTri: (compte) => compte.role,
    },
    {
      id: "statut",
      titre: "Statut",
      afficher: (compte) => <BadgeSre statut={compte.statut} />,
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
      afficher: (compte) => formaterDate(compte.creeLe),
      valeurTri: (compte) => compte.creeLe,
    },
    {
      id: "connexion",
      titre: "Dernière connexion",
      afficher: (compte) => formaterDate(compte.derniereConnexion, true),
      valeurTri: (compte) => compte.derniereConnexion ?? "",
    },
    {
      id: "action",
      titre: "Action",
      afficher: (compte) =>
        compte.id === session?.utilisateurId ? (
          <span className="texte-secondaire-sre">Session actuelle</span>
        ) : (
          <BoutonSre
            taille="petit"
            variante={compte.statut === "ACTIF" ? "danger" : "contour"}
            onClick={() => definirCompteCible(compte)}
          >
            {compte.statut === "ACTIF" ? "Désactiver" : "Réactiver"}
          </BoutonSre>
        ),
    },
  ];

  const confirmerChangementStatut = async () => {
    if (!compteCible || !session?.jetonApi) return;
    const statut = compteCible.statut === "ACTIF" ? "INACTIF" : "ACTIF";
    definirTraitement(true);
    try {
      const reponse = await appelerApiSre<UtilisateurApiSre>(
        `utilisateurs/${encodeURIComponent(compteCible.id)}/statut`,
        { method: "PATCH", token: session.jetonApi, body: { statut } },
      );
      const utilisateurMisAJour = mapperUtilisateur(reponse);
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
      notifier(
        cause instanceof Error ? cause.message : "Le serveur n’a pas modifié le compte.",
        "erreur",
      );
    } finally {
      definirTraitement(false);
    }
  };

  const reactiver = compteCible?.statut !== "ACTIF";
  return (
    <div className="page-contenu-sre">
      <EntetePageSre
        titre="Comptes utilisateurs"
        description="Consultez les comptes et gérez leur statut d’accès."
        filAriane={["Back-office", "Comptes utilisateurs"]}
      />
      <TableauSre
        lignes={utilisateurs}
        colonnes={colonnes}
        obtenirId={(compte) => compte.id}
        recherche={recherche}
        rechercher={definirRecherche}
        placeholder="Nom ou adresse e-mail…"
        actionsEntete={
          <label className="filtre-compact-sre">
            Rôle
            <select
              value={roleFiltre}
              onChange={(event) => {
                definirRoleFiltre(event.target.value);
                definirPage(1);
              }}
            >
              <option value="TOUS">Tous les rôles</option>
              <option value="ADMIN">Administrateurs</option>
              <option value="CLIENT">Contribuables</option>
            </select>
          </label>
        }
        espaceVide="Aucun utilisateur"
        messageVide="Aucun utilisateur ne correspond à votre recherche."
        page={page}
        parPage={parPage}
        changerPage={definirPage}
        changerParPage={definirParPage}
      />
      <ConfirmationSre
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
      />
    </div>
  );
}
