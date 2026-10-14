import { useMemo, useState, type FormEvent } from "react";
import { Calculator, CirclePlus, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import type { TypeImpotSre, TypeContribuable } from "@/types/sre";
import { utiliserAuthentificationSre } from "@/contexte/contexte-authentification-sre";
import { utiliserSre } from "@/contexte/contexte-sre";
import { appelerApiSre, mapperTypeImpot, type TypeImpotApiSre } from "@/services/api-sre";
import {
  BadgeSre,
  BoutonSre,
  ConfirmationSre,
  EntetePageSre,
  ModalSre,
  TableauSre,
  type ColonneTableauSre,
} from "@/composants/ui/composants-sre";
import { formaterArgent, formaterDate } from "@/utilitaires/formatage";

type FormulaireImpot = Omit<
  Pick<
    TypeImpotSre,
    | "code"
    | "nom"
    | "description"
    | "categorie"
    | "contribuablesConcernes"
    | "periodicite"
    | "regleEcheance"
    | "modeMontant"
    | "montantReference"
    | "champsComplementaires"
  >,
  "contribuablesConcernes" | "periodicite" | "modeMontant"
> & {
  contribuablesConcernes: "TOUS" | TypeContribuable | "";
  periodicite: TypeImpotSre["periodicite"] | "";
  modeMontant: TypeImpotSre["modeMontant"] | "";
};
const formulaireInitial: FormulaireImpot = {
  code: "",
  nom: "",
  description: "",
  categorie: "",
  contribuablesConcernes: "",
  periodicite: "",
  regleEcheance: "",
  modeMontant: "",
  montantReference: null,
  champsComplementaires: [],
};
const libellesPeriodicite: Record<TypeImpotSre["periodicite"], string> = {
  MENSUELLE: "Mensuelle",
  TRIMESTRIELLE: "Trimestrielle",
  ANNUELLE: "Annuelle",
  PONCTUELLE: "Ponctuelle",
};

export function TypesImpotsAdministrationSre() {
  const { etat, mettreAJourEtat, notifier } = utiliserSre();
  const { session } = utiliserAuthentificationSre();
  const [recherche, definirRecherche] = useState("");
  const [page, definirPage] = useState(1);
  const [parPage, definirParPage] = useState(10);
  const [modal, definirModal] = useState(false);
  const [formulaire, definirFormulaire] = useState(formulaireInitial);
  const [typeModifie, definirTypeModifie] = useState<string | null>(null);
  const [erreur, definirErreur] = useState("");
  const [chargement, definirChargement] = useState(false);
  const [cible, definirCible] = useState<TypeImpotSre | null>(null);

  const types = useMemo(
    () =>
      etat.typesImpots.filter((type) =>
        `${type.code} ${type.nom} ${type.categorie} ${type.description}`
          .toLowerCase()
          .includes(recherche.toLowerCase()),
      ),
    [etat.typesImpots, recherche],
  );
  const ouvrirEdition = (type?: TypeImpotSre) => {
    definirErreur("");
    definirTypeModifie(type?.id ?? null);
    definirFormulaire(
      type
        ? {
            code: type.code,
            nom: type.nom,
            description: type.description,
            categorie: type.categorie,
            contribuablesConcernes: type.contribuablesConcernes,
            periodicite: type.periodicite,
            regleEcheance: type.regleEcheance,
            modeMontant: type.modeMontant,
            montantReference: type.montantReference,
            champsComplementaires: type.champsComplementaires,
          }
        : formulaireInitial,
    );
    definirModal(true);
  };
  const modifier = (champ: keyof FormulaireImpot, valeur: string | number | string[] | null) =>
    definirFormulaire((courant) => ({ ...courant, [champ]: valeur }));

  const colonnes: ColonneTableauSre<TypeImpotSre>[] = [
    {
      id: "nom",
      titre: "Type d’impôt",
      afficher: (type) => (
        <div>
          <strong>{type.nom}</strong>
          <small className="sous-ligne-sre">
            {type.code} · {type.description}
          </small>
        </div>
      ),
      valeurTri: (type) => type.nom,
    },
    {
      id: "categorie",
      titre: "Catégorie",
      afficher: (type) => type.categorie,
      valeurTri: (type) => type.categorie,
    },
    {
      id: "concernes",
      titre: "Contribuables concernés",
      afficher: (type) =>
        type.contribuablesConcernes === "TOUS"
          ? "Tous"
          : type.contribuablesConcernes === "ENTREPRISE"
            ? "Entreprises"
            : "Particuliers",
      valeurTri: (type) => type.contribuablesConcernes,
    },
    {
      id: "periodicite",
      titre: "Périodicité",
      afficher: (type) => libellesPeriodicite[type.periodicite],
      valeurTri: (type) => type.periodicite,
    },
    {
      id: "montant",
      titre: "Montant de référence",
      afficher: (type) =>
        type.montantReference == null ? "Non défini" : formaterArgent(type.montantReference),
      valeurTri: (type) => type.montantReference ?? 0,
    },
    {
      id: "statut",
      titre: "Statut",
      afficher: (type) => <BadgeSre statut={type.actif ? "ACTIF" : "INACTIF"} />,
      valeurTri: (type) => String(type.actif),
    },
    {
      id: "date",
      titre: "Modifié le",
      afficher: (type) => formaterDate(type.modifieLe),
      valeurTri: (type) => type.modifieLe,
    },
    {
      id: "action",
      titre: "Actions",
      afficher: (type) => (
        <div className="actions-tableau-sre">
          <BoutonSre variante="fantome" taille="petit" onClick={() => ouvrirEdition(type)}>
            <Pencil size={13} /> Modifier
          </BoutonSre>
          <BoutonSre variante="fantome" taille="petit" onClick={() => definirCible(type)}>
            {type.actif ? (
              <>
                <ToggleRight size={14} /> Désactiver
              </>
            ) : (
              <>
                <ToggleLeft size={14} /> Réactiver
              </>
            )}
          </BoutonSre>
        </div>
      ),
    },
  ];

  const enregistrer = async (event: FormEvent) => {
    event.preventDefault();
    definirErreur("");
    if (!session?.jetonApi) {
      definirErreur("Session serveur introuvable. Reconnectez-vous.");
      return;
    }
    if (
      !formulaire.code.trim() ||
      !formulaire.nom.trim() ||
      !formulaire.description.trim() ||
      !formulaire.categorie.trim() ||
      !formulaire.regleEcheance.trim()
    ) {
      definirErreur(
        "Renseignez le code, le nom, la catégorie, la description et la règle d’échéance validée.",
      );
      return;
    }
    if (!formulaire.contribuablesConcernes || !formulaire.periodicite || !formulaire.modeMontant) {
      definirErreur(
        "Choisissez les contribuables concernés, la périodicité et le mode de montant validés.",
      );
      return;
    }
    if (
      etat.typesImpots.some(
        (type) =>
          type.code.toLowerCase() === formulaire.code.trim().toLowerCase() &&
          type.id !== typeModifie,
      )
    ) {
      definirErreur("Ce code est déjà utilisé.");
      return;
    }
    if (formulaire.modeMontant === "FIXE" && formulaire.montantReference == null) {
      definirErreur("Indiquez le montant de référence confirmé.");
      return;
    }
    definirChargement(true);
    try {
      const corps = {
        ...formulaire,
        periodicite: formulaire.periodicite as TypeImpotSre["periodicite"],
        contribuablesConcernes:
          formulaire.contribuablesConcernes as TypeImpotSre["contribuablesConcernes"],
        modeMontant: formulaire.modeMontant as TypeImpotSre["modeMontant"],
        code: formulaire.code.trim().toUpperCase(),
        nom: formulaire.nom.trim(),
        description: formulaire.description.trim(),
        categorie: formulaire.categorie.trim(),
        regleEcheance: formulaire.regleEcheance.trim(),
        champsComplementaires: formulaire.champsComplementaires
          .map((champ) => champ.trim())
          .filter(Boolean),
      };
      const reponse = await appelerApiSre<TypeImpotApiSre>(
        typeModifie ? `types-impots/${encodeURIComponent(typeModifie)}` : "types-impots",
        { method: typeModifie ? "PATCH" : "POST", token: session.jetonApi, body: corps },
      );
      const typeSauvegarde = mapperTypeImpot(reponse);
      mettreAJourEtat((courant) => ({
        ...courant,
        typesImpots: [
          typeSauvegarde,
          ...courant.typesImpots.filter((type) => type.id !== typeSauvegarde.id),
        ],
      }));
      notifier(
        typeModifie
          ? "Type d’impôt modifié sur le serveur."
          : "Type d’impôt enregistré sur le serveur.",
        "succes",
      );
      definirModal(false);
    } catch (cause) {
      definirErreur(
        cause instanceof Error ? cause.message : "Le serveur n’a pas enregistré le type d’impôt.",
      );
    } finally {
      definirChargement(false);
    }
  };

  const basculer = async () => {
    if (!cible || !session?.jetonApi) return;
    const actif = !cible.actif;
    try {
      const reponse = await appelerApiSre<TypeImpotApiSre>(
        `types-impots/${encodeURIComponent(cible.id)}/activite`,
        { method: "PATCH", token: session.jetonApi, body: { actif } },
      );
      const typeSauvegarde = mapperTypeImpot(reponse);
      mettreAJourEtat((courant) => ({
        ...courant,
        typesImpots: courant.typesImpots.map((type) =>
          type.id === cible.id ? typeSauvegarde : type,
        ),
      }));
      notifier(
        actif
          ? "Type d’impôt réactivé sur le serveur."
          : "Type d’impôt désactivé. L’historique associé est conservé.",
        "succes",
      );
    } catch (cause) {
      notifier(
        cause instanceof Error ? cause.message : "Le serveur n’a pas modifié le statut.",
        "erreur",
      );
    } finally {
      definirCible(null);
    }
  };

  return (
    <div className="page-contenu-sre">
      <EntetePageSre
        titre="Types d’impôts"
        description="Gérez les paramètres fiscaux après validation par l’administration."
        filAriane={["Back-office", "Types d’impôts"]}
        actions={
          <BoutonSre onClick={() => ouvrirEdition()}>
            <CirclePlus size={15} /> Ajouter un type
          </BoutonSre>
        }
      />
      <div className="bandeau-info-sre">
        <span>
          <Calculator size={17} />
        </span>
        <div>
          <strong>Valeurs à saisir après validation par l’administration</strong>
          <p>
            Aucun taux, barème ou calendrier n’est fourni par défaut. Les champs doivent
            correspondre à des règles confirmées avant publication.
          </p>
        </div>
      </div>
      <TableauSre
        lignes={types}
        colonnes={colonnes}
        obtenirId={(type) => type.id}
        recherche={recherche}
        rechercher={definirRecherche}
        placeholder="Code, nom ou catégorie…"
        espaceVide="Aucun type d’impôt"
        messageVide="Les types enregistrés par l’administration apparaîtront ici."
        page={page}
        parPage={parPage}
        changerPage={definirPage}
        changerParPage={definirParPage}
      />
      <ModalSre
        ouvert={modal}
        titre={typeModifie ? "Modifier le type d’impôt" : "Ajouter un type d’impôt"}
        description="Saisissez uniquement des règles fiscales approuvées et applicables."
        fermer={() => definirModal(false)}
        largeur="large"
        pied={
          <>
            <BoutonSre variante="contour" onClick={() => definirModal(false)} disabled={chargement}>
              Annuler
            </BoutonSre>
            <BoutonSre type="submit" form="formulaire-type-impot" disabled={chargement}>
              {chargement ? "Enregistrement…" : "Enregistrer"}
            </BoutonSre>
          </>
        }
      >
        <form
          id="formulaire-type-impot"
          className="formulaire-sre grille-formulaire-sre formulaire-compact-sre"
          onSubmit={enregistrer}
        >
          <label>
            Code
            <input
              className="champ-simple-sre"
              value={formulaire.code}
              onChange={(event) => modifier("code", event.target.value)}
              required
              maxLength={32}
            />
          </label>
          <label>
            Nom du type
            <input
              className="champ-simple-sre"
              value={formulaire.nom}
              onChange={(event) => modifier("nom", event.target.value)}
              required
            />
          </label>
          <label>
            Catégorie
            <input
              className="champ-simple-sre"
              value={formulaire.categorie}
              onChange={(event) => modifier("categorie", event.target.value)}
              required
            />
          </label>
          <label>
            Contribuables concernés
            <select
              className="champ-simple-sre"
              value={formulaire.contribuablesConcernes}
              onChange={(event) =>
                modifier(
                  "contribuablesConcernes",
                  event.target.value as "TOUS" | TypeContribuable | "",
                )
              }
              required
            >
              <option value="" disabled>
                Choisir…
              </option>
              <option value="TOUS">Tous</option>
              <option value="PARTICULIER">Particuliers</option>
              <option value="ENTREPRISE">Entreprises</option>
            </select>
          </label>
          <label>
            Périodicité
            <select
              className="champ-simple-sre"
              value={formulaire.periodicite}
              onChange={(event) =>
                modifier("periodicite", event.target.value as TypeImpotSre["periodicite"] | "")
              }
              required
            >
              <option value="" disabled>
                Choisir…
              </option>
              <option value="MENSUELLE">Mensuelle</option>
              <option value="TRIMESTRIELLE">Trimestrielle</option>
              <option value="ANNUELLE">Annuelle</option>
              <option value="PONCTUELLE">Ponctuelle</option>
            </select>
          </label>
          <label>
            Mode de montant
            <select
              className="champ-simple-sre"
              value={formulaire.modeMontant}
              onChange={(event) =>
                modifier("modeMontant", event.target.value as TypeImpotSre["modeMontant"] | "")
              }
              required
            >
              <option value="" disabled>
                Choisir…
              </option>
              <option value="MANUEL">À renseigner au cas par cas</option>
              <option value="FIXE">Montant de référence fixe</option>
              <option value="CALCULE">Calcul selon une règle validée</option>
            </select>
          </label>
          <label>
            Montant de référence (MGA)
            <input
              className="champ-simple-sre"
              type="number"
              min="0"
              step="1"
              value={formulaire.montantReference ?? ""}
              onChange={(event) =>
                modifier(
                  "montantReference",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
            />
          </label>
          <label>
            Règle d’échéance validée
            <input
              className="champ-simple-sre"
              value={formulaire.regleEcheance}
              onChange={(event) => modifier("regleEcheance", event.target.value)}
              required
            />
          </label>
          <label className="champ-sre-large">
            Description
            <textarea
              className="champ-simple-sre champ-texte-sre"
              rows={2}
              value={formulaire.description}
              onChange={(event) => modifier("description", event.target.value)}
              required
            />
          </label>
          <label className="champ-sre-large">
            Champs complémentaires <small>Séparés par des virgules</small>
            <input
              className="champ-simple-sre"
              value={formulaire.champsComplementaires.join(", ")}
              onChange={(event) => modifier("champsComplementaires", event.target.value.split(","))}
            />
          </label>
          {erreur && (
            <p className="message-erreur-sre champ-sre-large" role="alert">
              {erreur}
            </p>
          )}
        </form>
      </ModalSre>
      <ConfirmationSre
        ouvert={!!cible}
        titre={cible?.actif ? "Désactiver ce type ?" : "Réactiver ce type ?"}
        description={
          cible?.actif
            ? `Le type « ${cible?.nom} » ne sera plus proposé dans les nouvelles opérations. Son historique sera conservé.`
            : `Le type « ${cible?.nom} » sera réactivé.`
        }
        fermer={() => definirCible(null)}
        confirmer={() => void basculer()}
        libelleConfirmer={cible?.actif ? "Désactiver" : "Réactiver"}
        danger={!!cible?.actif}
      />
    </div>
  );
}
