import { describe, expect, it } from "vitest";
import { filterSelectOptions, type SelectOption } from "./searchable-select";
import { getInitialTheme } from "@/context/ThemeContext";

const options: SelectOption[] = [
  { valeur: "1", libelle: "Élise Rakoto", description: "301 000 000 001" },
  { valeur: "2", libelle: "Société Fianar Négoce", description: "commercial@exemple.mg" },
  { valeur: "3", libelle: "Jean Rabe", description: "" },
];

describe("filterSelectOptions", () => {
  it("retourne toutes les options sans recherche", () => {
    expect(filterSelectOptions(options, "")).toHaveLength(3);
    expect(filterSelectOptions(options, "   ")).toHaveLength(3);
  });
  it("est insensible aux accents et à la casse", () => {
    expect(filterSelectOptions(options, "elise").map((o) => o.valeur)).toEqual(["1"]);
    expect(filterSelectOptions(options, "SOCIETE").map((o) => o.valeur)).toEqual(["2"]);
    expect(filterSelectOptions(options, "negoce").map((o) => o.valeur)).toEqual(["2"]);
  });
  it("recherche aussi dans la description (NIF, e-mail)", () => {
    expect(filterSelectOptions(options, "301").map((o) => o.valeur)).toEqual(["1"]);
    expect(filterSelectOptions(options, "exemple.mg").map((o) => o.valeur)).toEqual(["2"]);
  });
  it("retourne un tableau vide sans correspondance", () => {
    expect(filterSelectOptions(options, "introuvable")).toEqual([]);
  });
});

describe("getInitialTheme", () => {
  it("retombe sur le thème clair sans stockage ni préférence système exploitable", () => {
    expect(getInitialTheme()).toBe("clair");
  });
});
