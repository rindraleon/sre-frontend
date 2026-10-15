import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  MessageSquareWarning,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi, mapApiPaymentDocuments, mapApiPayment, type ApiPayment } from "@/services/api-client";
import { StatusBadge, Button, ConfirmDialog, PageHeader, EmptyState, Modal, Textarea } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { decisionReasonSchema, type DecisionReasonFormValues } from "@/validation/payment.schema";
import { FormField, SubmitButton, FormError } from "@/components/forms/form-field";

export function AdminPaymentDetailPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { etat, mettreAJourEtat, notifier } = useSre();
  const paiement = etat.paiements.find((entree) => entree.id === id);
  const contribuable = etat.contribuables.find((entree) => entree.id === paiement?.contribuableId);
  const obligation = etat.obligations.find((entree) => entree.id === paiement?.obligationId);
  const [confirmationConfirmer, definirConfirmationConfirmer] = useState(false);
  const [dialogueMotif, definirDialogueMotif] = useState<"REJETE" | "CORRECTION_DEMANDEE" | null>(
    null,
  );
  const formulaireMotif = useForm<DecisionReasonFormValues>({
    resolver: zodResolver(decisionReasonSchema),
    mode: "onTouched",
    defaultValues: { motif: "" },
  });
  const [erreur, definirErreur] = useState("");
  const [chargementDecision, definirChargementDecision] = useState(false);

  if (!paiement)
    return (
      <div className="page-contenu-sre">
        <PageHeader
          titre="Déclaration introuvable"
          filAriane={["Back-office", "Vérification des paiements"]}
        />
        <EmptyState
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
      const resultatApi = await callApi<ApiPayment>(
        `paiements/${encodeURIComponent(paiement.id)}/decision`,
        {
          method: "PATCH",
          token: session.jetonApi,
          body: { statut, ...(motifOptionnel ? { motif: motifOptionnel } : {}) },
        },
      );
      const paiementMisAJour = mapApiPayment(resultatApi);
      const documentsApi = mapApiPaymentDocuments(resultatApi);
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
      formulaireMotif.reset();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Le serveur n’a pas enregistré la décision.";
      definirErreur(message);
      notifier(message, "erreur");
    } finally {
      definirChargementDecision(false);
    }
  };

  const soumettreMotif = formulaireMotif.handleSubmit((valeurs) => {
    if (dialogueMotif) void enregistrerDecision(dialogueMotif, valeurs.motif.trim());
  });

  const nomContribuable =
    contribuable?.raisonSociale ||
    `${contribuable?.prenom ?? ""} ${contribuable?.nom ?? ""}`.trim() ||
    "Contribuable";
  const documents = etat.documentsPaiement.filter(
    (document) => document.paiementId === paiement.id && document.statut === "VALIDE",
  );
  return (
    <div className="page-contenu-sre">
      <PageHeader
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
            <StatusBadge statut={paiement.statut} />
          </div>
          <div className="montant-detail-paiement-sre">
            <span>Montant déclaré</span>
            <strong>{formatMoney(paiement.montant)}</strong>
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
                <StatusBadge statut={paiement.mode} />
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
              <dd>{formatDate(paiement.dateTransaction)}</dd>
            </div>
            <div>
              <dt>Obligation liée</dt>
              <dd>
                {obligation?.referenceFiscale ?? "—"} ·{" "}
                <StatusBadge statut={obligation?.statut ?? "INACTIF"} />
              </dd>
            </div>
            <div>
              <dt>Soumise le</dt>
              <dd>{formatDate(paiement.soumisLe, true)}</dd>
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
              <Button
                onClick={() => {
                  definirErreur("");
                  definirConfirmationConfirmer(true);
                }}
              >
                <CheckCircle2 size={15} /> Confirmer la déclaration
              </Button>
              <Button
                variante="danger"
                onClick={() => {
                  definirDialogueMotif("REJETE");
                  formulaireMotif.reset();
                  definirErreur("");
                }}
              >
                <XCircle size={15} /> Rejeter avec motif
              </Button>
              <Button
                variante="contour"
                onClick={() => {
                  definirDialogueMotif("CORRECTION_DEMANDEE");
                  formulaireMotif.reset();
                  definirErreur("");
                }}
              >
                <MessageSquareWarning size={15} /> Demander une correction
              </Button>
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
                    <small>{formatDate(etape.date, true)}</small>
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
      <ConfirmDialog
        ouvert={confirmationConfirmer}
        titre="Confirmer cette déclaration ?"
        description={`Vous allez enregistrer une décision « Confirmé par l’administration » pour ${paiement.referenceInterne}, montant déclaré ${formatMoney(paiement.montant)}. Aucun règlement bancaire n’est exécuté.`}
        fermer={() => definirConfirmationConfirmer(false)}
        confirmer={() => void enregistrerDecision("CONFIRME")}
        libelleConfirmer="Confirmer la décision"
        chargement={chargementDecision}
        erreur={erreur}
      />
      <Modal
        ouvert={!!dialogueMotif}
        titre={dialogueMotif === "REJETE" ? "Rejeter la déclaration" : "Demander une correction"}
        description="Le motif sera enregistré avec la décision et consultable dans l’espace contribuable. Aucun email ne sera simulé."
        fermer={() => definirDialogueMotif(null)}
        fermetureBloquee={chargementDecision}
        pied={
          <>
            <Button
              variante="contour"
              onClick={() => definirDialogueMotif(null)}
              disabled={chargementDecision}
            >
              Annuler
            </Button>
            <SubmitButton
              form="motif-paiement-admin"
              variante={dialogueMotif === "REJETE" ? "danger" : "primaire"}
              enCours={chargementDecision}
              libelleEnCours="Enregistrement…"
            >
              {dialogueMotif === "REJETE" ? "Confirmer le rejet" : "Enregistrer la demande"}
            </SubmitButton>
          </>
        }
      >
        <form
          id="motif-paiement-admin"
          className="formulaire-sre formulaire-compact-sre"
          onSubmit={soumettreMotif}
          noValidate
        >
          <FormField
            libelle="Motif détaillé"
            erreur={formulaireMotif.formState.errors.motif}
            requis
          >
            {(p) => (
              <Textarea {...p} rows={4} {...formulaireMotif.register("motif")} />
            )}
          </FormField>
          <FormError message={erreur} />
        </form>
      </Modal>
    </div>
  );
}
