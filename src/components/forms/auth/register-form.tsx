import { Select } from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, UserRound } from "lucide-react";
import type { RegistrationProfile } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { Button } from "@/components/ui";
import { SRE_REGION } from "@/constants";
import { createRegistrationSchema, type RegistrationFormValues } from "@/validation/auth.schema";
import { applyApiErrors, apiErrorMessage } from "@/validation/apiErrors";
import { FormField, PasswordField, SubmitButton, FormError } from "@/components/forms/form-field";

export const REGISTRATION_VIDE: RegistrationFormValues = {
  type: "PARTICULIER",
  nom: "",
  prenom: "",
  raisonSociale: "",
  nomCommercial: "",
  nif: "",
  stat: "",
  representantLegal: "",
  nomContact: "",
  prenomContact: "",
  fonctionContact: "",
  adresse: "",
  region: SRE_REGION,
  ville: "",
  courriel: "",
  telephone: "",
  motDePasse: "",
  confirmation: "",
};

export function RegisterForm({ premierAdministrateur }: Readonly<{ premierAdministrateur: boolean }>) {
  const { inscrire } = useAuth();
  const { notifier } = useSre();
  const navigation = useNavigate();
  const [erreur, setErreur] = useState("");
  const [etape, setEtape] = useState(0);
  const formulaire = useForm<RegistrationFormValues>({
    resolver: zodResolver(createRegistrationSchema(premierAdministrateur)),
    mode: "onTouched",
    defaultValues: REGISTRATION_VIDE,
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = formulaire;
  const type = watch("type");

  const etapes = premierAdministrateur
    ? [
        { libelle: "Identité", champs: ["nom", "prenom"] as const },
        { libelle: "Sécurité", champs: ["courriel", "motDePasse", "confirmation"] as const },
      ]
    : [
        {
          libelle: "Profil",
          champs: [
            "nom",
            "prenom",
            "raisonSociale",
            "nomCommercial",
            "nif",
            "stat",
            "representantLegal",
            "nomContact",
            "prenomContact",
            "fonctionContact",
          ] as const,
        },
        { libelle: "Coordonnées", champs: ["adresse", "ville", "courriel", "telephone"] as const },
        { libelle: "Sécurité", champs: ["motDePasse", "confirmation"] as const },
      ];
  const derniereEtape = etape === etapes.length - 1;

  const allerSuivant = async () => {
    const valide = await trigger([...etapes[etape].champs], { shouldFocus: true });
    if (valide) setEtape((courante) => Math.min(courante + 1, etapes.length - 1));
  };

  const soumettre = handleSubmit(async (valeurs) => {
    setErreur("");
    try {
      const { motDePasse, confirmation: _confirmation, ...profilValeurs } = valeurs;
      const donneesProfil: RegistrationProfile = premierAdministrateur
        ? {
            ...profilValeurs,
            type: "PARTICULIER",
            raisonSociale: undefined,
            nif: "",
            adresse: "",
            ville: "",
            region: "",
          }
        : profilValeurs;
      const resultat = await inscrire(donneesProfil, motDePasse);
      notifier(
        resultat.role === "ADMIN"
          ? "Premier compte administrateur créé."
          : "Compte contribuable créé sur le serveur.",
        "succes",
      );
      void navigation(resultat.role === "ADMIN" ? "/admin" : "/client", { replace: true });
    } catch (cause) {
      const globales = applyApiErrors(formulaire, cause);
      setErreur(
        globales.length
          ? globales.join(" ")
          : apiErrorMessage(cause, "Impossible de créer le compte. Réessayez."),
      );
    }
  });

  return (
    <form
      className="formulaire-sre grille-formulaire-sre formulaire-compact-sre"
      onSubmit={soumettre}
      noValidate
    >
      <nav
        className="etapes-inscription-sre champ-sre-large"
        aria-label="Progression de l’inscription"
      >
        <ol>
          {etapes.map((entree, index) => (
            <li
              key={entree.libelle}
              aria-current={index === etape ? "step" : undefined}
              className={index < etape ? "etape-terminee-sre" : ""}
            >
              {index + 1}. {entree.libelle}
            </li>
          ))}
        </ol>
      </nav>

      {etape === 0 && (
        <>
          {!premierAdministrateur && (
            <fieldset className="choix-type-contribuable-sre champ-sre-large">
              <legend>Type de contribuable</legend>
              <button
                type="button"
                aria-pressed={type === "PARTICULIER"}
                className={
                  type === "PARTICULIER"
                    ? "type-contribuable-sre type-contribuable-sre--actif"
                    : "type-contribuable-sre"
                }
                onClick={() => setValue("type", "PARTICULIER", { shouldValidate: true })}
              >
                <UserRound size={17} />
                <span>
                  <strong>Particulier</strong>
                  <small>Profil personnel</small>
                </span>
              </button>
              <button
                type="button"
                aria-pressed={type === "ENTREPRISE"}
                className={
                  type === "ENTREPRISE"
                    ? "type-contribuable-sre type-contribuable-sre--actif"
                    : "type-contribuable-sre"
                }
                onClick={() => setValue("type", "ENTREPRISE", { shouldValidate: true })}
              >
                <Building2 size={17} />
                <span>
                  <strong>Entreprise</strong>
                  <small>Profil professionnel</small>
                </span>
              </button>
            </fieldset>
          )}
          {!premierAdministrateur && type === "ENTREPRISE" ? (
            <>
              <FormField libelle="Raison sociale" erreur={errors.raisonSociale} requis>
                {(p) => (
                  <input {...p} className="champ-simple-sre" {...register("raisonSociale")} />
                )}
              </FormField>
              <FormField libelle="Nom commercial" erreur={errors.nomCommercial} aide="Facultatif">
                {(p) => (
                  <input {...p} className="champ-simple-sre" {...register("nomCommercial")} />
                )}
              </FormField>
              <FormField libelle="NIF" erreur={errors.nif} aide="Facultatif selon votre situation">
                {(p) => <input {...p} className="champ-simple-sre" {...register("nif")} />}
              </FormField>
              <FormField libelle="STAT" erreur={errors.stat} aide="Facultatif">
                {(p) => <input {...p} className="champ-simple-sre" {...register("stat")} />}
              </FormField>
              <FormField libelle="Représentant légal" erreur={errors.representantLegal}>
                {(p) => (
                  <input {...p} className="champ-simple-sre" {...register("representantLegal")} />
                )}
              </FormField>
              <FormField libelle="Nom du contact" erreur={errors.nomContact}>
                {(p) => <input {...p} className="champ-simple-sre" {...register("nomContact")} />}
              </FormField>
              <FormField libelle="Prénom du contact" erreur={errors.prenomContact}>
                {(p) => (
                  <input {...p} className="champ-simple-sre" {...register("prenomContact")} />
                )}
              </FormField>
              <FormField libelle="Fonction du contact" erreur={errors.fonctionContact}>
                {(p) => (
                  <input {...p} className="champ-simple-sre" {...register("fonctionContact")} />
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
              {!premierAdministrateur && (
                <FormField
                  libelle="NIF"
                  erreur={errors.nif}
                  aide="Facultatif selon votre situation"
                >
                  {(p) => <input {...p} className="champ-simple-sre" {...register("nif")} />}
                </FormField>
              )}
            </>
          )}
        </>
      )}

      {etape === 1 && !premierAdministrateur && (
        <>
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
          <FormField libelle="Région" erreur={errors.region} requis>
            {(p) => (
              <Select {...p} className="champ-simple-sre" {...register("region")}>
                <option value={SRE_REGION}>{SRE_REGION}</option>
              </Select>
            )}
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
          <FormField
            libelle="Adresse e-mail"
            erreur={errors.courriel}
            requis
            classeSupplementaire="champ-sre-large"
          >
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
                placeholder="+261 …"
                {...register("telephone")}
              />
            )}
          </FormField>
        </>
      )}

      {derniereEtape && (
        <>
          {premierAdministrateur && (
            <FormField
              libelle="Adresse e-mail"
              erreur={errors.courriel}
              requis
              classeSupplementaire="champ-sre-large"
            >
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
          )}
          <PasswordField
            libelle="Mot de passe"
            erreur={errors.motDePasse}
            aide="10 caractères minimum, une majuscule, une minuscule et un chiffre."
            requis
            autoComplete="new-password"
            {...register("motDePasse")}
          />
          <PasswordField
            libelle="Confirmer le mot de passe"
            erreur={errors.confirmation}
            requis
            autoComplete="new-password"
            {...register("confirmation")}
          />
          <div className="champ-sre-large">
            <div className="note-securite-sre">
              <CheckCircle2 size={16} />
              <p>
                <strong>Compte sécurisé par le serveur</strong>
                <span>
                  Le mot de passe est haché côté serveur; votre profil est enregistré dans la base
                  du portail SRE.
                </span>
              </p>
            </div>
          </div>
        </>
      )}

      <div className="champ-sre-large">
        <FormError message={erreur} />
      </div>
      <div className="actions-formulaire-sre champ-sre-large">
        {etape > 0 && (
          <Button
            type="button"
            variante="contour"
            disabled={isSubmitting}
            onClick={() => setEtape((courante) => Math.max(0, courante - 1))}
          >
            <ArrowLeft size={15} /> Précédent
          </Button>
        )}
        {!derniereEtape ? (
          <Button type="button" onClick={() => void allerSuivant()}>
            Suivant <ArrowRight size={16} />
          </Button>
        ) : (
          <SubmitButton enCours={isSubmitting} libelleEnCours="Création du compte…">
            {premierAdministrateur
              ? "Initialiser l’administration"
              : "Créer mon compte contribuable"}{" "}
            <ArrowRight size={16} />
          </SubmitButton>
        )}
      </div>
    </form>
  );
}
