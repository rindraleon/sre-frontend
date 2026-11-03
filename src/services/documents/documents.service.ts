import { fetchFileApi, saveBlob, sanitizeFilename } from "@/services/api";

export async function downloadPdfApi(
  documentId: string,
  token: string,
  number: string,
): Promise<void> {
  const { blob, filename } = await fetchFileApi(`documents/${encodeURIComponent(documentId)}/pdf`, {
    token,
    accept: "application/pdf",
    expectedType: "pdf",
  });
  saveBlob(blob, filename ?? `${sanitizeFilename(number)}.pdf`);
}
