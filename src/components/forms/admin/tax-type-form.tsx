import type { UseFormReturn } from "react-hook-form";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormError } from "@/components/forms/form-field";
import type { TaxTypeFormValues } from "@/validation/admin.schema";

export const TAX_TYPE_VIDE: TaxTypeFormValues = {
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
  formulaire,
  erreur,
}: Readonly<{ formulaire: UseFormReturn<TaxTypeFormValues>; erreur?: string }>) {
  const {
    register,
    formState: { errors },
  } = formulaire;
  return (
    <div className="formulaire-sre grille-formulaire-sre formulaire-compact-sre">
      <FormField libelle="Code" erreur={errors.code} requis>
        {(p) => <input {...p} className="champ-simple-sre" maxLength={32} {...register("code")} />}
      </FormField>
      <FormField libelle="Nom du type" erreur={errors.nom} requis>
        {(p) => <input {...p} className="champ-simple-sre" {...register("nom")} />}
      </FormField>
      <FormField libelle="Catégorie" erreur={errors.categorie} requis>
        {(p) => <input {...p} className="champ-simple-sre" {...register("categorie")} />}
      </FormField>
      <FormField libelle="Contribuables concernés" erreur={errors.contribuablesConcernes} requis>
        {(p) => (
          <Select {...p} className="champ-simple-sre" {...register("contribuablesConcernes")}>
            <option value="" disabled>
              Choisir…
            </option>
            <option value="TOUS">Tous</option>
            <option value="PARTICULIER">Particuliers</option>
            <option value="ENTREPRISE">Entreprises</option>
          </Select>
        )}
      </FormField>
      <FormField libelle="Périodicité" erreur={errors.periodicite} requis>
        {(p) => (
          <Select {...p} className="champ-simple-sre" {...register("periodicite")}>
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
      <FormField libelle="Mode de montant" erreur={errors.modeMontant} requis>
        {(p) => (
          <Select {...p} className="champ-simple-sre" {...register("modeMontant")}>
            <option value="" disabled>
              Choisir…
            </option>
            <option value="MANUEL">À renseigner au cas par cas</option>
            <option value="FIXE">Montant de référence fixe</option>
            <option value="CALCULE">Calcul selon une règle validée</option>
          </Select>
        )}
      </FormField>
      <FormField libelle="Montant de référence (MGA)" erreur={errors.montantReference}>
        {(p) => (
          <input
            {...p}
            className="champ-simple-sre"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            {...register("montantReference", {
              setValueAs: (valeur: string) => (valeur === "" ? null : Number(valeur)),
            })}
          />
        )}
      </FormField>
      <FormField libelle="Règle d’échéance validée" erreur={errors.regleEcheance}>
        {(p) => <input {...p} className="champ-simple-sre" {...register("regleEcheance")} />}
      </FormField>
      <FormField
        libelle="Description"
        erreur={errors.description}
        classeSupplementaire="champ-sre-large"
      >
        {(p) => (
          <Textarea
            {...p}
            className="champ-simple-sre champ-texte-sre"
            rows={2}
            {...register("description")}
          />
        )}
      </FormField>
      <FormField
        libelle="Champs complémentaires"
        erreur={errors.champsComplementairesTexte}
        aide="Séparés par des virgules"
        classeSupplementaire="champ-sre-large"
      >
        {(p) => (
          <input {...p} className="champ-simple-sre" {...register("champsComplementairesTexte")} />
        )}
      </FormField>
      <div className="champ-sre-large">
        <FormError message={erreur} />
      </div>
    </div>
  );
}
