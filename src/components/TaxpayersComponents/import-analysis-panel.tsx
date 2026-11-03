import { ArrowRight } from "lucide-react";
import {
  Button,
  CARD_CLASS,
  CARD_HEADER_CLASS,
  COMPACT_FILTER_CLASS,
  ERROR_MESSAGE_CLASS,
  IMPORT_ANALYSIS_SUMMARY_CLASS,
  IMPORT_ROW_ERROR_CLASS,
  PAGE_BOTTOM_ACTIONS_CLASS,
  SECONDARY_TEXT_CLASS,
  SUCCESS_TEXT_CLASS,
  Select,
  StatusBadge,
  TABLE_SCROLL_CLASS,
  TABLE_SRE_CLASS,
  importSummaryToneClass,
} from "@/components";
import type { AnalysisRow } from "@/utils";
import { filterAnalysisRows, selectImportableProfiles, type AnalysisFilter } from "@/utils";

export function ImportAnalysisPanel({
  analysis,
  filter,
  onFilterChange,
  onAnalyze,
  onImport,
  loading,
  error,
}: Readonly<{
  analysis: readonly AnalysisRow[];
  filter: AnalysisFilter;
  onFilterChange: (filter: AnalysisFilter) => void;
  onAnalyze: () => void;
  onImport: () => void;
  loading: boolean;
  error: string;
}>) {
  const visibleRows = filterAnalysisRows(analysis, filter);
  const importableCount = selectImportableProfiles(analysis).length;

  return (
    <section className={CARD_CLASS}>
      <div className={CARD_HEADER_CLASS}>
        <div>
          <h2>Résultat de l’analyse</h2>
          <p>
            {analysis.length} ligne(s) non vides examinées. Rien n’est enregistré avant
            confirmation.
          </p>
        </div>
        <label className={COMPACT_FILTER_CLASS}>
          Afficher
          <Select
            value={filter}
            onChange={(event) => onFilterChange(event.target.value as AnalysisFilter)}
          >
            <option value="TOUS">Toutes</option>
            <option value="VALIDES">Valides</option>
            <option value="DOUBLONS">Doublons</option>
            <option value="ERREURS">Erreurs</option>
          </Select>
        </label>
      </div>

      <div className={IMPORT_ANALYSIS_SUMMARY_CLASS}>
        <div className={importSummaryToneClass("valid")}>
          <strong>{analysis.filter((row) => row.profile).length}</strong>
          <span>Prêtes à importer</span>
        </div>
        <div className={importSummaryToneClass("duplicate")}>
          <strong>{analysis.filter((row) => row.duplicate).length}</strong>
          <span>Doublons dans le fichier</span>
        </div>
        <div className={importSummaryToneClass("error")}>
          <strong>{analysis.filter((row) => row.errors.length && !row.duplicate).length}</strong>
          <span>Lignes en erreur</span>
        </div>
      </div>

      <div className={TABLE_SCROLL_CLASS}>
        <table className={TABLE_SRE_CLASS}>
          <thead>
            <tr>
              <th>Ligne Excel</th>
              <th>Type</th>
              <th>Nom / raison sociale</th>
              <th>NIF</th>
              <th>E-mail</th>
              <th>Résultat</th>
              <th>Motif</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.slice(0, 100).map((row) => {
              const resultStatus = row.duplicate
                ? "REJETE"
                : row.errors.length
                  ? "ERREUR"
                  : "ACTIF";
              const displayName =
                row.profile?.raisonSociale ||
                `${row.profile?.prenom ?? ""} ${row.profile?.nom ?? ""}`.trim() ||
                "—";

              return (
                <tr key={row.number}>
                  <td data-label="Ligne Excel">{row.number}</td>
                  <td data-label="Type">
                    {row.profile ? <StatusBadge status={row.profile.type} /> : "—"}
                  </td>
                  <td data-label="Nom / raison sociale">{displayName}</td>
                  <td data-label="NIF">{row.profile?.nif ?? "—"}</td>
                  <td data-label="E-mail">{row.profile?.courriel ?? "—"}</td>
                  <td data-label="Résultat">
                    <StatusBadge status={resultStatus} />
                  </td>
                  <td data-label="Motif">
                    {row.errors.map((rowError) => (
                      <small
                        key={`${row.number}-${rowError.field ?? ""}-${rowError.message}`}
                        className={IMPORT_ROW_ERROR_CLASS}
                      >
                        {rowError.field ? `${rowError.field} : ` : ""}
                        {rowError.message}
                      </small>
                    ))}
                    {!row.errors.length && !row.duplicate && (
                      <span className={SUCCESS_TEXT_CLASS}>Prête à enregistrer</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visibleRows.length > 100 && (
          <p className={SECONDARY_TEXT_CLASS}>
            Les 100 premières lignes filtrées sont affichées. L’analyse porte sur toute la feuille.
          </p>
        )}
      </div>

      <div className={PAGE_BOTTOM_ACTIONS_CLASS}>
        <Button variant="outline" onClick={onAnalyze}>
          Relancer la validation
        </Button>
        <Button onClick={onImport} disabled={importableCount === 0} loading={loading}>
          {loading ? (
            "Enregistrement…"
          ) : (
            <>
              Enregistrer les profils valides ({importableCount}) <ArrowRight size={15} />
            </>
          )}
        </Button>
      </div>

      {error && (
        <p className={ERROR_MESSAGE_CLASS} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
