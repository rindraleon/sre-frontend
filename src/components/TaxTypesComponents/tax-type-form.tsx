import type { UseFormReturn } from "react-hook-form";
import {
  Select,
  Textarea,
  FormField,
  FormError,
  FormStepIndicator,
  FIELD_INPUT_CLASS,
  FIELD_TEXTAREA_CLASS,
  FIELD_SELECT_CLASS,
  COMPACT_FORM_CLASS,
  FORM_GRID_CLASS,
  FORM_CLASS,
  FIELD_WIDE_CLASS,
} from "@/components";
import type { TaxTypeFormValues } from "@/schemas";
import { cn } from "@/utils";

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
    <div className={cn(FORM_GRID_CLASS, COMPACT_FORM_CLASS, FORM_CLASS)}>
      <FormStepIndicator step={step} steps={["Informations", "Règles fiscales"]} />
      {step === 0 && (
        <>
          <FormField label="Code" error={errors.code} required>
            {(p) => (
              <input
                {...p}
                className={FIELD_INPUT_CLASS}
                maxLength={32}
                placeholder="Ex. TAX-001"
                {...register("code")}
              />
            )}
          </FormField>
          <FormField label="Nature d'impôt" error={errors.nom} required>
            {(p) => (
              <input
                {...p}
                className={FIELD_INPUT_CLASS}
                placeholder="Ex. Impôt sur les revenus"
                {...register("nom")}
              />
            )}
          </FormField>
          <FormField label="Catégorie" error={errors.categorie} required>
            {(p) => (
              <input
                {...p}
                className={FIELD_INPUT_CLASS}
                placeholder="Ex. Impôt direct"
                {...register("categorie")}
              />
            )}
          </FormField>
          <FormField
            label="Description"
            error={errors.description}
            className={cn(FIELD_WIDE_CLASS)}
          >
            {(p) => (
              <Textarea
                {...p}
                className={FIELD_TEXTAREA_CLASS}
                rows={3}
                placeholder="Décrivez la nature et les conditions de cet impôt…"
                {...register("description")}
              />
            )}
          </FormField>
        </>
      )}
      {step === 1 && (
        <>
          <FormField label="Contribuables concernés" error={errors.contribuablesConcernes} required>
            {(p) => (
              <Select {...p} className={FIELD_SELECT_CLASS} {...register("contribuablesConcernes")}>
                <option value="" disabled>
                  Choisir…
                </option>
                <option value="TOUS">Tous</option>
                <option value="PARTICULIER">Particuliers</option>
                <option value="ENTREPRISE">Entreprises</option>
              </Select>
            )}
          </FormField>
          <FormField label="Période" error={errors.periodicite} required>
            {(p) => (
              <Select {...p} className={FIELD_SELECT_CLASS} {...register("periodicite")}>
                <option value="" disabled>
                  Choisir une période
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
              <Select {...p} className={FIELD_SELECT_CLASS} {...register("modeMontant")}>
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
                className={FIELD_INPUT_CLASS}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                placeholder="0"
                {...register("montantReference", {
                  setValueAs: (value: string) => (value === "" ? null : Number(value)),
                })}
              />
            )}
          </FormField>
          <FormField label="Règle d’échéance validée" error={errors.regleEcheance}>
            {(p) => (
              <input
                {...p}
                className={FIELD_INPUT_CLASS}
                placeholder="Ex. Au plus tard le 15 du mois suivant"
                {...register("regleEcheance")}
              />
            )}
          </FormField>
          <FormField
            label="Champs complémentaires"
            error={errors.champsComplementairesTexte}
            help="Séparés par des virgules"
            className={cn(FIELD_WIDE_CLASS)}
          >
            {(p) => (
              <input
                {...p}
                className={FIELD_INPUT_CLASS}
                placeholder="Ex. Activité, année fiscale"
                {...register("champsComplementairesTexte")}
              />
            )}
          </FormField>
        </>
      )}
      <div className={cn(FIELD_WIDE_CLASS)}>
        <FormError message={error} />
      </div>
    </div>
  );
}
