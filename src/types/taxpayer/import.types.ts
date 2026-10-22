export interface ImportErrorRow {
  row: number;
  field?: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface ImportHistoryEntry {
  id: string;
  fileName: string;
  date: string;
  analyzed: number;
  created: number;
  ignored: number;
  duplicates: number;
  errors: ImportErrorRow[];
  status: "TERMINE" | "PARTIEL" | "ERREUR";
}
