import type { UseFormReturn } from "react-hook-form";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormError } from "@/components/forms/form-field";
import { FormStepIndicator } from "@/components/forms/form-step-indicator";
import type { TaxTypeFormValues } from "@/validation/admin.schema";

export const TAX_TYPE_EMPTY: TaxTypeFormValues = {
  code: "",
  nom: "",
  description: "",
  categorie: "",
  contribuablesConcernes: undefined as unknown as TaxTypeFormValues["contribuablesConcernes"],
  periodicite: undefined as unknown as TaxTypeFormValues["periodicite"],
  regleEcheance: "",
  modeMontant: undefined as unknown as TaxTypeFormValues["modeMontant"],
  montantReference: null,
  champsComplementairesTexte: "",
};

export function TaxTypeFormFields({
  form,
  error,
  step,
}: Readonly<{
  form: UseFormReturn<TaxTypeFormValues>;
  error?: string;
  step: number;
}>) {
  const {
    register,
    formState: { errors },
  } = form;
  return (
    <div className="form-sre form-grid-sre compact-form-sre">
      <FormStepIndicator step={step} steps={["Informations", "Règles fiscales"]} />
      {step === 0 && (
        <>
          <FormField label="Code" error={errors.code} required>
            {(p) => (
              <input {...p} className="field-simple-sre" maxLength={32} {...register("code")} />
            )}
          </FormField>
          <FormField label="Nom du type" error={errors.nom} required>
            {(p) => <input {...p} className="field-simple-sre" {...register("nom")} />}
          </FormField>
          <FormField label="Catégorie" error={errors.categorie} required>
            {(p) => <input {...p} className="field-simple-sre" {...register("categorie")} />}
          </FormField>
          <FormField
            label="Description"
            error={errors.description}
            className="field-sre-wide"
          >
            {(p) => (
              <Textarea
                {...p}
                className="field-simple-sre field-text-sre"
                rows={2}
                {...register("description")}
              />
            )}
          </FormField>
        </>
      )}
      {step === 1 && (
        <>
          <FormField
            label="Contribuables concernés"
            error={errors.contribuablesConcernes}
            required
          >
            {(p) => (
              <Select {...p} className="field-simple-sre" {...register("contribuablesConcernes")}>
                <option value="" disabled>
                  Choisir…
                </option>
                <option value="TOUS">Tous</option>
                <option value="PARTICULIER">Particuliers</option>
                <option value="ENTREPRISE">Entreprises</option>
              </Select>
            )}
          </FormField>
          <FormField label="Périodicité" error={errors.periodicite} required>
            {(p) => (
              <Select {...p} className="field-simple-sre" {...register("periodicite")}>
                <option value="" disabled>
                  Choisir…
                </option>
                <option value="MENSUELLE">Mensuelle</option>
                <option value="TRIMESTRIELLE">Trimestrielle</option>
                <option value="ANNUELLE">Annuelle</option>
                <option value="PONCTUELLE">Ponctuelle</option>
              </Select>
            )}
          </FormField>
          <FormField label="Mode de montant" error={errors.modeMontant} required>
            {(p) => (
              <Select {...p} className="field-simple-sre" {...register("modeMontant")}>
                <option value="" disabled>
                  Choisir…
                </option>
                <option value="MANUEL">À renseigner au cas par cas</option>
                <option value="FIXE">Montant de référence fixe</option>
                <option value="CALCULE">Calcul selon une règle validée</option>
              </Select>
            )}
          </FormField>
          <FormField label="Montant de référence (MGA)" error={errors.montantReference}>
            {(p) => (
              <input
                {...p}
                className="field-simple-sre"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                {...register("montantReference", {
                  setValueAs: (value: string) => (value === "" ? null : Number(value)),
                })}
              />
            )}
          </FormField>
          <FormField label="Règle d’échéance validée" error={errors.regleEcheance}>
            {(p) => <input {...p} className="field-simple-sre" {...register("regleEcheance")} />}
          </FormField>
          <FormField
            label="Champs complémentaires"
            error={errors.champsComplementairesTexte}
            help="Séparés par des virgules"
            className="field-sre-wide"
          >
            {(p) => (
              <input
                {...p}
                className="field-simple-sre"
                {...register("champsComplementairesTexte")}
              />
            )}
          </FormField>
        </>
      )}
      <div className="field-sre-wide">
        <FormError message={error} />
      </div>
    </div>
  );
}
