const comparateurPeriodes = new Intl.Collator("fr", { numeric: true, sensitivity: "base" });

/** Retourne les périodes non vides réellement enregistrées, sans normaliser leur format. */
export function listerPeriodesFiscales(periodes: readonly string[]): string[] {
  return [...new Set(periodes.filter((periode) => periode.trim().length > 0))].sort(
    comparateurPeriodes.compare,
  );
}

/** Une sélection vide désactive le filtre ; sinon la valeur est comparée à l’identique. */
export function correspondPeriodeFiscale(valeurEnregistree: string, selection: string): boolean {
  return selection === "" || valeurEnregistree === selection;
}
