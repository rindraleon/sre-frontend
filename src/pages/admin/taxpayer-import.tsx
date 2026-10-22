import { Select } from "@/components/ui/select";
import { useMemo, useState, type ChangeEvent } from "react";
import readXlsxFile, { type CellValue, type Sheet } from "read-excel-file/browser";
import {
  ArrowDownToLine,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  FileSpreadsheet,
  MailCheck,
  RotateCcw,
  ShieldCheck,
  Upload,
} from "lucide-react";
import type { ImportHistoryEntry, ImportErrorRow, TaxpayerType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi, mapApiTaxpayer, type ApiTaxpayer } from "@/services/api-client";
import { SRE_REGION } from "@/utils/constants";
import { StatusBadge, Button, CoreSpinLoader, PageHeader } from "@/components/ui";
import { formatDate } from "@/utils/format";
import {
  type AnalysisRow,
  type MappingField,
  type Mappings,
  type ImportProfile,
  MAPPING_FIELDS,
  normalizedKey,
  mappingEmpty,
  cellText,
} from "./taxpayer-import.utils";
export function AdminTaxpayerImportPage() {
  const { updateState, notify } = useSre();
  const { session } = useAuth();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [sheetName, setSheetName] = useState("");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [excelRows, setExcelRows] = useState<(CellValue | null)[][]>([]);
  const [mapping, setMapping] = useState<Mappings>(mappingEmpty);
  const [analysis, setAnalysis] = useState<AnalysisRow[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ImportHistoryEntry | null>(null);
  const [emailsImport, setEmailsImport] = useState<
    {
      compteId: string;
      destinataire: string;
      statutCourriel: string;
      demandeId: string | null;
    }[]
  >([]);
  const [resendInProgress, setResendInProgress] = useState<string | null>(null);
  const [filterRows, setFilterRows] = useState("TOUS");
  const activeSheet = sheets.find((sheet) => sheet.sheet === sheetName);
  const validColumns = useMemo(
    () =>
      MAPPING_FIELDS.filter((field) => field.required).every(
        (field) => mapping[field.field] !== "",
      ),
    [mapping],
  );
  const analyzedRows = useMemo(
    () =>
      (analysis ?? []).filter(
        (row) => {
          if (filterRows === "TOUS") return true;
          if (filterRows === "VALIDES") return Boolean(row.profile);
          if (filterRows === "DOUBLONS") return row.duplicate;
          return row.errors.length > 0;
        },
      ),
    [analysis, filterRows],
  );

  const initializeSheet = (sheet: Sheet) => {
    const rows = sheet.data ?? [];
    const headersSheet = (rows[0] ?? []).map(
      (cell, index) => cellText(cell) || `Colonne ${index + 1}`,
    );
    const detectedMapping = { ...mappingEmpty };
    for (const entry of MAPPING_FIELDS) {
      const index = headersSheet.findIndex((header) =>
        entry.aliases.map(normalizedKey).includes(normalizedKey(header)),
      );
      if (index >= 0) detectedMapping[entry.field] = String(index);
    }
    setSheetName(sheet.sheet);
    setHeaders(headersSheet);
    setExcelRows(rows.slice(1));
    setMapping(detectedMapping);
    setAnalysis(null);
    setReport(null);
    setFilterRows("TOUS");
  };

  const readFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setReport(null);
    setFileName(file.name);
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setError("Choisissez un fichier Excel .xlsx.");
      event.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Le fichier dépasse la limite de 10 Mo.");
      event.target.value = "";
      return;
    }
    setLoading(true);
    try {
      const result = await readXlsxFile(file);
      const nonEmptySheets = result.filter((sheet) => sheet.data?.length);
      if (!nonEmptySheets.length) {
        setError("Aucune feuille ou ligne lisible n’a été trouvée.");
        setSheets([]);
        return;
      }
      if (nonEmptySheets.some((sheet) => sheet.data.length > 2001)) {
        setError("La limite est de 2 000 lignes de données par feuille.");
        setSheets([]);
        return;
      }
      setSheets(nonEmptySheets);
      initializeSheet(nonEmptySheets[0]);
    } catch {
      setError(
        "Impossible de lire ce classeur. Vérifiez qu’il s’agit d’un fichier .xlsx valide, puis réessayez.",
      );
      setSheets([]);
    } finally {
      setLoading(false);
    }
  };

  const chooseSheet = (name: string) => {
    const sheet = sheets.find((entry) => entry.sheet === name);
    if (sheet) initializeSheet(sheet);
  };
  const changeMapping = (field: MappingField, value: string) => {
    setMapping((current) => ({ ...current, [field]: value }));
    setAnalysis(null);
    setReport(null);
  };
  const mappedValue = (row: (CellValue | null)[], field: MappingField) => {
    const index = mapping[field] === "" ? -1 : Number(mapping[field]);
    return index < 0 ? "" : cellText(row[index]);
  };

  const analyzeType = (row: number, rawType: string, errors: ImportErrorRow[]): TaxpayerType => {
    const normalizedType = normalizedKey(rawType);
    if (
      normalizedType.includes("entreprise") ||
      normalizedType.includes("societe") ||
      normalizedType.includes("professionnel")
    ) return "ENTREPRISE";
    if (normalizedType.includes("particulier") || normalizedType.includes("personne"))
      return "PARTICULIER";
    errors.push({
      row,
      field: "Type",
      message: "Indiquez explicitement Particulier ou Entreprise.",
    });
    return "PARTICULIER";
  };

  const checkDuplicates = (
    number: number,
    email: string,
    nif: string,
    stat: string,
    sets: { emails: Set<string>; nifs: Set<string>; stats: Set<string> },
    errors: ImportErrorRow[],
  ) => {
    let duplicate = false;
    if (email && sets.emails.has(email)) {
      duplicate = true;
      errors.push({ row: number, field: "E-mail", message: "Cette adresse apparaît plusieurs fois dans le classeur." });
    }
    if (nif && sets.nifs.has(nif)) {
      duplicate = true;
      errors.push({ row: number, field: "NIF", message: "Ce NIF apparaît plusieurs fois dans le classeur." });
    }
    if (stat && sets.stats.has(stat)) {
      duplicate = true;
      errors.push({ row: number, field: "STAT", message: "Ce STAT apparaît plusieurs fois dans le classeur." });
    }
    if (email) sets.emails.add(email);
    if (nif) sets.nifs.add(nif);
    if (stat) sets.stats.add(stat);
    return duplicate;
  };

  const checkRequiredFields = ({
    number,
    type,
    legalName,
    name,
    email,
    phone,
    address,
    region,
    city,
    errors,
  }: {
    number: number;
    type: TaxpayerType;
    legalName: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    region: string;
    city: string;
    errors: ImportErrorRow[];
  }) => {
    if (type === "ENTREPRISE" && !(legalName || name))
      errors.push({ row: number, field: "Raison sociale", message: "La raison sociale est requise." });
    if (type === "PARTICULIER" && !name)
      errors.push({ row: number, field: "Nom", message: "Le nom du contribuable est requis." });
    const atSignIndex = email.indexOf("@");
    const domain = email.slice(atSignIndex + 1);
    const indexPoint = domain.indexOf(".");
    if (
      !email ||
      atSignIndex <= 0 ||
      atSignIndex !== email.lastIndexOf("@") ||
      /\s/.test(email) ||
      indexPoint <= 0 ||
      indexPoint === domain.length - 1
    )
      errors.push({ row: number, field: "E-mail", message: "Une adresse e-mail valide est requise." });
    if (phone.length < 7)
      errors.push({ row: number, field: "Téléphone", message: "Un numéro de téléphone valide est requis." });
    if (address.length < 3)
      errors.push({ row: number, field: "Adresse", message: "Une adresse est requise." });
    if (normalizedKey(region) !== normalizedKey(SRE_REGION))
      errors.push({ row: number, field: "Région", message: `Le service est limité à ${SRE_REGION}.` });
    if (!city)
      errors.push({ row: number, field: "Ville / Commune", message: "La ville ou commune est requise." });
  };

  const analyzeRow = (
    row: (CellValue | null)[],
    index: number,
    emails: Set<string>,
    nifs: Set<string>,
    stats: Set<string>,
  ): AnalysisRow => {
    const number = index + 2;
    const values = row.map(cellText);
    const errors: ImportErrorRow[] = [];
    if (values.every((value) => !value)) return { number, values, errors, duplicate: false };
    const type = analyzeType(number, mappedValue(row, "type"), errors);
    const legalName = mappedValue(row, "raisonSociale");
    const name = mappedValue(row, "nom");
    const firstName = mappedValue(row, "prenom");
    const nif = mappedValue(row, "nif").trim().toUpperCase();
    const stat = mappedValue(row, "stat").trim().toUpperCase();
    const email = mappedValue(row, "courriel").trim().toLowerCase();
    const phone = mappedValue(row, "telephone").trim();
    const address = mappedValue(row, "adresse").trim();
    const region = mappedValue(row, "region").trim();
    const city = mappedValue(row, "ville").trim();
    checkRequiredFields({
      number,
      type,
      legalName,
      name,
      email,
      phone,
      address,
      region,
      city,
      errors,
    });
    const duplicate = checkDuplicates(number, email, nif, stat, { emails, nifs, stats }, errors);
    const tradeName = mappedValue(row, "nomCommercial").trim();
    const legalRepresentative = mappedValue(row, "representantLegal").trim();
    const profile: ImportProfile | undefined = errors.length
      ? undefined
      : {
          type,
          nom: (name || legalName).trim(),
          ...(firstName.trim() ? { prenom: firstName.trim() } : {}),
          ...(legalName.trim() ? { raisonSociale: legalName.trim() } : {}),
          ...(tradeName ? { nomCommercial: tradeName } : {}),
          ...(nif ? { nif } : {}),
          ...(stat ? { stat } : {}),
          adresse: address,
          region: SRE_REGION,
          ville: city,
          courriel: email,
          telephone: phone,
          ...(legalRepresentative ? { representantLegal: legalRepresentative } : {}),
        };
    return { number, values, profile, errors, duplicate };
  };

  const analyze = () => {
    setError("");
    setReport(null);
    if (!headers.length || !excelRows.length) {
      setError("Le classeur ne contient aucune ligne de données à analyser.");
      return;
    }
    if (!validColumns) {
      setError(
        "Mappez le type de contribuable, l’e-mail, le téléphone, l’adresse, la région et la ville/commune.",
      );
      return;
    }
    const emails = new Set<string>();
    const nifs = new Set<string>();
    const stats = new Set<string>();
    const results = excelRows
      .map((row, index) => analyzeRow(row, index, emails, nifs, stats))
      .filter((row) => row.values.some(Boolean));
    setAnalysis(results);
    setFilterRows("TOUS");
    if (!results.length) setError("Aucune ligne de données sous l’en-tête.");
  };

  const startImport = async () => {
    if (!analysis) return;
    if (!session?.apiToken) {
      setError("Session serveur introuvable. Reconnectez-vous.");
      return;
    }
    const profiles = analysis.flatMap((row) =>
      row.profile && !row.duplicate && !row.errors.length ? [row.profile] : [],
    );
    if (!profiles.length) {
      setError("Aucune ligne valide à importer.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await callApi<{
        donnees: ApiTaxpayer[];
        creees: number;
        ignorees: number;
        comptesCrees: number;
        doublons: number;
        rejetees: number;
        emails: {
          compteId: string;
          destinataire: string;
          statutCourriel: string;
          demandeId: string | null;
        }[];
      }>("contribuables/import", { method: "POST", token: session.apiToken, body: { profils: profiles } });
      const profilesCreated = result.donnees.map((entry) => mapApiTaxpayer(entry));
      updateState((current) => ({
        ...current,
        taxpayers: [...profilesCreated, ...current.taxpayers],
      }));
      setEmailsImport(result.emails ?? []);
      const locallyIgnoredRows = analysis.filter(
        (row) => !row.profile || row.duplicate || row.errors.length,
      ).length;
      const errors = analysis.flatMap((row) => row.errors);
      if (result.rejetees)
        errors.push({
          row: 0,
          message: `${result.rejetees} ligne(s) rejetée(s) par le serveur (informations manquantes ou invalides).`,
        });
      if (result.doublons)
        errors.push({
          row: 0,
          message: `${result.doublons} doublon(s) détecté(s) (e-mail, NIF ou STAT déjà enregistrés) — aucune création en double.`,
        });
      const newDuplicates = analysis.filter((row) => row.duplicate).length;
      const ignoredTotal = locallyIgnoredRows + result.ignorees;
      let importStatus: ImportHistoryEntry["status"];
      if (ignoredTotal === 0) {
        importStatus = "TERMINE";
      } else if (result.creees > 0) {
        importStatus = "PARTIEL";
      } else {
        importStatus = "ERREUR";
      }
      const importReport: ImportHistoryEntry = {
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
        fileName: fileName,
        date: new Date().toISOString(),
        analyzed: analysis.length,
        created: result.creees,
        ignored: ignoredTotal,
        duplicates: newDuplicates + result.ignorees,
        errors,
        status: importStatus,
      };
      setReport(importReport);
      notify(
        `${result.creees} profil(s) créé(s), dont ${result.comptesCrees ?? 0} compte(s) entreprise(s) avec e-mail d’activation.`,
        result.creees ? "success" : "warning",
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Le serveur n’a pas effectué l’import.",
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSheets([]);
    setSheetName("");
    setFileName("");
    setHeaders([]);
    setExcelRows([]);
    setMapping(mappingEmpty);
    setAnalysis(null);
    setError("");
    setReport(null);
    setEmailsImport([]);
  };

  /** Retry sending a failed first-sign-in e-mail (reissued token). */
  const resendEmail = async (requestId: string, recipient: string) => {
    if (!session?.apiToken) return;
    setResendInProgress(requestId);
    try {
      const result = await callApi<{ statutCourriel: string }>(
        `utilisateurs/emails-activation/${encodeURIComponent(requestId)}/renvoyer`,
        { method: "POST", token: session.apiToken },
      );
      setEmailsImport((current) =>
        current.map((email) =>
          email.demandeId === requestId
            ? { ...email, statutCourriel: result.statutCourriel }
            : email,
        ),
      );
      notify(
        result.statutCourriel === "ENVOYEE"
          ? `E-mail renvoyé à ${recipient}.`
          : `L'envoi à ${recipient} a de nouveau échoué.`,
        result.statutCourriel === "ENVOYEE" ? "success" : "error",
      );
    } catch (cause) {
      notify(
        cause instanceof Error ? cause.message : "Le renvoi a échoué.",
        "error",
      );
    } finally {
      setResendInProgress(null);
    }
  };

  return (
    <div className="page-content-sre">
      <PageHeader
        title="Import Excel"
        description={`Importez des profils contribuables de ${SRE_REGION} après aperçu et validation des lignes.`}
        breadcrumb={["Accueil", "Import Excel"]}
      />
      {!sheets.length ? (
        <section className="card-sre excel-drop-zone-sre">
          <span className="excel-drop-zone-sre__icon">
            <FileSpreadsheet size={26} />
          </span>
          <h2>Sélectionner un classeur Excel</h2>
          <p>
            Importez un fichier .xlsx avec une ligne d’en-tête. Vous pourrez choisir la feuille,
            mapper les colonnes et valider les lignes avant l’enregistrement serveur.
          </p>
          <label className="button-sre button-sre--primary" aria-disabled={loading}>
            <Upload size={15} aria-hidden="true" /> Choisir un fichier .xlsx
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={readFile}
              disabled={loading}
            />
          </label>
          <a
            className="import-template-link-sre"
            href="/modele-import-contribuables-sre.xlsx"
            download
          >
            <ArrowDownToLine size={14} /> Télécharger le modèle vierge (sans exemple)
          </a>
          {loading && (
            <p className="secondary-text-sre flex items-center gap-2" aria-live="polite">
              <CoreSpinLoader label="Lecture du classeur…" size={16} compact />
              Lecture du classeur…
            </p>
          )}
          {error && (
            <p className="error-message-sre" role="alert">
              {error}
            </p>
          )}
          <div className="import-help-sre">
            <strong>Colonnes à mapper :</strong>
            <p>
              Nom ou raison sociale, e-mail, téléphone, adresse, région {SRE_REGION} et
              ville/commune. NIF et STAT restent facultatifs.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="card-sre file-import-sre">
            <div>
              <span className="file-icon-sre">
                <FileSpreadsheet size={19} />
              </span>
              <div>
                <strong>{fileName}</strong>
                <small>
                  {excelRows.length} ligne(s) de données · {sheets.length} feuille(s)
                </small>
              </div>
            </div>
            <div className="table-actions-sre">
              {sheets.length > 1 && (
                <label className="compact-filter-sre">
                  Feuille
                  <Select
                    value={sheetName}
                    onChange={(event) => chooseSheet(event.target.value)}
                  >
                    {sheets.map((sheet) => (
                      <option key={sheet.sheet} value={sheet.sheet}>
                        {sheet.sheet}
                      </option>
                    ))}
                  </Select>
                </label>
              )}
              <Button variant="outline" size="small" onClick={reset}>
                <RotateCcw size={14} /> Remplacer le fichier
              </Button>
            </div>
          </section>
          {error && (
            <p className="error-message-sre" role="alert">
              {error}
            </p>
          )}
          <section className="card-sre">
            <div className="card-sre__header">
              <div>
                <h2>1. Mapper les colonnes</h2>
                <p>Les champs requis sont indiqués. La région doit correspondre à {SRE_REGION}.</p>
              </div>
              <span className="import-step-badge-sre">1 / 3</span>
            </div>
            <div className="excel-mapping-grid-sre">
              {MAPPING_FIELDS.map(({ field, label, required }) => (
                <label key={field}>
                  {label}
                  {required && <em> requis</em>}
                  <Select
                    className="field-simple-sre"
                    value={mapping[field]}
                    onChange={(event) => changeMapping(field, event.target.value)}
                  >
                    <option value="">Non mappé</option>
                    {headers.map((header, index) => (
                      <option key={`${index}-${header}`} value={String(index)}>
                        {header}
                      </option>
                    ))}
                  </Select>
                </label>
              ))}
            </div>
          </section>
          <section className="card-sre">
            <div className="card-sre__header">
              <div>
                <h2>2. Aperçu des données</h2>
                <p>Les premières lignes de la feuille « {sheetName} »</p>
              </div>
              <span className="import-step-badge-sre">
                {Math.min(5, excelRows.length)} / {excelRows.length}
              </span>
            </div>
            <div className="table-scroll-sre">
              <table className="table-sre excel-preview-table-sre">
                <thead>
                  <tr>
                    <th>Ligne</th>
                    {headers.slice(0, 8).map((header, index) => (
                      <th key={`${index}-${header}`}>{header}</th>
                    ))}
                    {headers.length > 8 && <th>…</th>}
                  </tr>
                </thead>
                <tbody>
                  {(activeSheet?.data.slice(1, 6) ?? []).map((row, index) => (
                    <tr key={`${index + 2}-${JSON.stringify(row)}`}>
                      <td data-label="Ligne Excel">{index + 2}</td>
                      {headers.slice(0, 8).map((header, cell) => (
                        <td
                          data-label={header || `Colonne ${cell + 1}`}
                          key={header || `column-${cell + 1}`}
                        >
                          {cellText(row[cell]) || "—"}
                        </td>
                      ))}
                      {headers.length > 8 && <td data-label="Autres colonnes">…</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="page-bottom-actions-sre">
              <Button onClick={analyze} disabled={loading || !validColumns}>
                <CheckCircle2 size={15} /> 3. Analyser et valider
              </Button>
            </div>
          </section>
          {analysis && (
            <section className="card-sre analysis-result-sre">
              <div className="card-sre__header">
                <div>
                  <h2>Résultat de l’analyse</h2>
                  <p>
                    {analysis.length} ligne(s) non vides examinées. Rien n’est enregistré avant
                    confirmation.
                  </p>
                </div>
                <label className="compact-filter-sre">
                  Afficher
                  <Select
                    value={filterRows}
                    onChange={(event) => setFilterRows(event.target.value)}
                  >
                    <option value="TOUS">Toutes</option>
                    <option value="VALIDES">Valides</option>
                    <option value="DOUBLONS">Doublons</option>
                    <option value="ERREURS">Erreurs</option>
                  </Select>
                </label>
              </div>
              <div className="import-analysis-summary-sre">
                <div className="import-analysis-summary-sre__valid">
                  <strong>{analysis.filter((row) => row.profile).length}</strong>
                  <span>Prêtes à importer</span>
                </div>
                <div className="import-analysis-summary-sre__duplicate">
                  <strong>{analysis.filter((row) => row.duplicate).length}</strong>
                  <span>Doublons dans le fichier</span>
                </div>
                <div className="import-analysis-summary-sre__error">
                  <strong>
                    {analysis.filter((row) => row.errors.length && !row.duplicate).length}
                  </strong>
                  <span>Lignes en erreur</span>
                </div>
              </div>
              <div className="table-scroll-sre">
                <table className="table-sre">
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
                    {analyzedRows.slice(0, 100).map((row) => {
                      let resultStatus = "ACTIF";
                      if (row.errors.length) {
                        resultStatus = "ERREUR";
                      }
                      if (row.duplicate) {
                        resultStatus = "REJETE";
                      }

                      return (
                      <tr key={row.number}>
                        <td data-label="Ligne Excel">{row.number}</td>
                        <td data-label="Type">{row.profile ? <StatusBadge status={row.profile.type} /> : "—"}</td>
                        <td data-label="Nom / raison sociale">
                          {row.profile?.raisonSociale ||
                            `${row.profile?.prenom ?? ""} ${row.profile?.nom ?? ""}`.trim() ||
                            "—"}
                        </td>
                        <td data-label="NIF">{row.profile?.nif ?? "—"}</td>
                        <td data-label="E-mail">{row.profile?.courriel ?? "—"}</td>
                        <td data-label="Résultat">
                          <StatusBadge status={resultStatus} />
                        </td>
                        <td data-label="Motif">
                          {row.errors.map((rowError) => (
                            <small
                              key={`${row.number}-${rowError.field ?? ""}-${rowError.message}`}
                              className="import-row-error-sre"
                            >
                              {rowError.field ? `${rowError.field} : ` : ""}
                              {rowError.message}
                            </small>
                          ))}
                          {!row.errors.length && !row.duplicate && (
                            <span className="success-text-sre">Prête à enregistrer</span>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
                {analyzedRows.length > 100 && (
                  <p className="secondary-text-sre">
                    Les 100 premières lignes filtrées sont affichées. L’analyse porte sur toute la
                    feuille.
                  </p>
                )}
              </div>
              <div className="page-bottom-actions-sre">
                <Button variant="outline" onClick={analyze}>
                  Relancer la validation
                </Button>
                <Button
                  onClick={() => void startImport()}
                  disabled={
                    analysis.every(
                      (row) => !row.profile || row.duplicate || row.errors.length > 0,
                    )
                  }
                  loading={loading}
                >
                  {loading ? (
                    "Enregistrement…"
                  ) : (
                    <>
                      Enregistrer les profils valides (
                      {
                        analysis.filter(
                          (row) => row.profile && !row.duplicate && !row.errors.length,
                        ).length
                      }
                      ) <ArrowRight size={15} />
                    </>
                  )}
                </Button>
              </div>
              {error && (
                <p className="error-message-sre" role="alert">
                  {error}
                </p>
              )}
            </section>
          )}
        </>
      )}
      {report && (
        <section className="card-sre import-report-sre">
          <div className="card-sre__header">
            <div>
              <h2>Rapport de l’import</h2>
              <p>
                {report.fileName} · {formatDate(report.date, true)}
              </p>
            </div>
            <StatusBadge status={report.status} />
          </div>
          <div className="import-analysis-summary-sre">
            <div className="import-analysis-summary-sre__valid">
              <strong>{report.created}</strong>
              <span>Profils créés</span>
            </div>
            <div>
              <strong>{report.analyzed}</strong>
              <span>Lignes analysées</span>
            </div>
            <div className="import-analysis-summary-sre__duplicate">
              <strong>{report.duplicates}</strong>
              <span>Doublons détectés</span>
            </div>
            <div className="import-analysis-summary-sre__error">
              <strong>{report.ignored}</strong>
              <span>Lignes ignorées</span>
            </div>
          </div>
          {report.errors.length > 0 && (
            <details className="import-error-details-sre">
              <summary>
                <CircleAlert size={15} /> Afficher les erreurs et doublons ({report.errors.length}
                )
              </summary>
              <ul>
                {report.errors.slice(0, 100).map((row, index) => {
                  const rowPrefix = row.row > 0 ? `Ligne ${row.row}` : "";
                  const field = row.row > 0 && row.field ? ` · ${row.field}` : "";
                  const separator = row.row > 0 ? " — " : "";

                  return (
                    <li key={`${row.row}-${index}`}>
                      {rowPrefix}
                      {field}
                      {separator}
                      {row.message}
                    </li>
                  );
                })}
              </ul>
            </details>
          )}
          <div className="security-note-sre">
            <ShieldCheck size={16} />
            <p>
              <strong>Import terminé par le serveur.</strong>
              <span>
                Les comptes entreprise créés doivent terminer leur configuration initiale (nouveau
                mot de passe + profil) avant d’accéder aux fonctionnalités ; le mot de passe
                provisoire est invalidé à cette étape.
              </span>
            </p>
          </div>
          {emailsImport.length > 0 && (
            <div className="activation-emails-report-sre">
              <strong>
                <MailCheck size={15} aria-hidden="true" /> E-mails de première connexion (
                {emailsImport.filter((e) => e.statutCourriel === "ENVOYEE").length} envoyé(s),{" "}
                {emailsImport.filter((e) => e.statutCourriel === "ECHEC").length} en échec)
              </strong>
              <ul>
                {emailsImport.map((email) => {
                  const emailBadgeClassName =
                    email.statutCourriel === "ENVOYEE"
                      ? "badge-sre badge-sre--success"
                      : email.statutCourriel === "ECHEC"
                        ? "badge-sre badge-sre--error"
                        : "badge-sre badge-sre--attention";

                  return (
                    <li key={email.compteId}>
                      <span>{email.destinataire}</span>
                      <span className={emailBadgeClassName}>
                        {email.statutCourriel === "ENVOYEE"
                          ? "Envoyé"
                          : email.statutCourriel === "ECHEC"
                            ? "Échec"
                            : "En attente"}
                      </span>
                      {email.statutCourriel === "ECHEC" && email.demandeId && (
                        <button
                          type="button"
                          className="button-sre button-sre--outline button-sre--small"
                          disabled={resendInProgress === email.demandeId}
                          onClick={() => resendEmail(email.demandeId as string, email.destinataire)}
                        >
                          {resendInProgress === email.demandeId ? "Envoi…" : "Renvoyer"}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
