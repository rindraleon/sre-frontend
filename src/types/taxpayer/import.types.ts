export interface ImportErrorRow {
  ligne: number;
  champ?: string;
  message: string;
  donnees?: Record<string, unknown>;
}

export interface ImportHistoryEntry {
  id: string;
  nomFichier: string;
  date: string;
  analysees: number;
  creees: number;
  ignorees: number;
  doublons: number;
  erreurs: ImportErrorRow[];
  statut: "TERMINE" | "PARTIEL" | "ERREUR";
}
