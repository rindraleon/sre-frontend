import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import readXlsxFile, { type CellValue, type Sheet } from "read-excel-file/browser";
import type { ImportErrorRow, ImportHistoryEntry } from "@/types";
import { useAuth } from "@/contexts";
import { useSre } from "@/contexts";
import { importTaxpayersApi, mapApiTaxpayer } from "@/services/taxpayers";
import { resendActivationEmailApi } from "@/services/user";
import {
  analyzeWorkbook,
  detectMapping,
  isMappingComplete,
  selectImportableProfiles,
  type AnalysisFilter,
} from "@/utils";
import {
  cellText,
  mappingEmpty,
  type AnalysisRow,
  type Mappings,
  type MappingField,
} from "@/utils";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_ROWS_PER_SHEET = 2_000;

export interface ActivationEmailResult {
  compteId: string;
  destinataire: string;
  statutCourriel: string;
  demandeId: string | null;
}

export function useTaxpayerImport() {
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
  const [emails, setEmails] = useState<ActivationEmailResult[]>([]);
  const [resendInProgress, setResendInProgress] = useState<string | null>(null);
  const [filter, setFilter] = useState<AnalysisFilter>("TOUS");

  const activeSheet = sheets.find((sheet) => sheet.sheet === sheetName);
  const isMappingValid = useMemo(() => isMappingComplete(mapping), [mapping]);

  const initializeSheet = useCallback((sheet: Sheet) => {
    const rows = sheet.data ?? [];
    const sheetHeaders = (rows[0] ?? []).map(
      (cell, index) => cellText(cell) || `Colonne ${index + 1}`,
    );
    setSheetName(sheet.sheet);
    setHeaders(sheetHeaders);
    setExcelRows(rows.slice(1));
    setMapping(detectMapping(sheetHeaders));
    setAnalysis(null);
    setReport(null);
    setFilter("TOUS");
  }, []);

  const readFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
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
      if (file.size > MAX_FILE_BYTES) {
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
        if (nonEmptySheets.some((sheet) => sheet.data.length > MAX_ROWS_PER_SHEET + 1)) {
          setError("La limite est de 2 000 lignes de données par feuille.");
          setSheets([]);
          return;
        }
        setSheets(nonEmptySheets);
        initializeSheet(nonEmptySheets[0]);
      } catch (cause) {
        console.error("Lecture du classeur Excel impossible.", cause);
        setError(
          "Impossible de lire ce classeur. Vérifiez qu’il s’agit d’un fichier .xlsx valide, puis réessayez.",
        );
        setSheets([]);
      } finally {
        setLoading(false);
      }
    },
    [initializeSheet],
  );

  const chooseSheet = useCallback(
    (name: string) => {
      const sheet = sheets.find((entry) => entry.sheet === name);
      if (sheet) initializeSheet(sheet);
    },
    [sheets, initializeSheet],
  );

  const changeMapping = useCallback((field: MappingField, value: string) => {
    setMapping((current) => ({ ...current, [field]: value }));
    setAnalysis(null);
    setReport(null);
  }, []);

  const analyze = useCallback(() => {
    setError("");
    setReport(null);
    if (!headers.length || !excelRows.length) {
      setError("Le classeur ne contient aucune ligne de données à analyser.");
      return;
    }
    if (!isMappingValid) {
      setError(
        "Mappez le type, le NIF, l’e-mail, le téléphone, l’adresse, la région et la ville/commune.",
      );
      return;
    }
    const results = analyzeWorkbook(excelRows, mapping);
    setAnalysis(results);
    setFilter("TOUS");
    if (!results.length) setError("Aucune ligne de données sous l’en-tête.");
  }, [headers.length, excelRows, isMappingValid, mapping]);

  const startImport = useCallback(async () => {
    if (!analysis) return;
    if (!session?.apiToken) {
      setError("Session serveur introuvable. Reconnectez-vous.");
      return;
    }
    const profiles = selectImportableProfiles(analysis);
    if (!profiles.length) {
      setError("Aucune ligne valide à importer.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const result = await importTaxpayersApi(session.apiToken, profiles);
      const createdProfiles = result.donnees.map((entry) => mapApiTaxpayer(entry));
      updateState((current) => ({
        ...current,
        taxpayers: [...createdProfiles, ...current.taxpayers],
      }));
      setEmails(result.emails ?? []);

      const locallyIgnoredRows = analysis.filter(
        (row) => !row.profile || row.duplicate || row.errors.length,
      ).length;
      const errors: ImportErrorRow[] = analysis.flatMap((row) => row.errors);
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
      const status: ImportHistoryEntry["status"] =
        ignoredTotal === 0 ? "TERMINE" : result.creees > 0 ? "PARTIEL" : "ERREUR";

      setReport({
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
        fileName,
        date: new Date().toISOString(),
        analyzed: analysis.length,
        created: result.creees,
        ignored: ignoredTotal,
        duplicates: newDuplicates + result.ignorees,
        status,
        errors,
      });
      notify(
        `${result.creees} profil(s) créé(s), dont ${result.comptesCrees ?? 0} compte(s) entreprise(s) avec e-mail d’activation.`,
        result.creees ? "success" : "warning",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Le serveur n’a pas effectué l’import.");
    } finally {
      setLoading(false);
    }
  }, [analysis, session?.apiToken, updateState, notify, fileName]);

  const reset = useCallback(() => {
    setSheets([]);
    setSheetName("");
    setFileName("");
    setHeaders([]);
    setExcelRows([]);
    setMapping(mappingEmpty);
    setAnalysis(null);
    setError("");
    setReport(null);
    setEmails([]);
    setFilter("TOUS");
  }, []);

  const resendEmail = useCallback(
    async (requestId: string, recipient: string) => {
      if (!session?.apiToken) return;
      setResendInProgress(requestId);
      try {
        const result = await resendActivationEmailApi(session.apiToken, requestId);
        setEmails((current) =>
          current.map((email) =>
            email.demandeId === requestId
              ? { ...email, statutCourriel: result.statutCourriel }
              : email,
          ),
        );
        notify(`E-mail renvoyé à ${recipient}.`, "success");
      } catch (cause) {
        notify(cause instanceof Error ? cause.message : "Le renvoi a échoué.", "error");
      } finally {
        setResendInProgress(null);
      }
    },
    [session?.apiToken, notify],
  );

  return {
    sheets,
    sheetName,
    fileName,
    headers,
    excelRows,
    mapping,
    analysis,
    error,
    loading,
    report,
    emails,
    resendInProgress,
    filter,
    activeSheet,
    isMappingValid,
    readFile,
    chooseSheet,
    changeMapping,
    analyze,
    startImport,
    reset,
    resendEmail,
    setFilter,
  };
}
