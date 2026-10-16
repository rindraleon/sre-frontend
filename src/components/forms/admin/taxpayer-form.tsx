import type { UseFormReturn } from "react-hook-form";
import { Select } from "@/components/ui/select";
import { SRE_REGION } from "@/constants";
import { FormField, FormError } from "@/components/forms/form-field";
import type { TaxpayerFormValues } from "@/validation/profile.schema";

/** Valeurs par défaut du formulaire « profil contribuable ». */
export const PROFIL_VIDE: TaxpayerFormValues = {
  nom: "",
  prenom: "",
  type: "PARTICULIER",
  raisonSociale: "",
  nomCommercial: "",
  nif: "",
  stat: "",
  adresse: "",
  region: SRE_REGION,
  ville: "",
  courriel: "",
  telephone: "",
  representantLegal: "",
  nomContact: "",
  prenomContact: "",
  fonctionContact: "",
};

/** Champs du formulaire de création d'un profil contribuable (sans le <form> ni sa soumission). */
export function TaxpayerFormFields({
  formulaire,
  erreur,
}: Readonly<{ formulaire: UseFormReturn<TaxpayerFormValues>; erreur?: string }>) {
  const {
    register,
    watch,
    formState: { errors },
  } = formulaire;
  const typeProfil = watch("type");
  return (
    <div className="formulaire-sre grille-formulaire-sre formulaire-compact-sre">
      <FormField libelle="Type" erreur={errors.type} requis>
        {(p) => (
          <Select {...p} className="champ-simple-sre" {...register("type")}>
            <option value="PARTICULIER">Particulier</option>
            <option value="ENTREPRISE">Entreprise</option>
          </Select>
        )}
      </FormField>
      {typeProfil === "ENTREPRISE" ? (
        <>
          <FormField libelle="Raison sociale" erreur={errors.raisonSociale} requis>
            {(p) => <input {...p} className="champ-simple-sre" {...register("raisonSociale")} />}
          </FormField>
          <FormField libelle="Nom commercial" erreur={errors.nomCommercial} aide="Facultatif">
            {(p) => <input {...p} className="champ-simple-sre" {...register("nomCommercial")} />}
          </FormField>
          <FormField libelle="NIF" erreur={errors.nif} aide="Facultatif">
            {(p) => <input {...p} className="champ-simple-sre" {...register("nif")} />}
          </FormField>
          <FormField libelle="STAT" erreur={errors.stat} aide="Facultatif">
            {(p) => <input {...p} className="champ-simple-sre" {...register("stat")} />}
          </FormField>
          <FormField
            libelle="Représentant légal"
            erreur={errors.representantLegal}
            aide="Facultatif"
            classeSupplementaire="champ-sre-large"
          >
            {(p) => (
              <input {...p} className="champ-simple-sre" {...register("representantLegal")} />
            )}
          </FormField>
        </>
      ) : (
        <>
          <FormField libelle="Nom" erreur={errors.nom} requis>
            {(p) => (
              <input
                {...p}
                className="champ-simple-sre"
                autoComplete="family-name"
                {...register("nom")}
              />
            )}
          </FormField>
          <FormField libelle="Prénom" erreur={errors.prenom}>
            {(p) => (
              <input
                {...p}
                className="champ-simple-sre"
                autoComplete="given-name"
                {...register("prenom")}
              />
            )}
          </FormField>
          <FormField libelle="NIF" erreur={errors.nif} aide="Facultatif">
            {(p) => <input {...p} className="champ-simple-sre" {...register("nif")} />}
          </FormField>
        </>
      )}
      <FormField libelle="Adresse e-mail" erreur={errors.courriel} requis>
        {(p) => (
          <input
            {...p}
            className="champ-simple-sre"
            type="email"
            inputMode="email"
            autoComplete="email"
            {...register("courriel")}
          />
        )}
      </FormField>
      <FormField libelle="Téléphone" erreur={errors.telephone} requis>
        {(p) => (
          <input
            {...p}
            className="champ-simple-sre"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            {...register("telephone")}
          />
        )}
      </FormField>
      <FormField
        libelle="Adresse"
        erreur={errors.adresse}
        requis
        classeSupplementaire="champ-sre-large"
      >
        {(p) => (
          <input
            {...p}
            className="champ-simple-sre"
            autoComplete="street-address"
            {...register("adresse")}
          />
        )}
      </FormField>
      <FormField libelle="Région">
        {(p) => <input {...p} className="champ-simple-sre" value={SRE_REGION} readOnly />}
      </FormField>
      <FormField libelle="Ville / Commune" erreur={errors.ville} requis>
        {(p) => (
          <input
            {...p}
            className="champ-simple-sre"
            autoComplete="address-level2"
            {...register("ville")}
          />
        )}
      </FormField>
      <div className="champ-sre-large">
        <FormError message={erreur} />
      </div>
    </div>
  );
}
