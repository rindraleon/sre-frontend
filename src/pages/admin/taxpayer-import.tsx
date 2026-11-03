import { cn } from "@/utils";
import { ArrowDownToLine, CheckCircle2, FileSpreadsheet, RotateCcw, Upload } from "lucide-react";
import {
  Button,
  CARD_CLASS,
  CARD_HEADER_CLASS,
  COMPACT_FILTER_CLASS,
  CoreSpinLoader,
  ERROR_MESSAGE_CLASS,
  EXCEL_DROP_ZONE_CLASS,
  EXCEL_PREVIEW_TABLE_CLASS,
  FILE_IMPORT_CLASS,
  EXCEL_DROP_ZONE_ICON_CLASS,
  EXCEL_MAPPING_GRID_CLASS,
  FIELD_SELECT_CLASS,
  FILE_ICON_CLASS,
  IMPORT_HELP_CLASS,
  IMPORT_STEP_BADGE_CLASS,
  IMPORT_TEMPLATE_LINK_CLASS,
  PAGE_BOTTOM_ACTIONS_CLASS,
  PAGE_CONTENT_CLASS,
  PageHeader,
  SECONDARY_TEXT_CLASS,
  Select,
  TABLE_ACTIONS_CLASS,
  TABLE_SCROLL_CLASS,
  TABLE_SRE_CLASS,
  buttonVariants,
} from "@/components";
import { SRE_REGION } from "@/data";
import type { CellValue } from "read-excel-file/browser";
import { ImportAnalysisPanel } from "@/components/TaxpayersComponents";
import { ImportReportPanel } from "@/components/TaxpayersComponents";
import { useTaxpayerImport } from "@/hooks";
import { MAPPING_FIELDS, cellText } from "@/utils";

const PREVIEW_ROWS = 5;
const PREVIEW_COLUMNS = 8;

export function AdminTaxpayerImportPage() {
  const importer = useTaxpayerImport();

  return (
    <div className={PAGE_CONTENT_CLASS}>
      <PageHeader
        title="Import Excel"
        description={`Importez des profils contribuables de ${SRE_REGION} après aperçu et validation des lignes.`}
        breadcrumb={["Accueil", "Import Excel"]}
      />

      {!importer.sheets.length ? (
        <WorkbookDropZone
          loading={importer.loading}
          error={importer.error}
          onFileSelected={importer.readFile}
        />
      ) : (
        <>
          <WorkbookToolbar
            fileName={importer.fileName}
            rowCount={importer.excelRows.length}
            sheetNames={importer.sheets.map((sheet) => sheet.sheet)}
            sheetName={importer.sheetName}
            onSheetChange={importer.chooseSheet}
            onReset={importer.reset}
          />

          {importer.error && (
            <p className={ERROR_MESSAGE_CLASS} role="alert">
              {importer.error}
            </p>
          )}

          <section className={CARD_CLASS}>
            <div className={CARD_HEADER_CLASS}>
              <div>
                <h2>1. Mapper les colonnes</h2>
                <p>Les champs requis sont indiqués. La région doit correspondre à {SRE_REGION}.</p>
              </div>
              <span className={IMPORT_STEP_BADGE_CLASS}>1 / 3</span>
            </div>
            <div className={EXCEL_MAPPING_GRID_CLASS}>
              {MAPPING_FIELDS.map(({ field, label, required }) => (
                <label key={field}>
                  {label}
                  {required && <em> requis</em>}
                  <Select
                    className={FIELD_SELECT_CLASS}
                    value={importer.mapping[field]}
                    onChange={(event) => importer.changeMapping(field, event.target.value)}
                  >
                    <option value="">Non mappé</option>
                    {importer.headers.map((header, index) => (
                      <option key={`${index}-${header}`} value={String(index)}>
                        {header}
                      </option>
                    ))}
                  </Select>
                </label>
              ))}
            </div>
          </section>

          <section className={CARD_CLASS}>
            <div className={CARD_HEADER_CLASS}>
              <div>
                <h2>2. Aperçu des données</h2>
                <p>Les premières lignes de la feuille « {importer.sheetName} »</p>
              </div>
              <span className={IMPORT_STEP_BADGE_CLASS}>
                {Math.min(PREVIEW_ROWS, importer.excelRows.length)} / {importer.excelRows.length}
              </span>
            </div>
            <WorkbookPreview
              headers={importer.headers}
              rows={importer.activeSheet?.data.slice(1, PREVIEW_ROWS + 1) ?? []}
            />
            <div className={PAGE_BOTTOM_ACTIONS_CLASS}>
              <Button
                onClick={importer.analyze}
                disabled={importer.loading || !importer.isMappingValid}
              >
                <CheckCircle2 size={15} /> 3. Analyser et valider
              </Button>
            </div>
          </section>

          {importer.analysis && (
            <ImportAnalysisPanel
              analysis={importer.analysis}
              filter={importer.filter}
              onFilterChange={importer.setFilter}
              onAnalyze={importer.analyze}
              onImport={() => void importer.startImport()}
              loading={importer.loading}
              error={importer.error}
            />
          )}
        </>
      )}

      {importer.report && (
        <ImportReportPanel
          report={importer.report}
          emails={importer.emails}
          resendInProgress={importer.resendInProgress}
          onResendEmail={(requestId, recipient) => void importer.resendEmail(requestId, recipient)}
        />
      )}
    </div>
  );
}

function WorkbookDropZone({
  loading,
  error,
  onFileSelected,
}: Readonly<{
  loading: boolean;
  error: string;
  onFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
}>) {
  return (
    <section className={cn(CARD_CLASS, EXCEL_DROP_ZONE_CLASS)}>
      <span className={EXCEL_DROP_ZONE_ICON_CLASS}>
        <FileSpreadsheet size={26} />
      </span>
      <h2>Sélectionner un classeur Excel</h2>
      <p>
        Importez un fichier .xlsx avec une ligne d’en-tête. Vous pourrez choisir la feuille, mapper
        les colonnes et valider les lignes avant l’enregistrement serveur.
      </p>
      <label className={buttonVariants({ variant: "primary" })} aria-disabled={loading}>
        <Upload size={15} aria-hidden="true" /> Choisir un fichier .xlsx
        <input
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={onFileSelected}
          disabled={loading}
        />
      </label>
      <a
        className={IMPORT_TEMPLATE_LINK_CLASS}
        href="/modele-import-contribuables-sre.xlsx"
        download
      >
        <ArrowDownToLine size={14} /> Télécharger le modèle vierge (sans exemple)
      </a>
      {loading && (
        <p className={cn(SECONDARY_TEXT_CLASS, "flex items-center gap-2")} aria-live="polite">
          <CoreSpinLoader label="Lecture du classeur…" size={16} compact />
          Lecture du classeur…
        </p>
      )}
      {error && (
        <p className={ERROR_MESSAGE_CLASS} role="alert">
          {error}
        </p>
      )}
      <div className={IMPORT_HELP_CLASS}>
        <strong>Colonnes à mapper :</strong>
        <p>
          Nom ou raison sociale, e-mail, téléphone, adresse, région {SRE_REGION} et ville/commune.
          NIF et STAT restent facultatifs.
        </p>
      </div>
    </section>
  );
}

function WorkbookToolbar({
  fileName,
  rowCount,
  sheetNames,
  sheetName,
  onSheetChange,
  onReset,
}: Readonly<{
  fileName: string;
  rowCount: number;
  sheetNames: readonly string[];
  sheetName: string;
  onSheetChange: (name: string) => void;
  onReset: () => void;
}>) {
  return (
    <section className={cn(CARD_CLASS, FILE_IMPORT_CLASS)}>
      <div>
        <span className={FILE_ICON_CLASS}>
          <FileSpreadsheet size={19} />
        </span>
        <div>
          <strong>{fileName}</strong>
          <small>
            {rowCount} ligne(s) de données · {sheetNames.length} feuille(s)
          </small>
        </div>
      </div>
      <div className={TABLE_ACTIONS_CLASS}>
        {sheetNames.length > 1 && (
          <label className={COMPACT_FILTER_CLASS}>
            Feuille
            <Select value={sheetName} onChange={(event) => onSheetChange(event.target.value)}>
              {sheetNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </label>
        )}
        <Button variant="outline" size="small" onClick={onReset}>
          <RotateCcw size={14} /> Remplacer le fichier
        </Button>
      </div>
    </section>
  );
}

function WorkbookPreview({
  headers,
  rows,
}: Readonly<{ headers: readonly string[]; rows: readonly (readonly unknown[])[] }>) {
  const visibleHeaders = headers.slice(0, PREVIEW_COLUMNS);
  return (
    <div className={TABLE_SCROLL_CLASS}>
      <table className={cn(TABLE_SRE_CLASS, EXCEL_PREVIEW_TABLE_CLASS)}>
        <thead>
          <tr>
            <th>Ligne</th>
            {visibleHeaders.map((header, index) => (
              <th key={`${index}-${header}`}>{header}</th>
            ))}
            {headers.length > PREVIEW_COLUMNS && <th>…</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${index + 2}`}>
              <td data-label="Ligne Excel">{index + 2}</td>
              {visibleHeaders.map((header, cell) => (
                <td
                  data-label={header || `Colonne ${cell + 1}`}
                  key={header || `column-${cell + 1}`}
                >
                  {cellText(row[cell] as CellValue | null) || "—"}
                </td>
              ))}
              {headers.length > PREVIEW_COLUMNS && <td data-label="Autres colonnes">…</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
