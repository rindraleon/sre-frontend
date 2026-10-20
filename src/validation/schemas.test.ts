import { describe, expect, it } from "vitest";
import {
  loginSchema,
  createRegistrationSchema,
  passwordChangeSchema,
  publicContactSchema,
} from "./auth.schema";
import { paymentDeclarationSchema } from "./payment.schema";
import { taxpayerFormSchema } from "./profile.schema";

describe("loginSchema", () => {
  it("rejette un e-mail invalide avec un message en français", () => {
    const resultat = loginSchema.safeParse({ courriel: "pas-un-email", motDePasse: "x" });
    expect(resultat.success).toBe(false);
    if (!resultat.success)
      expect(resultat.error.issues[0].message).toBe("Adresse e-mail invalide.");
  });

  it("n'exige plus le numéro STAT : e-mail + mot de passe suffisent", () => {
    expect(loginSchema.safeParse({ courriel: "a@example.mg", motDePasse: "x" }).success).toBe(true);
  });

  it("ignore le champ stat s'il est encore transmis (compatibilité)", () => {
    const resultat = loginSchema.safeParse({
      courriel: "a@example.mg",
      motDePasse: "x",
      stat: "stat invalide!!",
    });
    // Champ retiré du schéma : toléré sans validation, jamais requis.
    expect(resultat.success).toBe(true);
  });

  it("exige toujours un mot de passe", () => {
    const resultat = loginSchema.safeParse({ courriel: "a@example.mg", motDePasse: "" });
    expect(resultat.success).toBe(false);
  });
});

describe("publicContactSchema", () => {
  const contactValide = {
    nom: "Rakoto Andry",
    courriel: "rakoto@example.mg",
    sujet: "Question sur le portail",
    message: "Bonjour, je souhaite obtenir une information sur le fonctionnement du portail.",
  };

  it("accepte un message de contact complet", () => {
    expect(publicContactSchema.safeParse(contactValide).success).toBe(true);
  });

  it("rejette les coordonnées ou messages trop courts", () => {
    const resultat = publicContactSchema.safeParse({
      ...contactValide,
      nom: "A",
      message: "Bonjour",
    });
    expect(resultat.success).toBe(false);
  });

  it("accepte le champ honeypot vide des visiteurs légitimes", () => {
    expect(publicContactSchema.safeParse({ ...contactValide, siteWeb: "" }).success).toBe(true);
  });
});

describe("règle mot de passe (alignée sur le DTO backend durci)", () => {
  it("rejette un mot de passe sans majuscule", () => {
    const resultat = passwordChangeSchema.safeParse({
      motDePasseActuel: "Ancien1234",
      nouveauMotDePasse: "nouveau1234",
      confirmation: "nouveau1234",
    });
    expect(resultat.success).toBe(false);
    if (!resultat.success)
      expect(resultat.error.issues.some((i) => i.message.includes("majuscule"))).toBe(true);
  });
  it("accepte 10 caractères avec majuscule, minuscule et chiffre", () => {
    expect(
      passwordChangeSchema.safeParse({
        motDePasseActuel: "Ancien1234",
        nouveauMotDePasse: "Nouveau123",
        confirmation: "Nouveau123",
      }).success,
    ).toBe(true);
  });
  it("rejette une confirmation différente", () => {
    const resultat = passwordChangeSchema.safeParse({
      motDePasseActuel: "Ancien1234",
      nouveauMotDePasse: "Nouveau123",
      confirmation: "Autre12345",
    });
    expect(resultat.success).toBe(false);
    if (!resultat.success)
      expect(resultat.error.issues.some((i) => i.path.includes("confirmation"))).toBe(true);
  });
});

describe("inscriptionSchema", () => {
  const base = {
    type: "PARTICULIER" as const,
    nom: "Rakoto",
    prenom: "Jean",
    raisonSociale: "",
    nomCommercial: "",
    nif: "",
    stat: "",
    representantLegal: "",
    nomContact: "",
    prenomContact: "",
    fonctionContact: "",
    adresse: "Lot 12, Fianarantsoa",
    region: "Haute Matsiatra",
    ville: "Fianarantsoa",
    courriel: "Jean.rakoto@exemple.mg",
    telephone: "+261 34 00 000 00",
    motDePasse: "Nouveau123",
    confirmation: "Nouveau123",
  };
  it("accepte un particulier complet", () => {
    expect(createRegistrationSchema(false).safeParse(base).success).toBe(true);
  });
  it("exige la raison sociale pour une entreprise", () => {
    const resultat = createRegistrationSchema(false).safeParse({ ...base, type: "ENTREPRISE" });
    expect(resultat.success).toBe(false);
    if (!resultat.success)
      expect(resultat.error.issues.some((i) => i.path.includes("raisonSociale"))).toBe(true);
  });
  it("n'exige pas le profil pour le premier administrateur", () => {
    expect(
      createRegistrationSchema(true).safeParse({ ...base, adresse: "", ville: "", telephone: "" })
        .success,
    ).toBe(true);
  });
});

describe("paymentDeclarationSchema", () => {
  const base = {
    obligationId: "550e8400-e29b-41d4-a716-446655440000",
    telephoneUtilise: "",
    banqueOuCanal: "",
    titulairePayeur: "",
    referenceTransaction: "REF-123",
    dateTransaction: "2026-01-10",
  };
  it("exige l'opérateur et le téléphone en mobile money", () => {
    const resultat = paymentDeclarationSchema.safeParse({ ...base, mode: "MOBILE_MONEY" });
    expect(resultat.success).toBe(false);
    if (!resultat.success) {
      const champs = resultat.error.issues.map((i) => i.path[0]);
      expect(champs).toContain("operateur");
      expect(champs).toContain("telephoneUtilise");
    }
  });
  it("exige le canal en virement bancaire", () => {
    const resultat = paymentDeclarationSchema.safeParse({ ...base, mode: "VIREMENT_BANCAIRE" });
    expect(resultat.success).toBe(false);
    if (!resultat.success)
      expect(resultat.error.issues.some((i) => i.path.includes("banqueOuCanal"))).toBe(true);
  });
  it("rejette une date future", () => {
    const resultat = paymentDeclarationSchema.safeParse({
      ...base,
      mode: "VIREMENT_BANCAIRE",
      banqueOuCanal: "BOA",
      dateTransaction: "2999-01-01",
    });
    expect(resultat.success).toBe(false);
  });
});

describe("taxpayerFormSchema", () => {
  it("exige le nom pour un particulier", () => {
    const resultat = taxpayerFormSchema.safeParse({
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
      adresse: "Lot 12",
      region: "Haute Matsiatra",
      ville: "Fianarantsoa",
      courriel: "a@b.mg",
      telephone: "0340000000",
    });
    expect(resultat.success).toBe(false);
    if (!resultat.success)
      expect(resultat.error.issues.some((i) => i.path.includes("nom"))).toBe(true);
  });
});
