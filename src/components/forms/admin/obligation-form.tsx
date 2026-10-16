import type { UseFormReturn } from "react-hook-form";
import { CalendarDays } from "lucide-react";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { FormField, FormError } from "@/components/forms/form-field";
import { useSre } from "@/context/SreContext";
import type { ObligationFormValues } from "@/validation/admin.schema";

export const OBLIGATION_VIDE: ObligationFormValues = {
  contribuableId: "",
  typeImpotId: "",
  periode: "",
  montant: undefined as unknown as number,
  echeance: "",
};

export function ObligationFormFields({
  formulaire,
  erreur,
}: Readonly<{ formulaire: UseFormReturn<ObligationFormValues>; erreur?: string }>) {
  const { etat } = useSre();
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = formulaire;
  const contribuableChoisi = watch("contribuableId");
  return (
    <div className="formulaire-sre grille-formulaire-sre formulaire-compact-sre">
      <FormField
        libelle="Contribuable"
        erreur={errors.contribuableId}
        requis
        classeSupplementaire="champ-sre-large"
      >
        {(p) => (
          <SearchableSelect
            {...p}
            valeur={contribuableChoisi}
            onChoisir={(valeur) =>
              setValue("contribuableId", valeur, { shouldValidate: true, shouldTouch: true })
            }
            placeholder="Rechercher un contribuable (nom, NIF, e-mail)…"
            options={etat.contribuables.map((contribuable) => ({
              valeur: contribuable.id,
              libelle:
                contribuable.raisonSociale ||
                `${contribuable.prenom ?? ""} ${contribuable.nom}`.trim(),
              description: contribuable.nif || contribuable.courriel,
            }))}
          />
        )}
      </FormField>
      <FormField
        libelle="Type d’impôt"
        erreur={errors.typeImpotId}
        requis
        classeSupplementaire="champ-sre-large"
      >
        {(p) => (
          <Select {...p} className="champ-simple-sre" {...register("typeImpotId")}>
            <option value="">Choisir un type actif</option>
            {etat.typesImpots
              .filter((type) => type.actif)
              .map((type) => (
                <option key={type.id} value={type.id}>
                  {type.nom} · {type.categorie}
                </option>
              ))}
          </Select>
        )}
      </FormField>
      <FormField libelle="Période" erreur={errors.periode} requis>
        {(p) => <input {...p} className="champ-simple-sre" {...register("periode")} />}
      </FormField>
      <FormField libelle="Montant validé (MGA)" erreur={errors.montant} requis>
        {(p) => (
          <input
            {...p}
            className="champ-simple-sre"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            {...register("montant", { valueAsNumber: true })}
          />
        )}
      </FormField>
      <FormField
        libelle="Échéance"
        erreur={errors.echeance}
        requis
        classeSupplementaire="champ-sre-large"
      >
        {(p) => <input {...p} className="champ-simple-sre" type="date" {...register("echeance")} />}
      </FormField>
      <div className="champ-sre-large">
        <FormError message={erreur} />
      </div>
      <div className="note-fiscale-sre champ-sre-large">
        <span>
          <CalendarDays size={15} />
        </span>
        <p>
          Seules les données saisies ici sont enregistrées. L’échéance et le montant ne sont pas
          calculés automatiquement par le portail.
        </p>
      </div>
    </div>
  );
}
