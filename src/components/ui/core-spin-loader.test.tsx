import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CoreSpinLoader, PageLoader } from "./core-spin-loader";

describe("CoreSpinLoader", () => {
  it("annonce le chargement de façon accessible sans minuterie JavaScript", () => {
    const html = renderToStaticMarkup(<CoreSpinLoader libelle="Enregistrement en cours" taille={24} />);
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Enregistrement en cours"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Enregistrement en cours");
  });

  it("fournit un état de chargement de page nommé", () => {
    const html = renderToStaticMarkup(<PageLoader libelle="Chargement des contribuables" />);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Chargement des contribuables");
  });
});
