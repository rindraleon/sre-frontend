import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CircleDollarSign, ShieldCheck } from "lucide-react";
import {
  callApi,
  mapApiPaymentDocuments,
  mapApiPayment,
  type ApiPayment,
} from "@/services/api-client";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader, EmptyState } from "@/components/ui";
import { formatMoney } from "@/utils/format";
import {
  paymentDeclarationSchema,
  type PaymentDeclarationFormValues,
} from "@/validation/payment.schema";
import {
  MSG_SESSION_MANQUANTE,
  MODE_PAIEMENT_MOBILE_MONEY,
  MODE_PAIEMENT_VIREMENT,
  ROUTES_CLIENT,
  STATUTS_OBLIGATION_DECLARABLE,
} from "@/constants";
import { useApiForm } from "@/hooks";
import { SubmitButton } from "@/components/forms/form-field";
import {
  PaymentDeclarationFormFields,
  DECLARATION_PAIEMENT_VIDE,
} from "@/components/forms/client/payment-declaration-form";

export function ClientNewPaymentPage() {
  const [params] = useSearchParams();
  const navigation = useNavigate();
  const { session } = useAuth();
  const { etat, mettreAJourEtat, notifier } = useSre();
  const obligationsDisponibles = useMemo(
    () =>
      etat.obligations.filter(
        (obligation) =>
          obligation.contribuableId === session?.contribuableId &&
          (STATUTS_OBLIGATION_DECLARABLE as readonly string[]).includes(obligation.statut),
      ),
    [etat.obligations, session?.contribuableId],
  );
  const formulaire = useApiForm<PaymentDeclarationFormValues>({
    schema: paymentDeclarationSchema,
    valeursInitiales: {
      ...DECLARATION_PAIEMENT_VIDE,
      obligationId: params.get("obligationId") ?? "",
    },
    messageRepli: "Le serveur n’a pas accepté la déclaration.",
  });
  const obligationId = formulaire.watch("obligationId");
  const mode = formulaire.watch("mode");
  const operateur = formulaire.watch("operateur");
  const obligation = obligationsDisponibles.find((entree) => entree.id === obligationId);

  const soumettre = formulaire.handleSubmit(async (valeurs) => {
    formulaire.reinitialiserErreur();
    if (!session?.jetonApi) {
      formulaire.definirErreur(MSG_SESSION_MANQUANTE);
      return;
    }
    const obligationChoisie = obligationsDisponibles.find(
      (entree) => entree.id === valeurs.obligationId,
    );
    if (!obligationChoisie) {
      formulaire.setError("obligationId", {
        type: "server",
        message: "Sélectionnez une obligation disponible pour votre compte.",
      });
      return;
    }
    try {
      const donneesApi = {
        obligationId: obligationChoisie.id,
        mode: valeurs.mode,
        ...(valeurs.mode === MODE_PAIEMENT_MOBILE_MONEY
          ? {
              operateur: valeurs.operateur,
              telephoneUtilise: valeurs.telephoneUtilise.trim(),
            }
          : {
              banqueOuCanal: valeurs.banqueOuCanal.trim(),
              ...(valeurs.titulairePayeur.trim()
                ? { titulairePayeur: valeurs.titulairePayeur.trim() }
                : {}),
            }),
        referenceTransaction: valeurs.referenceTransaction.trim(),
        dateTransaction: valeurs.dateTransaction,
      };
      const paiementApi = await callApi<ApiPayment>("paiements", {
        method: "POST",
        token: session.jetonApi,
        body: donneesApi,
      });
      const paiementMappe = mapApiPayment(paiementApi);
      const documentsMappes = mapApiPaymentDocuments(paiementApi);
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
      navigation(ROUTES_CLIENT.paiement(paiementMappe.id), { replace: true });
    } catch (cause) {
      formulaire.traiterEchec(cause);
    }
  });

  if (!obligationsDisponibles.length)
    return (
      <div className="page-contenu-sre">
        <PageHeader
          titre="Déclarer un paiement"
          description="Déclarez une opération effectuée en dehors du portail."
          filAriane={["Mon espace", "Déclarer un paiement"]}
        />
        <EmptyState
          titre="Aucune obligation disponible"
          description="Aucune obligation réglable ou régularisable n’est associée à votre compte."
          action={
            <Link className="bouton-sre bouton-sre--contour" to={ROUTES_CLIENT.obligations}>
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
      <PageHeader
        titre="Déclarer un paiement"
        description="Renseignez les éléments d’une opération que l’administration devra examiner."
        filAriane={["Mon espace", "Historique des paiements", "Nouvelle déclaration"]}
        actions={
          <Link className="bouton-sre bouton-sre--contour" to={ROUTES_CLIENT.obligations}>
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
        <form className="carte-sre formulaire-paiement-sre" onSubmit={soumettre} noValidate>
          <PaymentDeclarationFormFields
            formulaire={formulaire}
            erreur={formulaire.erreur}
            obligationsDisponibles={obligationsDisponibles}
            obligation={obligation}
          />
          <div className="actions-formulaire-sre">
            <Link to={ROUTES_CLIENT.obligations} className="bouton-sre bouton-sre--contour">
              Annuler
            </Link>
            <SubmitButton enCours={formulaire.isSubmitting} libelleEnCours="Enregistrement…">
              Soumettre pour vérification <ArrowRight size={15} />
            </SubmitButton>
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
                  <dd>{formatMoney(obligation.montant)}</dd>
                </div>
                <div>
                  <dt>Canal déclaré</dt>
                  <dd>
                    {mode === MODE_PAIEMENT_MOBILE_MONEY
                      ? operateur || "Opérateur non choisi"
                      : mode === MODE_PAIEMENT_VIREMENT
                        ? "Virement / canal bancaire"
                        : "Non sélectionné"}
                  </dd>
                </div>
              </dl>
              <div className="total-paiement-sre">
                <span>Montant transmis pour examen</span>
                <strong>{formatMoney(obligation.montant)}</strong>
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
