/**
 * CSV generation
 *
 * Small, dependency-free builder following RFC 4180 quoting. Used by the admin
 * user-list export; kept separate from the xlsx helpers so it can be unit
 * tested without a spreadsheet library involved.
 */

/** UTF-8 byte order mark — makes Excel read the file as UTF-8. */
export const CSV_BOM = "\uFEFF";

/** Escape one cell: quote when it contains a comma, quote or newline. */
export function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Build a CSV document (CRLF line endings, header row first). */
export function toCsv(
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>
): string {
  return [headers, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
}
