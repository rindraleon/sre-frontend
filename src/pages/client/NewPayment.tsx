import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDollarSign,
  FileCheck2,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { callApi, mapApiPaymentDocuments, mapApiPayment, type ApiPayment } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { PageHeader, EmptyState } from "@/components/ui";
import { formatMoney, formatDate } from "@/utils/format";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  paymentDeclarationSchema,
  type PaymentDeclarationFormValues,
} from "@/validation/payment.schema";
import { applyApiErrors, apiErrorMessage } from "@/validation/apiErrors";
import { FormField, SubmitButton, FormError } from "@/components/forms/FormField";

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
          ["A_PAYER", "EN_RETARD", "REJETE", "CORRECTION_DEMANDEE"].includes(obligation.statut),
      ),
    [etat.obligations, session?.contribuableId],
  );
  const formulaire = useForm<PaymentDeclarationFormValues>({
    resolver: zodResolver(paymentDeclarationSchema),
    mode: "onTouched",
    defaultValues: {
      obligationId: params.get("obligationId") ?? "",
      mode: undefined as unknown as PaymentDeclarationFormValues["mode"],
      operateur: undefined,
      telephoneUtilise: "",
      banqueOuCanal: "",
      titulairePayeur: "",
      referenceTransaction: "",
      dateTransaction: "",
    },
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = formulaire;
  const obligationId = watch("obligationId");
  const mode = watch("mode");
  const operateur = watch("operateur");
  const [erreur, definirErreur] = useState("");
  const obligation = obligationsDisponibles.find((entree) => entree.id === obligationId);

  const soumettre = handleSubmit(async (valeurs) => {
    definirErreur("");
    if (!session?.jetonApi) {
      definirErreur("Session serveur introuvable. Reconnectez-vous.");
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
        ...(valeurs.mode === "MOBILE_MONEY"
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
      navigation(`/client/paiements/${paiementMappe.id}`, { replace: true });
    } catch (cause) {
      const globales = applyApiErrors(formulaire, cause);
      definirErreur(
        globales.length
          ? globales.join(" ")
          : apiErrorMessage(cause, "Le serveur n’a pas accepté la déclaration."),
      );
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
      <PageHeader
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
        <form className="carte-sre formulaire-paiement-sre" onSubmit={soumettre} noValidate>
          <div className="etape-formulaire-sre">
            <span>1</span>
            <div>
              <h2>Obligation à régulariser</h2>
              <p>Sélectionnez une obligation associée à votre compte.</p>
            </div>
          </div>
          <FormField libelle="Impôt / obligation" erreur={errors.obligationId} requis>
            {(p) => (
              <select {...p} className="champ-simple-sre" {...register("obligationId")}>
                <option value="">Choisir une obligation</option>
                {obligationsDisponibles.map((entree) => (
                  <option key={entree.id} value={entree.id}>
                    {entree.typeImpotNom} · {entree.periode} · {formatMoney(entree.montant)}
                  </option>
                ))}
              </select>
            )}
          </FormField>
          {obligation && (
            <div className="resume-obligation-paiement-sre">
              <div>
                <small>Référence d’obligation</small>
                <strong>{obligation.referenceFiscale}</strong>
              </div>
              <div>
                <small>Échéance</small>
                <strong>{formatDate(obligation.echeance)}</strong>
              </div>
              <div>
                <small>Montant de l’obligation</small>
                <strong>{formatMoney(obligation.montant)}</strong>
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
              onClick={() => setValue("mode", "MOBILE_MONEY", { shouldValidate: true })}
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
              onClick={() => setValue("mode", "VIREMENT_BANCAIRE", { shouldValidate: true })}
            >
              <FileCheck2 size={18} />
              <span>
                <strong>Virement / canal bancaire</strong>
                <small>Déclaration d’une opération déjà effectuée</small>
              </span>
              {mode === "VIREMENT_BANCAIRE" && <Check size={16} />}
            </button>
          </div>
          {errors.mode && (
            <p className="champ-erreur-sre" role="alert">
              {errors.mode.message}
            </p>
          )}
          {mode === "MOBILE_MONEY" ? (
            <div className="grille-formulaire-sre">
              <FormField libelle="Opérateur indiqué" erreur={errors.operateur} requis>
                {(p) => (
                  <select {...p} className="champ-simple-sre" {...register("operateur")}>
                    <option value="" disabled>
                      Choisir un opérateur
                    </option>
                    <option value="MVOLA">MVola</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="AIRTEL_MONEY">Airtel Money</option>
                  </select>
                )}
              </FormField>
              <FormField libelle="Numéro utilisé" erreur={errors.telephoneUtilise} requis>
                {(p) => (
                  <input
                    {...p}
                    className="champ-simple-sre"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+261 …"
                    {...register("telephoneUtilise")}
                  />
                )}
              </FormField>
            </div>
          ) : mode === "VIREMENT_BANCAIRE" ? (
            <div className="grille-formulaire-sre">
              <FormField
                libelle="Établissement / canal indiqué"
                erreur={errors.banqueOuCanal}
                requis
              >
                {(p) => (
                  <input {...p} className="champ-simple-sre" {...register("banqueOuCanal")} />
                )}
              </FormField>
              <FormField
                libelle="Titulaire payeur"
                erreur={errors.titulairePayeur}
                aide="Facultatif"
              >
                {(p) => (
                  <input
                    {...p}
                    className="champ-simple-sre"
                    autoComplete="name"
                    {...register("titulairePayeur")}
                  />
                )}
              </FormField>
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
            <FormField libelle="Référence saisie" erreur={errors.referenceTransaction} requis>
              {(p) => (
                <input {...p} className="champ-simple-sre" {...register("referenceTransaction")} />
              )}
            </FormField>
            <FormField libelle="Date de l’opération" erreur={errors.dateTransaction} requis>
              {(p) => (
                <input
                  {...p}
                  className="champ-simple-sre"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  {...register("dateTransaction")}
                />
              )}
            </FormField>
          </div>
          <FormError message={erreur} />
          <div className="actions-formulaire-sre">
            <Link to="/client/obligations" className="bouton-sre bouton-sre--contour">
              Annuler
            </Link>
            <SubmitButton enCours={isSubmitting} libelleEnCours="Enregistrement…">
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
