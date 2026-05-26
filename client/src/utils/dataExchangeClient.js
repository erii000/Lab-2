/**
 * Browser helpers for admin export download and JSON import files.
 */

export function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/**
 * @param {File} file
 * @returns {Promise<unknown[]>}
 */
export async function parseImportJsonFile(file) {
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("File must be valid JSON.");
  }

  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.items)) return parsed.items;
  if (parsed && Array.isArray(parsed.rows)) return parsed.rows;
  if (parsed && typeof parsed === "object") return [parsed];

  throw new Error("JSON must be an array of rows or { items: [...] }.");
}

/**
 * @param {unknown} body
 */
export function formatImportResultMessage(body) {
  if (!body || typeof body !== "object") return "Import completed.";
  const inserted = body.inserted ?? body.Inserted;
  if (typeof inserted === "number") return `Imported ${inserted} row(s).`;
  if (Array.isArray(body.ids)) return `Imported ${body.ids.length} row(s).`;
  return "Import completed.";
}

/**
 * @param {import('../api/dataExchangeApi.js').DataExchangeResource} resource
 * @param {typeof import('../api/dataExchangeApi.js').DATA_EXCHANGE_RESOURCES} catalog
 */
export function getResourceMeta(resource, catalog) {
  return catalog.find((r) => r.id === resource) ?? null;
}
