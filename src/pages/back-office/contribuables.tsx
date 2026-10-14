import { useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, CirclePlus, Trash2, UserRound } from "lucide-react";
import type { ContribuableSre, ProfilInscriptionSre, TypeContribuable } from "@/types/sre";
import { utiliserAuthentificationSre } from "@/contexte/contexte-authentification-sre";
import { utiliserSre } from "@/contexte/contexte-sre";
import { appelerApiSre, mapperContribuable, type ContribuableApiSre } from "@/services/api-sre";
import { REGION_SRE } from "@/utilitaires/constantes-sre";
import {
  BadgeSre,
  BoutonSre,
  ConfirmationSre,
  EntetePageSre,
  EtatVideSre,
  ModalSre,
  TableauSre,
  type ColonneTableauSre,
} from "@/composants/ui/composants-sre";
import { formaterDate } from "@/utilitaires/formatage";

const profilVide: ProfilInscriptionSre = {
  nom: "",
  prenom: "",
  type: "PARTICULIER",
  raisonSociale: "",
  nomCommercial: "",
  nif: "",
  stat: "",
  adresse: "",
  region: REGION_SRE,
  ville: "",
  courriel: "",
  telephone: "",
  representantLegal: "",
  nomContact: "",
  prenomContact: "",
  fonctionContact: "",
};

export function ContribuablesAdministrationSre({
  typeInitial = "TOUS",
}: { typeInitial?: "TOUS" | "ENTREPRISE" } = {}) {
  const { etat, mettreAJourEtat, notifier } = utiliserSre();
  const { session } = utiliserAuthentificationSre();
  const [recherche, definirRecherche] = useState("");
  const [typeFiltre, definirTypeFiltre] = useState<string>(typeInitial);
  const [page, definirPage] = useState(1);
  const [parPage, definirParPage] = useState(10);
  const [modal, definirModal] = useState(false);
  const [profil, definirProfil] = useState(profilVide);
  const [erreur, definirErreur] = useState("");
  const [chargement, definirChargement] = useState(false);
  const [cibleSuppression, definirCibleSuppression] = useState<ContribuableSre | null>(null);
  const [suppressionEnCours, definirSuppressionEnCours] = useState(false);

  const contribuables = useMemo(
    () =>
      etat.contribuables.filter(
        (contribuable) =>
          (typeFiltre === "TOUS" || contribuable.type === typeFiltre) &&
          `${contribuable.nom} ${contribuable.prenom ?? ""} ${contribuable.raisonSociale ?? ""} ${contribuable.nif} ${contribuable.stat ?? ""} ${contribuable.courriel}`
            .toLowerCase()
            .includes(recherche.toLowerCase()),
      ),
    [etat.contribuables, recherche, typeFiltre],
  );

  const colonnes: ColonneTableauSre<ContribuableSre>[] = [
    {
      id: "nom",
      titre: "Contribuable",
      afficher: (entree) => (
        <Link className="lien-identite-tableau-sre" to={`/admin/contribuables/${entree.id}`}>
          <span className="avatar-ligne-sre">
            {entree.type === "ENTREPRISE" ? <Building2 size={15} /> : <UserRound size={15} />}
          </span>
          <span>
            <strong>{entree.raisonSociale || `${entree.prenom ?? ""} ${entree.nom}`.trim()}</strong>
            <small>{entree.courriel}</small>
          </span>
        </Link>
      ),
      valeurTri: (entree) => entree.raisonSociale || `${entree.prenom ?? ""} ${entree.nom}`,
    },
    {
      id: "type",
      titre: "Type",
      afficher: (entree) => <BadgeSre statut={entree.type} />,
      valeurTri: (entree) => entree.type,
    },
    {
      id: "nif",
      titre: "NIF",
      afficher: (entree) => entree.nif || "—",
      valeurTri: (entree) => entree.nif,
    },
    {
      id: "stat",
      titre: "STAT",
      afficher: (entree) => entree.stat || "—",
      valeurTri: (entree) => entree.stat ?? "",
    },
    {
      id: "region",
      titre: "Localisation",
      afficher: (entree) => (
        <>
          {entree.ville}
          <small className="sous-ligne-sre">{entree.region}</small>
        </>
      ),
      valeurTri: (entree) => entree.region,
    },
    {
      id: "statut",
      titre: "Compte",
      afficher: (entree) => <BadgeSre statut={entree.statut ?? "SANS_COMPTE"} />,
      valeurTri: (entree) => entree.statut ?? "SANS_COMPTE",
    },
    {
      id: "cree",
      titre: "Créé le",
      afficher: (entree) => formaterDate(entree.dateCreationCompte),
      valeurTri: (entree) => entree.dateCreationCompte,
    },
    {
      id: "action",
      titre: "Actions",
      afficher: (entree) => (
        <div className="actions-tableau-sre">
          <Link className="lien-action-sre" to={`/admin/contribuables/${entree.id}`}>
            Voir <ArrowRight size={13} />
          </Link>
          <BoutonSre
            taille="petit"
            variante="fantome"
            aria-label={`Supprimer le profil ${entree.raisonSociale || entree.nom}`}
            onClick={() => definirCibleSuppression(entree)}
          >
            <Trash2 size={14} />
          </BoutonSre>
        </div>
      ),
    },
  ];

  const mettreAJourProfil = (champ: keyof ProfilInscriptionSre, valeur: string) =>
    definirProfil((courant) => ({ ...courant, [champ]: valeur }));
  const fermer = () => {
    definirModal(false);
    definirProfil(profilVide);
    definirErreur("");
    definirChargement(false);
  };

  const creer = async (event: FormEvent) => {
    event.preventDefault();
    definirErreur("");
    if (!session?.jetonApi) {
      definirErreur("Session serveur introuvable. Reconnectez-vous puis réessayez.");
      return;
    }
    if (profil.type === "ENTREPRISE" && !profil.raisonSociale?.trim()) {
      definirErreur("La raison sociale est requise.");
      return;
    }
    if (profil.type === "PARTICULIER" && !profil.nom.trim()) {
      definirErreur("Le nom est requis.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profil.courriel.trim())) {
      definirErreur("Adresse e-mail invalide.");
      return;
    }
    if (!profil.adresse.trim() || !profil.ville.trim()) {
      definirErreur("Renseignez l’adresse et la ville/commune.");
      return;
    }
    if (profil.telephone.trim().length < 7) {
      definirErreur("Saisissez un numéro de téléphone valide.");
      return;
    }
    definirChargement(true);
    try {
      const corps = {
        type: profil.type,
        nom: profil.nom.trim() || profil.raisonSociale?.trim() || "",
        ...(profil.prenom?.trim() ? { prenom: profil.prenom.trim() } : {}),
        ...(profil.raisonSociale?.trim() ? { raisonSociale: profil.raisonSociale.trim() } : {}),
        ...(profil.nomCommercial?.trim() ? { nomCommercial: profil.nomCommercial.trim() } : {}),
        ...(profil.nif.trim() ? { nif: profil.nif.trim() } : {}),
        ...(profil.stat?.trim() ? { stat: profil.stat.trim() } : {}),
        adresse: profil.adresse.trim(),
        region: REGION_SRE,
        ville: profil.ville.trim(),
        courriel: profil.courriel.trim().toLowerCase(),
        telephone: profil.telephone.trim(),
        ...(profil.representantLegal?.trim()
          ? { representantLegal: profil.representantLegal.trim() }
          : {}),
        ...(profil.nomContact?.trim() ? { nomContact: profil.nomContact.trim() } : {}),
        ...(profil.prenomContact?.trim() ? { prenomContact: profil.prenomContact.trim() } : {}),
        ...(profil.fonctionContact?.trim()
          ? { fonctionContact: profil.fonctionContact.trim() }
          : {}),
      };
      const reponse = await appelerApiSre<ContribuableApiSre>("contribuables", {
        method: "POST",
        token: session.jetonApi,
        body: corps,
      });
      const nouveau = mapperContribuable(reponse);
      mettreAJourEtat((courant) => ({
        ...courant,
        contribuables: [nouveau, ...courant.contribuables],
      }));
      notifier("Profil contribuable enregistré.", "succes");
      fermer();
    } catch (cause) {
      definirErreur(
        cause instanceof Error ? cause.message : "Le serveur n’a pas enregistré le profil.",
      );
    } finally {
      definirChargement(false);
    }
  };

  const supprimer = async () => {
    if (!cibleSuppression || !session?.jetonApi) return;
    definirSuppressionEnCours(true);
    try {
      await appelerApiSre<{ message: string }>(
        `contribuables/${encodeURIComponent(cibleSuppression.id)}`,
        { method: "DELETE", token: session.jetonApi },
      );
      const id = cibleSuppression.id;
      mettreAJourEtat((courant) => ({
        ...courant,
        contribuables: courant.contribuables.filter((entree) => entree.id !== id),
      }));
      notifier("Profil contribuable supprimé.", "succes");
      definirCibleSuppression(null);
    } catch (cause) {
      notifier(
        cause instanceof Error ? cause.message : "Suppression refusée par le serveur.",
        "erreur",
      );
    } finally {
      definirSuppressionEnCours(false);
    }
  };

  return (
    <div className="page-contenu-sre">
      <EntetePageSre
        titre={typeInitial === "ENTREPRISE" ? "Entreprises" : "Contribuables"}
        description={`Profils du périmètre ${REGION_SRE}. Un profil n’est pas un compte utilisateur.`}
        filAriane={["Back-office", typeInitial === "ENTREPRISE" ? "Entreprises" : "Contribuables"]}
        actions={
          <BoutonSre
            onClick={() => {
              definirModal(true);
              definirErreur("");
            }}
          >
            <CirclePlus size={15} /> Ajouter un profil
          </BoutonSre>
        }
      />
      <div className="bandeau-info-sre">
        <span>
          <Building2 size={17} />
        </span>
        <div>
          <strong>
            {contribuables.length} profil{contribuables.length === 1 ? "" : "s"} ·{" "}
            {contribuables.filter((e) => e.type === "ENTREPRISE").length} entreprise(s)
          </strong>
          <p>
            Les profils sont enregistrés par le serveur. Ils ne créent ni compte, ni accès, ni mot
            de passe.
          </p>
        </div>
      </div>
      <TableauSre
        lignes={contribuables}
        colonnes={colonnes}
        obtenirId={(entree) => entree.id}
        recherche={recherche}
        rechercher={definirRecherche}
        placeholder="Nom, NIF, STAT ou e-mail…"
        actionsEntete={
          <label className="filtre-compact-sre">
            Type
            <select
              value={typeFiltre}
              onChange={(event) => {
                definirTypeFiltre(event.target.value);
                definirPage(1);
              }}
            >
              <option value="TOUS">Tous</option>
              <option value="PARTICULIER">Particuliers</option>
              <option value="ENTREPRISE">Entreprises</option>
            </select>
          </label>
        }
        espaceVide="Aucun contribuable"
        messageVide="Aucun profil ne correspond à votre recherche."
        page={page}
        parPage={parPage}
        changerPage={definirPage}
        changerParPage={definirParPage}
      />

      <ModalSre
        ouvert={modal}
        titre="Ajouter un profil contribuable"
        description={`Dossier rattaché à ${REGION_SRE}. Aucun compte ou mot de passe ne sera créé.`}
        fermer={fermer}
        largeur="large"
        pied={
          <>
            <BoutonSre variante="contour" onClick={fermer} disabled={chargement}>
              Annuler
            </BoutonSre>
            <BoutonSre type="submit" form="formulaire-contribuable-admin" disabled={chargement}>
              {chargement ? "Enregistrement…" : "Enregistrer le profil"}
            </BoutonSre>
          </>
        }
      >
        <form
          id="formulaire-contribuable-admin"
          onSubmit={creer}
          className="formulaire-sre grille-formulaire-sre formulaire-compact-sre"
        >
          <label>
            Type
            <select
              className="champ-simple-sre"
              value={profil.type}
              onChange={(event) =>
                mettreAJourProfil("type", event.target.value as TypeContribuable)
              }
            >
              <option value="PARTICULIER">Particulier</option>
              <option value="ENTREPRISE">Entreprise</option>
            </select>
          </label>
          {profil.type === "ENTREPRISE" ? (
            <>
              <label>
                Raison sociale
                <input
                  className="champ-simple-sre"
                  value={profil.raisonSociale}
                  onChange={(event) => mettreAJourProfil("raisonSociale", event.target.value)}
                  required
                />
              </label>
              <label>
                Nom commercial <small>Facultatif</small>
                <input
                  className="champ-simple-sre"
                  value={profil.nomCommercial}
                  onChange={(event) => mettreAJourProfil("nomCommercial", event.target.value)}
                />
              </label>
              <label>
                NIF <small>Facultatif</small>
                <input
                  className="champ-simple-sre"
                  value={profil.nif}
                  onChange={(event) => mettreAJourProfil("nif", event.target.value)}
                />
              </label>
              <label>
                STAT <small>Facultatif</small>
                <input
                  className="champ-simple-sre"
                  value={profil.stat}
                  onChange={(event) => mettreAJourProfil("stat", event.target.value)}
                />
              </label>
              <label className="champ-sre-large">
                Représentant légal <small>Facultatif</small>
                <input
                  className="champ-simple-sre"
                  value={profil.representantLegal}
                  onChange={(event) => mettreAJourProfil("representantLegal", event.target.value)}
                />
              </label>
            </>
          ) : (
            <>
              <label>
                Nom
                <input
                  className="champ-simple-sre"
                  value={profil.nom}
                  onChange={(event) => mettreAJourProfil("nom", event.target.value)}
                  required
                />
              </label>
              <label>
                Prénom
                <input
                  className="champ-simple-sre"
                  value={profil.prenom}
                  onChange={(event) => mettreAJourProfil("prenom", event.target.value)}
                />
              </label>
              <label>
                NIF <small>Facultatif</small>
                <input
                  className="champ-simple-sre"
                  value={profil.nif}
                  onChange={(event) => mettreAJourProfil("nif", event.target.value)}
                />
              </label>
            </>
          )}
          <label>
            Adresse e-mail
            <input
              className="champ-simple-sre"
              type="email"
              value={profil.courriel}
              onChange={(event) => mettreAJourProfil("courriel", event.target.value)}
              required
            />
          </label>
          <label>
            Téléphone
            <input
              className="champ-simple-sre"
              type="tel"
              value={profil.telephone}
              onChange={(event) => mettreAJourProfil("telephone", event.target.value)}
              required
            />
          </label>
          <label className="champ-sre-large">
            Adresse
            <input
              className="champ-simple-sre"
              value={profil.adresse}
              onChange={(event) => mettreAJourProfil("adresse", event.target.value)}
              required
            />
          </label>
          <label>
            Région
            <input className="champ-simple-sre" value={REGION_SRE} readOnly />
          </label>
          <label>
            Ville / Commune
            <input
              className="champ-simple-sre"
              value={profil.ville}
              onChange={(event) => mettreAJourProfil("ville", event.target.value)}
              required
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
        ouvert={!!cibleSuppression}
        titre="Supprimer ce profil ?"
        description={`Le profil « ${cibleSuppression?.raisonSociale || `${cibleSuppression?.prenom ?? ""} ${cibleSuppression?.nom ?? ""}`.trim()} » sera supprimé définitivement si aucun compte, paiement ou historique fiscal ne lui est lié. Cette action est irréversible.`}
        fermer={() => definirCibleSuppression(null)}
        confirmer={supprimer}
        libelleConfirmer="Supprimer le profil"
        danger
        chargement={suppressionEnCours}
      />
    </div>
  );
}

export function EntreprisesAdministrationSre() {
  return <ContribuablesAdministrationSre typeInitial="ENTREPRISE" />;
}

export function DetailContribuableAdministrationSre() {
  const { id } = useParams();
  const { etat } = utiliserSre();
  const contribuable = etat.contribuables.find((entree) => entree.id === id);
  if (!contribuable)
    return (
      <div className="page-contenu-sre">
        <EntetePageSre
          titre="Contribuable introuvable"
          filAriane={["Back-office", "Contribuables"]}
        />
        <EtatVideSre
          titre="Profil non trouvé"
          description="Ce profil n’existe pas dans les données accessibles à votre session."
          action={
            <Link to="/admin/contribuables" className="bouton-sre bouton-sre--contour">
              <ArrowLeft size={14} /> Retour à la liste
            </Link>
          }
        />
      </div>
    );
  const utilisateur = etat.utilisateurs.find((compte) => compte.id === contribuable.utilisateurId);
  const obligations = etat.obligations.filter(
    (entree) => entree.contribuableId === contribuable.id,
  );
  const paiements = etat.paiements.filter((entree) => entree.contribuableId === contribuable.id);
  return (
    <div className="page-contenu-sre">
      <EntetePageSre
        titre={
          contribuable.raisonSociale || `${contribuable.prenom ?? ""} ${contribuable.nom}`.trim()
        }
        description={`${contribuable.type === "ENTREPRISE" ? "Entreprise" : "Particulier"} · ${REGION_SRE}`}
        filAriane={["Back-office", "Contribuables", contribuable.nif || contribuable.id]}
        actions={
          <Link className="bouton-sre bouton-sre--contour" to="/admin/contribuables">
            <ArrowLeft size={14} /> Retour
          </Link>
        }
      />
      <div className="grille-statistiques-sre">
        <article className="carte-stat-sre">
          <span className="carte-stat-sre__icone carte-stat-sre__icone--bleu">
            <UserRound size={18} />
          </span>
          <div>
            <span>Compte lié</span>
            <strong className="valeur-stat-texte-sre">
              {utilisateur?.courriel ?? "Sans compte lié"}
            </strong>
            <small>{utilisateur ? "Compte utilisateur" : "Profil sans compte"}</small>
          </div>
        </article>
        <article className="carte-stat-sre">
          <span className="carte-stat-sre__icone carte-stat-sre__icone--orange">
            <CirclePlus size={18} />
          </span>
          <div>
            <span>Obligations</span>
            <strong>{obligations.length}</strong>
            <small>
              {obligations.filter((entree) => entree.statut !== "PAYE").length} à suivre
            </small>
          </div>
        </article>
        <article className="carte-stat-sre">
          <span className="carte-stat-sre__icone carte-stat-sre__icone--vert">
            <ArrowRight size={18} />
          </span>
          <div>
            <span>Déclarations</span>
            <strong>{paiements.length}</strong>
            <small>
              dont {paiements.filter((entree) => entree.statut === "EN_VERIFICATION").length} à
              vérifier
            </small>
          </div>
        </article>
      </div>
      <div className="grille-contenu-sre">
        <section className="carte-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Informations du profil</h2>
              <p>Source : dossier enregistré dans le serveur.</p>
            </div>
            <BadgeSre statut={utilisateur?.statut ?? "SANS_COMPTE"} />
          </div>
          <dl className="liste-details-sre">
            <div>
              <dt>Type</dt>
              <dd>
                <BadgeSre statut={contribuable.type} />
              </dd>
            </div>
            <div>
              <dt>NIF</dt>
              <dd>{contribuable.nif || "Non renseigné"}</dd>
            </div>
            {contribuable.stat && (
              <div>
                <dt>STAT</dt>
                <dd>{contribuable.stat}</dd>
              </div>
            )}
            <div>
              <dt>Adresse</dt>
              <dd>
                {contribuable.adresse}, {contribuable.ville}, {contribuable.region}
              </dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{contribuable.courriel}</dd>
            </div>
            <div>
              <dt>Téléphone</dt>
              <dd>{contribuable.telephone || "—"}</dd>
            </div>
            {contribuable.representantLegal && (
              <div>
                <dt>Représentant légal</dt>
                <dd>{contribuable.representantLegal}</dd>
              </div>
            )}
            <div>
              <dt>Compte utilisateur</dt>
              <dd>{utilisateur?.courriel ?? "Aucun compte lié"}</dd>
            </div>
            <div>
              <dt>Créé le</dt>
              <dd>{formaterDate(contribuable.dateCreationCompte, true)}</dd>
            </div>
          </dl>
        </section>
        <section className="carte-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Obligations associées</h2>
              <p>Selon les données renvoyées par le serveur.</p>
            </div>
            <Link className="lien-discret-sre" to="/admin/obligations">
              Gérer <ArrowRight size={14} />
            </Link>
          </div>
          {obligations.length ? (
            obligations.map((obligation) => (
              <div className="ligne-obligation-mini-sre" key={obligation.id}>
                <div>
                  <strong>{obligation.typeImpotNom}</strong>
                  <small>
                    {obligation.referenceFiscale} · {obligation.periode}
                  </small>
                </div>
                <span>{new Intl.NumberFormat("fr-FR").format(obligation.montant)} MGA</span>
                <BadgeSre statut={obligation.statut} />
              </div>
            ))
          ) : (
            <EtatVideSre
              titre="Aucune obligation liée"
              description="Aucune obligation n’est actuellement associée à ce profil."
            />
          )}
        </section>
      </div>
    </div>
  );
}
