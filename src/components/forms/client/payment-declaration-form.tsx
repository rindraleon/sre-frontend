import type { UseFormReturn } from "react-hook-form";
import { Check, FileCheck2, WalletCards } from "lucide-react";
import type { TaxObligation } from "@/types";
import {
  MODE_PAIEMENT_MOBILE_MONEY,
  MODE_PAIEMENT_VIREMENT,
  OPERATEURS_MOBILE_MONEY,
} from "@/constants";
import { Select } from "@/components/ui/select";
import { OptionsSelect } from "@/components/forms/options-select";
import { FormField, FormError } from "@/components/forms/form-field";
import { formatMoney, formatDate } from "@/utils/format";
import type { PaymentDeclarationFormValues } from "@/validation/payment.schema";

/** Valeurs par défaut du formulaire de déclaration de paiement. */
export const DECLARATION_PAIEMENT_VIDE: PaymentDeclarationFormValues = {
  obligationId: "",
  mode: undefined as unknown as PaymentDeclarationFormValues["mode"],
  operateur: undefined,
  telephoneUtilise: "",
  banqueOuCanal: "",
  titulairePayeur: "",
  referenceTransaction: "",
  dateTransaction: "",
};

/** Champs du formulaire de déclaration d'une opération (sans le <form> ni sa soumission). */
export function PaymentDeclarationFormFields({
  formulaire,
  erreur,
  obligationsDisponibles,
  obligation,
}: Readonly<{
  formulaire: UseFormReturn<PaymentDeclarationFormValues>;
  erreur?: string;
  obligationsDisponibles: TaxObligation[];
  obligation?: TaxObligation;
}>) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = formulaire;
  const mode = watch("mode");
  return (
    <>
      <div className="etape-formulaire-sre">
        <span>1</span>
        <div>
          <h2>Obligation à régulariser</h2>
          <p>Sélectionnez une obligation associée à votre compte.</p>
        </div>
      </div>
      <FormField libelle="Impôt / obligation" erreur={errors.obligationId} requis>
        {(p) => (
          <Select {...p} className="champ-simple-sre" {...register("obligationId")}>
            <option value="">Choisir une obligation</option>
            {obligationsDisponibles.map((entree) => (
              <option key={entree.id} value={entree.id}>
                {entree.typeImpotNom} · {entree.periode} · {formatMoney(entree.montant)}
              </option>
            ))}
          </Select>
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
          aria-pressed={mode === MODE_PAIEMENT_MOBILE_MONEY}
          className={
            mode === MODE_PAIEMENT_MOBILE_MONEY
              ? "mode-paiement-sre mode-paiement-sre--actif"
              : "mode-paiement-sre"
          }
          onClick={() => setValue("mode", MODE_PAIEMENT_MOBILE_MONEY, { shouldValidate: true })}
        >
          <WalletCards size={18} />
          <span>
            <strong>Mobile Money</strong>
            <small>Déclaration d’une opération déjà effectuée</small>
          </span>
          {mode === MODE_PAIEMENT_MOBILE_MONEY && <Check size={16} />}
        </button>
        <button
          type="button"
          aria-pressed={mode === MODE_PAIEMENT_VIREMENT}
          className={
            mode === MODE_PAIEMENT_VIREMENT
              ? "mode-paiement-sre mode-paiement-sre--actif"
              : "mode-paiement-sre"
          }
          onClick={() => setValue("mode", MODE_PAIEMENT_VIREMENT, { shouldValidate: true })}
        >
          <FileCheck2 size={18} />
          <span>
            <strong>Virement / canal bancaire</strong>
            <small>Déclaration d’une opération déjà effectuée</small>
          </span>
          {mode === MODE_PAIEMENT_VIREMENT && <Check size={16} />}
        </button>
      </div>
      {errors.mode && (
        <p className="champ-erreur-sre" role="alert">
          {errors.mode.message}
        </p>
      )}
      {mode === MODE_PAIEMENT_MOBILE_MONEY ? (
        <div className="grille-formulaire-sre">
          <FormField libelle="Opérateur indiqué" erreur={errors.operateur} requis>
            {(p) => (
              <Select {...p} className="champ-simple-sre" {...register("operateur")}>
                <option value="" disabled>
                  Choisir un opérateur
                </option>
                <OptionsSelect options={OPERATEURS_MOBILE_MONEY} />
              </Select>
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
      ) : mode === MODE_PAIEMENT_VIREMENT ? (
        <div className="grille-formulaire-sre">
          <FormField libelle="Établissement / canal indiqué" erreur={errors.banqueOuCanal} requis>
            {(p) => <input {...p} className="champ-simple-sre" {...register("banqueOuCanal")} />}
          </FormField>
          <FormField libelle="Titulaire payeur" erreur={errors.titulairePayeur} aide="Facultatif">
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
    </>
  );
}
