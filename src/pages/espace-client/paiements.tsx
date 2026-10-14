import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDollarSign,
  FileCheck2,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import type { ModePaiementSre, PaiementSre } from "@/types/sre";
import {
  appelerApiSre,
  mapperDocumentsPaiementApiSre,
  mapperPaiementApiSre,
  type PaiementApiSre,
} from "@/services/api-sre";
import { utiliserAuthentificationSre } from "@/contexte/contexte-authentification-sre";
import { utiliserSre } from "@/contexte/contexte-sre";
import {
  BadgeSre,
  BoutonSre,
  EntetePageSre,
  EtatVideSre,
  TableauSre,
  type ColonneTableauSre,
} from "@/composants/ui/composants-sre";
import { formaterArgent, formaterDate } from "@/utilitaires/formatage";

export function PaiementsContribuableSre() {
  const { session } = utiliserAuthentificationSre();
  const { etat } = utiliserSre();
  const [recherche, definirRecherche] = useState("");
  const [statut, definirStatut] = useState("TOUS");
  const [page, definirPage] = useState(1);
  const [parPage, definirParPage] = useState(10);
  const paiements = useMemo(
    () =>
      etat.paiements
        .filter((paiement) => paiement.contribuableId === session?.contribuableId)
        .filter(
          (paiement) =>
            (statut === "TOUS" || paiement.statut === statut) &&
            `${paiement.referenceInterne} ${paiement.referenceTransaction} ${paiement.typeImpotNom} ${paiement.periode}`
              .toLowerCase()
              .includes(recherche.toLowerCase()),
        )
        .sort((a, b) => b.soumisLe.localeCompare(a.soumisLe)),
    [etat.paiements, session?.contribuableId, statut, recherche],
  );
  const colonnes: ColonneTableauSre<PaiementSre>[] = [
    {
      id: "ref",
      titre: "Référence",
      afficher: (paiement) => (
        <Link className="reference-sre" to={`/client/paiements/${paiement.id}`}>
          {paiement.referenceInterne}
        </Link>
      ),
      valeurTri: (paiement) => paiement.referenceInterne,
    },
    {
      id: "impot",
      titre: "Impôt / période",
      afficher: (paiement) => (
        <>
          <strong>{paiement.typeImpotNom}</strong>
          <small className="sous-ligne-sre">{paiement.periode}</small>
        </>
      ),
      valeurTri: (paiement) => paiement.typeImpotNom,
    },
    {
      id: "montant",
      titre: "Montant déclaré",
      afficher: (paiement) => (
        <span className="montant-sre">{formaterArgent(paiement.montant)}</span>
      ),
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
      titre: "Date de déclaration",
      afficher: (paiement) => formaterDate(paiement.soumisLe),
      valeurTri: (paiement) => paiement.soumisLe,
    },
    {
      id: "statut",
      titre: "Statut",
      afficher: (paiement) => <BadgeSre statut={paiement.statut} />,
      valeurTri: (paiement) => paiement.statut,
    },
    {
      id: "actions",
      titre: "",
      afficher: (paiement) => (
        <Link className="lien-action-sre" to={`/client/paiements/${paiement.id}`}>
          Suivre <ArrowRight size={13} />
        </Link>
      ),
    },
  ];
  return (
    <div className="page-contenu-sre">
      <EntetePageSre
        titre="Historique des paiements"
        description="Suivez les déclarations associées à votre compte."
        filAriane={["Mon espace", "Historique des paiements"]}
        actions={
          <Link className="bouton-sre bouton-sre--primaire" to="/client/paiements/nouveau">
            <CircleDollarSign size={16} /> Déclarer un paiement
          </Link>
        }
      />
      <TableauSre
        lignes={paiements}
        colonnes={colonnes}
        obtenirId={(paiement) => paiement.id}
        recherche={recherche}
        rechercher={definirRecherche}
        placeholder="Référence, impôt, période…"
        actionsEntete={
          <label className="filtre-compact-sre">
            Statut
            <select
              value={statut}
              onChange={(event) => {
                definirStatut(event.target.value);
                definirPage(1);
              }}
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="EN_VERIFICATION">En vérification</option>
              <option value="CONFIRME">Confirmé par l’administration</option>
              <option value="REJETE">Rejeté</option>
              <option value="CORRECTION_DEMANDEE">Correction demandée</option>
            </select>
          </label>
        }
        espaceVide="Aucune déclaration"
        messageVide="Les déclarations enregistrées apparaîtront ici."
        page={page}
        parPage={parPage}
        changerPage={definirPage}
        changerParPage={definirParPage}
      />
    </div>
  );
}

export function NouveauPaiementContribuableSre() {
  const [params] = useSearchParams();
  const navigation = useNavigate();
  const { session } = utiliserAuthentificationSre();
  const { etat, mettreAJourEtat, notifier } = utiliserSre();
  const obligationsDisponibles = useMemo(
    () =>
      etat.obligations.filter(
        (obligation) =>
          obligation.contribuableId === session?.contribuableId &&
          ["A_PAYER", "EN_RETARD", "REJETE", "CORRECTION_DEMANDEE"].includes(obligation.statut),
      ),
    [etat.obligations, session?.contribuableId],
  );
  const [obligationId, definirObligationId] = useState(params.get("obligationId") ?? "");
  const [mode, definirMode] = useState<ModePaiementSre | "">("");
  const [operateur, definirOperateur] = useState<"MVOLA" | "ORANGE_MONEY" | "AIRTEL_MONEY" | "">(
    "",
  );
  const [telephone, definirTelephone] = useState("");
  const [canalBanque, definirCanalBanque] = useState("");
  const [titulaire, definirTitulaire] = useState("");
  const [reference, definirReference] = useState("");
  const [dateTransaction, definirDateTransaction] = useState("");
  const [erreur, definirErreur] = useState("");
  const [chargement, definirChargement] = useState(false);
  const obligation = obligationsDisponibles.find((entree) => entree.id === obligationId);

  const soumettre = async (event: FormEvent) => {
    event.preventDefault();
    definirErreur("");
    if (!session?.jetonApi) {
      definirErreur("Session serveur introuvable. Reconnectez-vous.");
      return;
    }
    if (!obligation) {
      definirErreur("Sélectionnez une obligation disponible pour votre compte.");
      return;
    }
    if (!mode) {
      definirErreur("Choisissez le canal de l’opération déclarée.");
      return;
    }
    if (reference.trim().length < 3) {
      definirErreur("Saisissez la référence de l’opération à examiner.");
      return;
    }
    if (!dateTransaction || new Date(dateTransaction).getTime() > Date.now()) {
      definirErreur("Indiquez une date de transaction passée ou présente.");
      return;
    }
    if (mode === "MOBILE_MONEY" && !operateur) {
      definirErreur("Choisissez l’opérateur indiqué.");
      return;
    }
    if (mode === "MOBILE_MONEY" && !/^\+?[0-9\s-]{8,40}$/.test(telephone.trim())) {
      definirErreur("Saisissez un numéro de téléphone valide utilisé pour l’opération.");
      return;
    }
    if (mode === "VIREMENT_BANCAIRE" && !canalBanque.trim()) {
      definirErreur("Précisez le canal indiqué pour cette déclaration.");
      return;
    }
    definirChargement(true);
    try {
      const donneesApi = {
        obligationId: obligation.id,
        mode: mode as ModePaiementSre,
        ...(mode === "MOBILE_MONEY"
          ? {
              operateur: operateur as "MVOLA" | "ORANGE_MONEY" | "AIRTEL_MONEY",
              telephoneUtilise: telephone.trim(),
            }
          : {
              banqueOuCanal: canalBanque.trim(),
              ...(titulaire.trim() ? { titulairePayeur: titulaire.trim() } : {}),
            }),
        referenceTransaction: reference.trim(),
        dateTransaction,
      };
      const paiementApi = await appelerApiSre<PaiementApiSre>("paiements", {
        method: "POST",
        token: session.jetonApi,
        body: donneesApi,
      });
      const paiementMappe = mapperPaiementApiSre(paiementApi);
      const documentsMappes = mapperDocumentsPaiementApiSre(paiementApi);
      mettreAJourEtat((courant) => ({
        ...courant,
        paiements: [
          paiementMappe,
          ...courant.paiements.filter((entree) => entree.id !== paiementMappe.id),
        ],
        documentsPaiement: [
          ...documentsMappes,
          ...courant.documentsPaiement.filter(
            (document) => document.paiementId !== paiementMappe.id,
          ),
        ],
        obligations: courant.obligations.map((entree) =>
          entree.id === paiementMappe.obligationId
            ? { ...entree, statut: "EN_VERIFICATION", paiementId: paiementMappe.id }
            : entree,
        ),
      }));
      notifier(
        "Déclaration enregistrée par le serveur. L’accusé prouve la soumission, pas le règlement.",
        "succes",
      );
      navigation(`/client/paiements/${paiementMappe.id}`, { replace: true });
    } catch (cause) {
      definirErreur(
        cause instanceof Error ? cause.message : "Le serveur n’a pas accepté la déclaration.",
      );
    } finally {
      definirChargement(false);
    }
  };

  if (!obligationsDisponibles.length)
    return (
      <div className="page-contenu-sre">
        <EntetePageSre
          titre="Déclarer un paiement"
          description="Déclarez une opération effectuée en dehors du portail."
          filAriane={["Mon espace", "Déclarer un paiement"]}
        />
        <EtatVideSre
          titre="Aucune obligation disponible"
          description="Aucune obligation réglable ou régularisable n’est associée à votre compte."
          action={
            <Link className="bouton-sre bouton-sre--contour" to="/client/obligations">
              Consulter mes obligations
            </Link>
          }
        />
        <div className="note-fiscale-sre">
          <span>i</span>
          <p>
            Si une déclaration est en vérification, attendez la décision avant d’en soumettre une
            autre pour la même obligation.
          </p>
        </div>
      </div>
    );

  return (
    <div className="page-contenu-sre">
      <EntetePageSre
        titre="Déclarer un paiement"
        description="Renseignez les éléments d’une opération que l’administration devra examiner."
        filAriane={["Mon espace", "Historique des paiements", "Nouvelle déclaration"]}
        actions={
          <Link className="bouton-sre bouton-sre--contour" to="/client/obligations">
            <ArrowLeft size={14} /> Mes obligations
          </Link>
        }
      />
      <div className="bandeau-alerte-securite-sre">
        <ShieldCheck size={18} />
        <div>
          <strong>Le portail ne réalise aucun paiement.</strong>
          <p>
            La référence saisie ne confirme pas le règlement. La déclaration est soumise à examen,
            sans intégration bancaire ou mobile-money.
          </p>
        </div>
      </div>
      <div className="grille-formulaire-paiement-sre">
        <form className="carte-sre formulaire-paiement-sre" onSubmit={soumettre}>
          <div className="etape-formulaire-sre">
            <span>1</span>
            <div>
              <h2>Obligation à régulariser</h2>
              <p>Sélectionnez une obligation associée à votre compte.</p>
            </div>
          </div>
          <label>
            Impôt / obligation
            <select
              className="champ-simple-sre"
              value={obligationId}
              onChange={(event) => definirObligationId(event.target.value)}
              required
            >
              <option value="">Choisir une obligation</option>
              {obligationsDisponibles.map((entree) => (
                <option key={entree.id} value={entree.id}>
                  {entree.typeImpotNom} · {entree.periode} · {formaterArgent(entree.montant)}
                </option>
              ))}
            </select>
          </label>
          {obligation && (
            <div className="resume-obligation-paiement-sre">
              <div>
                <small>Référence d’obligation</small>
                <strong>{obligation.referenceFiscale}</strong>
              </div>
              <div>
                <small>Échéance</small>
                <strong>{formaterDate(obligation.echeance)}</strong>
              </div>
              <div>
                <small>Montant de l’obligation</small>
                <strong>{formaterArgent(obligation.montant)}</strong>
              </div>
            </div>
          )}
          <div className="etape-formulaire-sre">
            <span>2</span>
            <div>
              <h2>Canal déclaré</h2>
              <p>Il s’agit d’une information déclarative, pas d’une intégration de paiement.</p>
            </div>
          </div>
          <div className="choix-mode-paiement-sre">
            <button
              type="button"
              aria-pressed={mode === "MOBILE_MONEY"}
              className={
                mode === "MOBILE_MONEY"
                  ? "mode-paiement-sre mode-paiement-sre--actif"
                  : "mode-paiement-sre"
              }
              onClick={() => definirMode("MOBILE_MONEY")}
            >
              <WalletCards size={18} />
              <span>
                <strong>Mobile Money</strong>
                <small>Déclaration d’une opération déjà effectuée</small>
              </span>
              {mode === "MOBILE_MONEY" && <Check size={16} />}
            </button>
            <button
              type="button"
              aria-pressed={mode === "VIREMENT_BANCAIRE"}
              className={
                mode === "VIREMENT_BANCAIRE"
                  ? "mode-paiement-sre mode-paiement-sre--actif"
                  : "mode-paiement-sre"
              }
              onClick={() => definirMode("VIREMENT_BANCAIRE")}
            >
              <FileCheck2 size={18} />
              <span>
                <strong>Virement / canal bancaire</strong>
                <small>Déclaration d’une opération déjà effectuée</small>
              </span>
              {mode === "VIREMENT_BANCAIRE" && <Check size={16} />}
            </button>
          </div>
          {mode === "MOBILE_MONEY" ? (
            <div className="grille-formulaire-sre">
              <label>
                Opérateur indiqué
                <select
                  className="champ-simple-sre"
                  value={operateur}
                  onChange={(event) => definirOperateur(event.target.value as typeof operateur)}
                  required
                >
                  <option value="" disabled>
                    Choisir un opérateur
                  </option>
                  <option value="MVOLA">MVola</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                  <option value="AIRTEL_MONEY">Airtel Money</option>
                </select>
              </label>
              <label>
                Numéro utilisé
                <input
                  className="champ-simple-sre"
                  type="tel"
                  value={telephone}
                  onChange={(event) => definirTelephone(event.target.value)}
                  required
                  placeholder="+261 …"
                />
              </label>
            </div>
          ) : mode === "VIREMENT_BANCAIRE" ? (
            <div className="grille-formulaire-sre">
              <label>
                Établissement / canal indiqué
                <input
                  className="champ-simple-sre"
                  value={canalBanque}
                  onChange={(event) => definirCanalBanque(event.target.value)}
                  required
                />
              </label>
              <label>
                Titulaire payeur <small>Facultatif</small>
                <input
                  className="champ-simple-sre"
                  value={titulaire}
                  onChange={(event) => definirTitulaire(event.target.value)}
                />
              </label>
            </div>
          ) : (
            <p className="texte-aide-sre">Choisissez un canal déclaré pour poursuivre.</p>
          )}
          <div className="etape-formulaire-sre">
            <span>3</span>
            <div>
              <h2>Référence de l’opération</h2>
              <p>Ces éléments sont transmis pour examen administratif.</p>
            </div>
          </div>
          <div className="grille-formulaire-sre">
            <label>
              Référence saisie
              <input
                className="champ-simple-sre"
                value={reference}
                onChange={(event) => definirReference(event.target.value)}
                required
                minLength={3}
              />
            </label>
            <label>
              Date de l’opération
              <input
                className="champ-simple-sre"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={dateTransaction}
                onChange={(event) => definirDateTransaction(event.target.value)}
                required
              />
            </label>
          </div>
          {erreur && (
            <p className="message-erreur-sre" role="alert">
              {erreur}
            </p>
          )}
          <div className="actions-formulaire-sre">
            <Link to="/client/obligations" className="bouton-sre bouton-sre--contour">
              Annuler
            </Link>
            <BoutonSre type="submit" disabled={chargement}>
              {chargement ? (
                "Enregistrement…"
              ) : (
                <>
                  Soumettre pour vérification <ArrowRight size={15} />
                </>
              )}
            </BoutonSre>
          </div>
        </form>
        <aside className="carte-sre recapitulatif-paiement-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Récapitulatif</h2>
              <p>Avant l’envoi de la déclaration</p>
            </div>
            <CircleDollarSign size={18} />
          </div>
          {obligation ? (
            <>
              <dl className="liste-details-sre">
                <div>
                  <dt>Impôt</dt>
                  <dd>{obligation.typeImpotNom}</dd>
                </div>
                <div>
                  <dt>Période</dt>
                  <dd>{obligation.periode}</dd>
                </div>
                <div>
                  <dt>Montant</dt>
                  <dd>{formaterArgent(obligation.montant)}</dd>
                </div>
                <div>
                  <dt>Canal déclaré</dt>
                  <dd>
                    {mode === "MOBILE_MONEY"
                      ? operateur || "Opérateur non choisi"
                      : mode === "VIREMENT_BANCAIRE"
                        ? "Virement / canal bancaire"
                        : "Non sélectionné"}
                  </dd>
                </div>
              </dl>
              <div className="total-paiement-sre">
                <span>Montant transmis pour examen</span>
                <strong>{formaterArgent(obligation.montant)}</strong>
              </div>
            </>
          ) : (
            <p className="texte-aide-sre">
              Sélectionnez une obligation pour afficher le récapitulatif.
            </p>
          )}
          <div className="note-securite-sre">
            <ShieldCheck size={16} />
            <p>
              <strong>Rappel sécurité</strong>
              <span>
                Ne saisissez jamais votre code PIN, mot de passe bancaire ou code à usage unique.
              </span>
            </p>
          </div>
          <div className="note-fiscale-sre">
            <span>i</span>
            <p>
              La déclaration débute au statut « En vérification »; elle n’est pas marquée réglée
              automatiquement.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function DetailPaiementContribuableSre() {
  const { id } = useParams();
  const { session } = utiliserAuthentificationSre();
  const { etat } = utiliserSre();
  const paiement = etat.paiements.find(
    (entree) => entree.id === id && entree.contribuableId === session?.contribuableId,
  );
  if (!paiement)
    return (
      <div className="page-contenu-sre">
        <EntetePageSre
          titre="Déclaration introuvable"
          filAriane={["Mon espace", "Historique des paiements"]}
        />
        <EtatVideSre
          titre="Cette déclaration n’est pas accessible"
          description="Elle n’existe pas ou ne fait pas partie de votre espace contribuable."
          action={
            <Link className="bouton-sre bouton-sre--contour" to="/client/paiements">
              <ArrowLeft size={14} /> Retour à l’historique
            </Link>
          }
        />
      </div>
    );
  const obligation = etat.obligations.find(
    (entree) =>
      entree.id === paiement.obligationId && entree.contribuableId === session?.contribuableId,
  );
  const documentsPaiement = etat.documentsPaiement.filter(
    (document) =>
      document.paiementId === paiement.id &&
      document.contribuableId === session?.contribuableId &&
      document.statut === "VALIDE",
  );
  return (
    <div className="page-contenu-sre">
      <EntetePageSre
        titre="Suivi de la déclaration"
        description={`Référence interne ${paiement.referenceInterne}`}
        filAriane={["Mon espace", "Historique des paiements", paiement.referenceInterne]}
        actions={
          <Link className="bouton-sre bouton-sre--contour" to="/client/paiements">
            <ArrowLeft size={14} /> Retour à l’historique
          </Link>
        }
      />
      <div className="grille-detail-paiement-sre">
        <section className="carte-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>{paiement.typeImpotNom}</h2>
              <p>Période {paiement.periode}</p>
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
              <dt>Référence de l’opération déclarée</dt>
              <dd>{paiement.referenceTransaction}</dd>
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
                  {paiement.operateur.replace("_", " ")} · {paiement.telephoneUtilise}
                </dd>
              </div>
            )}
            {paiement.banqueOuCanal && (
              <div>
                <dt>Canal indiqué</dt>
                <dd>{paiement.banqueOuCanal}</dd>
              </div>
            )}
            <div>
              <dt>Date déclarée</dt>
              <dd>{formaterDate(paiement.dateTransaction)}</dd>
            </div>
            <div>
              <dt>Soumise le</dt>
              <dd>{formaterDate(paiement.soumisLe, true)}</dd>
            </div>
          </dl>
          <div className="documents-paiement-liste-sre">
            <div className="carte-sre__entete">
              <div>
                <h3>Documents associés</h3>
                <p>Émis par le serveur selon l’état du dossier</p>
              </div>
              <FileCheck2 size={17} />
            </div>
            {documentsPaiement.length ? (
              documentsPaiement.map((document) => (
                <Link
                  className="documents-paiement-ligne-sre"
                  key={document.id}
                  to={`/client/documents/${document.id}`}
                >
                  <span>
                    <strong>{document.numero}</strong>
                    <small>
                      {document.type === "ACCUSE_DECLARATION"
                        ? "Accusé de soumission · ne prouve pas le règlement"
                        : "Reçu interne · sans preuve bancaire"}
                    </small>
                  </span>
                  <ArrowRight size={15} />
                </Link>
              ))
            ) : (
              <p className="texte-aide-sre">
                Aucun document n’est disponible pour cette déclaration.
              </p>
            )}
          </div>
          {paiement.motifRejet && (
            <div className="motif-decision-sre">
              <strong>
                {paiement.statut === "REJETE" ? "Motif de rejet" : "Correction demandée"}
              </strong>
              <p>{paiement.motifRejet}</p>
            </div>
          )}
        </section>
        <section className="carte-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Historique de traitement</h2>
              <p>Étapes enregistrées par le serveur</p>
            </div>
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
          {obligation && (
            <div className="note-fiscale-sre">
              <span>i</span>
              <p>
                Obligation associée :{" "}
                <Link to={`/client/obligations/${obligation.id}`}>
                  {obligation.referenceFiscale}
                </Link>
                . Une référence déclarée ne confirme pas un règlement.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
