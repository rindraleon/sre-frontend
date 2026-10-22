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
  it("rejects an invalid e-mail with a French message", () => {
    const result = loginSchema.safeParse({ courriel: "pas-un-email", motDePasse: "x" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toBe("Adresse e-mail invalide.");
  });

  it("no longer requires the STAT number: e-mail + password are enough", () => {
    expect(loginSchema.safeParse({ courriel: "a@example.mg", motDePasse: "x" }).success).toBe(true);
  });

  it("ignores the stat field when still sent (compatibility)", () => {
    const result = loginSchema.safeParse({
      courriel: "a@example.mg",
      motDePasse: "x",
      stat: "stat invalide!!",
    });
    // Field removed from the schema: tolerated without validation, never required.
    expect(result.success).toBe(true);
  });

  it("always requires a password", () => {
    const result = loginSchema.safeParse({ courriel: "a@example.mg", motDePasse: "" });
    expect(result.success).toBe(false);
  });
});

describe("publicContactSchema", () => {
  const validContact = {
    nom: "Rakoto Andry",
    courriel: "rakoto@example.mg",
    sujet: "Question sur le portail",
    message: "Bonjour, je souhaite obtenir une information sur le fonctionnement du portail.",
  };

  it("accepts a complete contact message", () => {
    expect(publicContactSchema.safeParse(validContact).success).toBe(true);
  });

  it("rejects too-short contact details or messages", () => {
    const result = publicContactSchema.safeParse({
      ...validContact,
      nom: "A",
      message: "Bonjour",
    });
    expect(result.success).toBe(false);
  });

  it("accepts the empty honeypot field of legitimate visitors", () => {
    expect(publicContactSchema.safeParse({ ...validContact, siteWeb: "" }).success).toBe(true);
  });
});

describe("password rule (aligned with the hardened backend DTO)", () => {
  it("rejects a password without uppercase", () => {
    const result = passwordChangeSchema.safeParse({
      motDePasseActuel: "Ancien1234",
      nouveauMotDePasse: "nouveau1234",
      confirmation: "nouveau1234",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.message.includes("majuscule"))).toBe(true);
  });
  it("accepts 10 characters with uppercase, lowercase and digit", () => {
    expect(
      passwordChangeSchema.safeParse({
        motDePasseActuel: "Ancien1234",
        nouveauMotDePasse: "Nouveau123",
        confirmation: "Nouveau123",
      }).success,
    ).toBe(true);
  });
  it("rejects a different confirmation", () => {
    const result = passwordChangeSchema.safeParse({
      motDePasseActuel: "Ancien1234",
      nouveauMotDePasse: "Nouveau123",
      confirmation: "Autre12345",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.path.includes("confirmation"))).toBe(true);
  });
});

describe("createRegistrationSchema", () => {
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
  it("accepts a complete individual", () => {
    expect(createRegistrationSchema(false).safeParse(base).success).toBe(true);
  });
  it("requires the legal name for a business", () => {
    const result = createRegistrationSchema(false).safeParse({ ...base, type: "ENTREPRISE" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.path.includes("raisonSociale"))).toBe(true);
  });
  it("does not require the profile for the first administrator", () => {
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
  it("requires the operator and phone number for mobile money", () => {
    const result = paymentDeclarationSchema.safeParse({ ...base, mode: "MOBILE_MONEY" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain("operateur");
      expect(fields).toContain("telephoneUtilise");
    }
  });
  it("requires the channel for bank transfer", () => {
    const result = paymentDeclarationSchema.safeParse({ ...base, mode: "VIREMENT_BANCAIRE" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.path.includes("banqueOuCanal"))).toBe(true);
  });
  it("rejects a future date", () => {
    const result = paymentDeclarationSchema.safeParse({
      ...base,
      mode: "VIREMENT_BANCAIRE",
      banqueOuCanal: "BOA",
      dateTransaction: "2999-01-01",
    });
    expect(result.success).toBe(false);
  });
});

describe("taxpayerFormSchema", () => {
  it("requires the name for an individual", () => {
    const result = taxpayerFormSchema.safeParse({
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
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((i) => i.path.includes("nom"))).toBe(true);
  });
});
