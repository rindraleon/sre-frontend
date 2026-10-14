import { useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  MessageSquareWarning,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { PaiementSre } from "@/types/sre";
import { utiliserAuthentificationSre } from "@/contexte/contexte-authentification-sre";
import { utiliserSre } from "@/contexte/contexte-sre";
import {
  appelerApiSre,
  mapperDocumentsPaiementApiSre,
  mapperPaiementApiSre,
  type PaiementApiSre,
} from "@/services/api-sre";
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
import { formaterArgent, formaterDate } from "@/utilitaires/formatage";

export function PaiementsAdministrationSre({
  verificationSeule = false,
}: {
  verificationSeule?: boolean;
}) {
  const { etat } = utiliserSre();
  const [recherche, definirRecherche] = useState("");
  const [statut, definirStatut] = useState(verificationSeule ? "EN_VERIFICATION" : "TOUS");
  const [page, definirPage] = useState(1);
  const [parPage, definirParPage] = useState(10);
  const paiements = useMemo(
    () =>
      etat.paiements
        .filter(
          (paiement) =>
            (statut === "TOUS" || paiement.statut === statut) &&
            (!verificationSeule || paiement.statut === "EN_VERIFICATION") &&
            `${paiement.referenceInterne} ${paiement.referenceTransaction} ${paiement.typeImpotNom} ${etat.contribuables.find((c) => c.id === paiement.contribuableId)?.raisonSociale ?? ""} ${etat.contribuables.find((c) => c.id === paiement.contribuableId)?.nif ?? ""}`
              .toLowerCase()
              .includes(recherche.toLowerCase()),
        )
        .sort((a, b) => b.soumisLe.localeCompare(a.soumisLe)),
    [etat.paiements, etat.contribuables, statut, recherche, verificationSeule],
  );
  const colonnes: ColonneTableauSre<PaiementSre>[] = [
    {
      id: "ref",
      titre: "Référence",
      afficher: (paiement) => (
        <Link className="reference-sre" to={`/admin/paiements/${paiement.id}`}>
          {paiement.referenceInterne}
        </Link>
      ),
      valeurTri: (paiement) => paiement.referenceInterne,
    },
    {
      id: "contribuable",
      titre: "Contribuable",
      afficher: (paiement) => {
        const c = etat.contribuables.find((entree) => entree.id === paiement.contribuableId);
        return (
          <div>
            <strong>
              {c?.raisonSociale ||
                `${c?.prenom ?? ""} ${c?.nom ?? ""}`.trim() ||
                "Profil indisponible"}
            </strong>
            <small className="sous-ligne-sre">{c?.nif || c?.courriel || "—"}</small>
          </div>
        );
      },
      valeurTri: (paiement) =>
        etat.contribuables.find((e) => e.id === paiement.contribuableId)?.raisonSociale ?? "",
    },
    {
      id: "impot",
      titre: "Impôt / période",
      afficher: (paiement) => (
        <>
          {paiement.typeImpotNom}
          <small className="sous-ligne-sre">{paiement.periode}</small>
        </>
      ),
      valeurTri: (paiement) => paiement.typeImpotNom,
    },
    {
      id: "montant",
      titre: "Montant déclaré",
      afficher: (paiement) => <strong>{formaterArgent(paiement.montant)}</strong>,
      valeurTri: (paiement) => paiement.montant,
    },
    {
      id: "mode",
      titre: "Mode déclaré",
      afficher: (paiement) => <BadgeSre statut={paiement.mode} />,
      valeurTri: (paiement) => paiement.mode,
    },
    {
      id: "soumis",
      titre: "Soumis le",
      afficher: (paiement) => formaterDate(paiement.soumisLe, true),
      valeurTri: (paiement) => paiement.soumisLe,
    },
    {
      id: "statut",
      titre: "Statut",
      afficher: (paiement) => <BadgeSre statut={paiement.statut} />,
      valeurTri: (paiement) => paiement.statut,
    },
    {
      id: "action",
      titre: "",
      afficher: (paiement) => (
        <Link className="lien-action-sre" to={`/admin/paiements/${paiement.id}`}>
          {paiement.statut === "EN_VERIFICATION" ? "Examiner" : "Détails"} <ArrowRight size={13} />
        </Link>
      ),
    },
  ];
  return (
    <div className="page-contenu-sre">
      <EntetePageSre
        titre={verificationSeule ? "Vérification des paiements" : "Historique des paiements"}
        description={
          verificationSeule
            ? "Examinez chaque déclaration avant d’enregistrer une décision."
            : "Historique partagé des déclarations et décisions."
        }
        filAriane={[
          "Back-office",
          verificationSeule ? "Vérification des paiements" : "Historique des paiements",
        ]}
        actions={
          verificationSeule && (
            <span className="badge-attente-gros-sre">
              <Clock3 size={14} />{" "}
              {etat.paiements.filter((paiement) => paiement.statut === "EN_VERIFICATION").length} à
              vérifier
            </span>
          )
        }
      />
      <div className="bandeau-alerte-securite-sre">
        <ShieldCheck size={18} />
        <div>
          <strong>Une référence déclarée ne confirme pas un paiement.</strong>
          <p>
            Le portail ne communique avec aucun établissement financier. Les décisions doivent
            reposer sur les contrôles administratifs applicables.
          </p>
        </div>
      </div>
      <TableauSre
        lignes={paiements}
        colonnes={colonnes}
        obtenirId={(paiement) => paiement.id}
        recherche={recherche}
        rechercher={definirRecherche}
        placeholder="Référence, contribuable ou NIF…"
        actionsEntete={
          !verificationSeule ? (
            <label className="filtre-compact-sre">
              Statut
              <select
                value={statut}
                onChange={(event) => {
                  definirStatut(event.target.value);
                  definirPage(1);
                }}
              >
                <option value="TOUS">Tous</option>
                <option value="EN_VERIFICATION">En vérification</option>
                <option value="CONFIRME">Confirmé par l’administration</option>
                <option value="REJETE">Rejeté</option>
                <option value="CORRECTION_DEMANDEE">Correction demandée</option>
              </select>
            </label>
          ) : undefined
        }
        espaceVide={verificationSeule ? "Aucune déclaration en attente" : "Aucune déclaration"}
        messageVide={
          verificationSeule
            ? "La file de vérification est vide."
            : "Les déclarations enregistrées apparaîtront ici."
        }
        page={page}
        parPage={parPage}
        changerPage={definirPage}
        changerParPage={definirParPage}
      />
    </div>
  );
}

export function DetailPaiementAdministrationSre() {
  const { id } = useParams();
  const { session } = utiliserAuthentificationSre();
  const { etat, mettreAJourEtat, notifier } = utiliserSre();
  const paiement = etat.paiements.find((entree) => entree.id === id);
  const contribuable = etat.contribuables.find((entree) => entree.id === paiement?.contribuableId);
  const obligation = etat.obligations.find((entree) => entree.id === paiement?.obligationId);
  const [confirmationConfirmer, definirConfirmationConfirmer] = useState(false);
  const [dialogueMotif, definirDialogueMotif] = useState<"REJETE" | "CORRECTION_DEMANDEE" | null>(
    null,
  );
  const [motif, definirMotif] = useState("");
  const [erreur, definirErreur] = useState("");
  const [chargementDecision, definirChargementDecision] = useState(false);

  if (!paiement)
    return (
      <div className="page-contenu-sre">
        <EntetePageSre
          titre="Déclaration introuvable"
          filAriane={["Back-office", "Vérification des paiements"]}
        />
        <EtatVideSre
          titre="Cette déclaration n’existe pas"
          description="Elle n’a pas été trouvée dans les données accessibles à la session."
          action={
            <Link className="bouton-sre bouton-sre--contour" to="/admin/paiements">
              Retour aux paiements
            </Link>
          }
        />
      </div>
    );

  const enregistrerDecision = async (
    statut: "CONFIRME" | "REJETE" | "CORRECTION_DEMANDEE",
    motifOptionnel?: string,
  ) => {
    if (paiement.statut !== "EN_VERIFICATION") return;
    if (!session?.jetonApi) {
      definirErreur("Session serveur introuvable. Reconnectez-vous.");
      return;
    }
    definirChargementDecision(true);
    definirErreur("");
    try {
      const resultatApi = await appelerApiSre<PaiementApiSre>(
        `paiements/${encodeURIComponent(paiement.id)}/decision`,
        {
          method: "PATCH",
          token: session.jetonApi,
          body: { statut, ...(motifOptionnel ? { motif: motifOptionnel } : {}) },
        },
      );
      const paiementMisAJour = mapperPaiementApiSre(resultatApi);
      const documentsApi = mapperDocumentsPaiementApiSre(resultatApi);
      const statutObligation =
        statut === "CONFIRME" ? "PAYE" : statut === "REJETE" ? "REJETE" : "CORRECTION_DEMANDEE";
      mettreAJourEtat((courant) => ({
        ...courant,
        paiements: [
          paiementMisAJour,
          ...courant.paiements.filter((entree) => entree.id !== paiementMisAJour.id),
        ],
        documentsPaiement: [
          ...courant.documentsPaiement.filter(
            (document) => document.paiementId !== paiementMisAJour.id,
          ),
          ...documentsApi,
        ],
        obligations: courant.obligations.map((entree) =>
          entree.id === paiementMisAJour.obligationId
            ? { ...entree, statut: statutObligation }
            : entree,
        ),
      }));
      notifier(
        statut === "CONFIRME"
          ? "Décision enregistrée. Le reçu est interne et ne prouve pas un transfert bancaire."
          : statut === "REJETE"
            ? "Rejet enregistré sur le serveur."
            : "Demande de correction enregistrée sur le serveur.",
        statut === "CONFIRME" ? "succes" : "avertissement",
      );
      definirConfirmationConfirmer(false);
      definirDialogueMotif(null);
      definirMotif("");
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Le serveur n’a pas enregistré la décision.";
      definirErreur(message);
      notifier(message, "erreur");
    } finally {
      definirChargementDecision(false);
    }
  };

  const soumettreMotif = (event: FormEvent) => {
    event.preventDefault();
    if (motif.trim().length < 5) {
      definirErreur("Le motif doit contenir au moins 5 caractères.");
      return;
    }
    if (dialogueMotif) void enregistrerDecision(dialogueMotif, motif.trim());
  };

  const nomContribuable =
    contribuable?.raisonSociale ||
    `${contribuable?.prenom ?? ""} ${contribuable?.nom ?? ""}`.trim() ||
    "Contribuable";
  const documents = etat.documentsPaiement.filter(
    (document) => document.paiementId === paiement.id && document.statut === "VALIDE",
  );
  return (
    <div className="page-contenu-sre">
      <EntetePageSre
        titre="Examen d’une déclaration"
        description={`Référence interne ${paiement.referenceInterne}`}
        filAriane={["Back-office", "Paiements", paiement.referenceInterne]}
        actions={
          <Link
            className="bouton-sre bouton-sre--contour"
            to={
              paiement.statut === "EN_VERIFICATION"
                ? "/admin/paiements-a-verifier"
                : "/admin/paiements"
            }
          >
            <ArrowLeft size={14} /> Retour à la liste
          </Link>
        }
      />
      <div className="bandeau-alerte-securite-sre">
        <ShieldCheck size={18} />
        <div>
          <strong>Référence déclarée ≠ règlement confirmé.</strong>
          <p>
            Cette décision est administrative. Le portail ne traite aucun mouvement de fonds et
            n’interroge aucun prestataire de paiement.
          </p>
        </div>
      </div>
      <div className="grille-detail-paiement-sre">
        <section className="carte-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Déclaration {paiement.referenceInterne}</h2>
              <p>
                {paiement.typeImpotNom} · période {paiement.periode}
              </p>
            </div>
            <BadgeSre statut={paiement.statut} />
          </div>
          <div className="montant-detail-paiement-sre">
            <span>Montant déclaré</span>
            <strong>{formaterArgent(paiement.montant)}</strong>
            <small>Montant transmis pour examen · MGA</small>
          </div>
          <dl className="liste-details-sre">
            <div>
              <dt>Contribuable</dt>
              <dd>{nomContribuable}</dd>
            </div>
            <div>
              <dt>NIF / STAT</dt>
              <dd>
                {contribuable?.nif || "—"}
                {contribuable?.stat ? ` / ${contribuable.stat}` : ""}
              </dd>
            </div>
            <div>
              <dt>Adresse e-mail</dt>
              <dd>{contribuable?.courriel || "—"}</dd>
            </div>
            <div>
              <dt>Mode déclaré</dt>
              <dd>
                <BadgeSre statut={paiement.mode} />
              </dd>
            </div>
            {paiement.operateur && (
              <div>
                <dt>Opérateur / téléphone</dt>
                <dd>
                  {paiement.operateur.replaceAll("_", " ")} · {paiement.telephoneUtilise}
                </dd>
              </div>
            )}
            {paiement.banqueOuCanal && (
              <div>
                <dt>Établissement / canal indiqué</dt>
                <dd>
                  {paiement.banqueOuCanal}
                  {paiement.titulairePayeur ? ` · ${paiement.titulairePayeur}` : ""}
                </dd>
              </div>
            )}
            <div>
              <dt>Référence de transaction déclarée</dt>
              <dd>
                <strong>{paiement.referenceTransaction}</strong>
              </dd>
            </div>
            <div>
              <dt>Date indiquée</dt>
              <dd>{formaterDate(paiement.dateTransaction)}</dd>
            </div>
            <div>
              <dt>Obligation liée</dt>
              <dd>
                {obligation?.referenceFiscale ?? "—"} ·{" "}
                <BadgeSre statut={obligation?.statut ?? "INACTIF"} />
              </dd>
            </div>
            <div>
              <dt>Soumise le</dt>
              <dd>{formaterDate(paiement.soumisLe, true)}</dd>
            </div>
          </dl>
          {documents.length > 0 && (
            <div className="documents-paiement-liste-sre">
              <div className="carte-sre__entete">
                <div>
                  <h3>Documents du serveur</h3>
                  <p>Documents associés à l’état de cette déclaration</p>
                </div>
                <BadgeCheck size={16} />
              </div>
              {documents.map((document) => (
                <div className="documents-paiement-ligne-sre" key={document.id}>
                  <span>
                    <strong>{document.numero}</strong>
                    <small>
                      {document.type === "ACCUSE_DECLARATION"
                        ? "Accusé de soumission · ne prouve pas le règlement"
                        : "Reçu interne · sans preuve bancaire"}
                    </small>
                  </span>
                </div>
              ))}
            </div>
          )}
          {paiement.motifRejet && (
            <div className="motif-decision-sre">
              <strong>
                {paiement.statut === "REJETE" ? "Motif de rejet" : "Motif de correction"}
              </strong>
              <p>{paiement.motifRejet}</p>
            </div>
          )}
          {paiement.statut === "EN_VERIFICATION" ? (
            <div className="actions-decision-paiement-sre">
              <BoutonSre onClick={() => definirConfirmationConfirmer(true)}>
                <CheckCircle2 size={15} /> Confirmer la déclaration
              </BoutonSre>
              <BoutonSre
                variante="danger"
                onClick={() => {
                  definirDialogueMotif("REJETE");
                  definirMotif("");
                  definirErreur("");
                }}
              >
                <XCircle size={15} /> Rejeter avec motif
              </BoutonSre>
              <BoutonSre
                variante="contour"
                onClick={() => {
                  definirDialogueMotif("CORRECTION_DEMANDEE");
                  definirMotif("");
                  definirErreur("");
                }}
              >
                <MessageSquareWarning size={15} /> Demander une correction
              </BoutonSre>
            </div>
          ) : (
            <div className="note-fiscale-sre">
              <span>
                <BadgeCheck size={14} />
              </span>
              <p>
                Une décision a déjà été enregistrée. Elle ne peut pas être modifiée depuis cette
                interface.
              </p>
            </div>
          )}
          {erreur && (
            <p className="message-erreur-sre" role="alert">
              {erreur}
            </p>
          )}
        </section>
        <section className="carte-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Historique de traitement</h2>
              <p>Étapes renvoyées par le serveur</p>
            </div>
            <Clock3 size={18} />
          </div>
          <ol className="historique-vertical-sre">
            {paiement.historique
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((etape, index) => (
                <li key={`${etape.date}-${index}`}>
                  <i
                    className={
                      index === paiement.historique.length - 1
                        ? "historique-vertical-sre__actif"
                        : ""
                    }
                  />
                  <div>
                    <strong>{etape.libelle}</strong>
                    <p>
                      {etape.acteur}
                      {etape.motif ? ` · ${etape.motif}` : ""}
                    </p>
                    <small>{formaterDate(etape.date, true)}</small>
                  </div>
                </li>
              ))}
          </ol>
          <div className="note-securite-sre">
            <ShieldCheck size={16} />
            <p>
              <strong>Vérification manuelle</strong>
              <span>Une référence saisie seule ne constitue pas une preuve de règlement.</span>
            </p>
          </div>
        </section>
      </div>
      <ConfirmationSre
        ouvert={confirmationConfirmer}
        titre="Confirmer cette déclaration ?"
        description={`Vous allez enregistrer une décision « Confirmé par l’administration » pour ${paiement.referenceInterne}, montant déclaré ${formaterArgent(paiement.montant)}. Aucun règlement bancaire n’est exécuté.`}
        fermer={() => definirConfirmationConfirmer(false)}
        confirmer={() => void enregistrerDecision("CONFIRME")}
        libelleConfirmer="Confirmer la décision"
        chargement={chargementDecision}
      />
      <ModalSre
        ouvert={!!dialogueMotif}
        titre={dialogueMotif === "REJETE" ? "Rejeter la déclaration" : "Demander une correction"}
        description="Le motif sera enregistré avec la décision et consultable dans l’espace contribuable. Aucun email ne sera simulé."
        fermer={() => definirDialogueMotif(null)}
        pied={
          <>
            <BoutonSre
              variante="contour"
              onClick={() => definirDialogueMotif(null)}
              disabled={chargementDecision}
            >
              Annuler
            </BoutonSre>
            <BoutonSre
              type="submit"
              form="motif-paiement-admin"
              variante={dialogueMotif === "REJETE" ? "danger" : "primaire"}
              disabled={chargementDecision}
            >
              {chargementDecision
                ? "Enregistrement…"
                : dialogueMotif === "REJETE"
                  ? "Confirmer le rejet"
                  : "Enregistrer la demande"}
            </BoutonSre>
          </>
        }
      >
        <form
          id="motif-paiement-admin"
          className="formulaire-sre formulaire-compact-sre"
          onSubmit={soumettreMotif}
        >
          <label>
            Motif détaillé
            <textarea
              className="champ-simple-sre champ-texte-sre"
              rows={4}
              value={motif}
              onChange={(event) => definirMotif(event.target.value)}
              required
              minLength={5}
            />
          </label>
          {erreur && (
            <p className="message-erreur-sre" role="alert">
              {erreur}
            </p>
          )}
        </form>
      </ModalSre>
    </div>
  );
}
