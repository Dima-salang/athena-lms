/**
 * Excel / CSV Roster Import & Export Engine
 *
 * Roster Import:
 *  - Parses .xlsx and .csv class lists into StudentRecord objects
 *  - Validates required columns, LRN format, duplicate detection
 *  - Returns detailed validation errors per row
 *
 * Gradebook Export:
 *  - Generates a formatted Excel workbook from submission data
 *  - Includes raw scores, transmuted grades, and pass/fail status
 *
 * Uses SheetJS (xlsx) which is injectable for unit testing.
 */

import * as XLSX from "xlsx";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StudentRecord {
  lrn: string;
  firstName: string;
  lastName: string;
  section: string;
  email?: string;
}

export interface RosterValidationError {
  row: number;
  field: string;
  message: string;
}

export interface RosterParseResult {
  records: StudentRecord[];
  errors: RosterValidationError[];
  totalRows: number;
  validCount: number;
}

export interface GradebookRow {
  studentName: string;
  lrn: string;
  section: string;
  rawScore: number | null;
  totalPoints: number;
  rawPercent: string;
  transmutedGrade: number | null;
  status: string;
  submittedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Roster Parsing
// ─────────────────────────────────────────────────────────────────────────────

const REQUIRED_COLUMNS = ["lrn", "firstname", "lastname", "section"];

const LRN_REGEX = /^\d{12}$/;

/**
 * Parse an Excel or CSV file buffer into StudentRecord objects.
 * Performs comprehensive validation including:
 *  - Required column presence
 *  - LRN format (12-digit numeric)
 *  - Duplicate LRN detection within the file
 *  - Email format validation
 */
export function parseRosterFile(buffer: ArrayBuffer | Buffer): RosterParseResult {
  const isBuf = typeof Buffer !== "undefined" && Buffer.isBuffer(buffer);
  const workbook = isBuf
    ? XLSX.read(buffer, { type: "buffer" })
    : XLSX.read(new Uint8Array(buffer), { type: "array" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return {
      records: [],
      errors: [{ row: 0, field: "file", message: "The file contains no sheets." }],
      totalRows: 0,
      validCount: 0,
    };
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, {
    raw: false,
    defval: "",
  });

  if (rawRows.length === 0) {
    return {
      records: [],
      errors: [{ row: 0, field: "file", message: "The file is empty or has no data rows." }],
      totalRows: 0,
      validCount: 0,
    };
  }

  // Normalize column keys: lowercase, strip whitespace
  const normalizeKey = (k: string) => k.toLowerCase().replace(/\s/g, "");
  const sampleRow = rawRows[0];
  const rawHeaders = Object.keys(sampleRow).map(normalizeKey);

  // Check required columns
  const missingColumns = REQUIRED_COLUMNS.filter((c) => !rawHeaders.includes(c));
  if (missingColumns.length > 0) {
    return {
      records: [],
      errors: [
        {
          row: 0,
          field: "headers",
          message: `Missing required columns: ${missingColumns.join(", ")}. Expected: LRN, FirstName, LastName, Section`,
        },
      ],
      totalRows: rawRows.length,
      validCount: 0,
    };
  }

  const records: StudentRecord[] = [];
  const errors: RosterValidationError[] = [];
  const seenLrns = new Set<string>();

  rawRows.forEach((rawRow, index) => {
    const rowNum = index + 2; // 1-indexed + header row
    const normalizedRow: Record<string, string> = {};
    for (const [k, v] of Object.entries(rawRow)) {
      normalizedRow[normalizeKey(k)] = String(v).trim();
    }

    const lrn = normalizedRow["lrn"] ?? "";
    const firstName = normalizedRow["firstname"] ?? "";
    const lastName = normalizedRow["lastname"] ?? "";
    const section = normalizedRow["section"] ?? "";
    const email = normalizedRow["email"] ?? "";

    let rowHasError = false;

    if (!lrn) {
      errors.push({ row: rowNum, field: "lrn", message: "LRN is required." });
      rowHasError = true;
    } else if (!LRN_REGEX.test(lrn)) {
      errors.push({ row: rowNum, field: "lrn", message: `LRN "${lrn}" is invalid. Must be exactly 12 digits.` });
      rowHasError = true;
    } else if (seenLrns.has(lrn)) {
      errors.push({ row: rowNum, field: "lrn", message: `LRN "${lrn}" is duplicated in the file.` });
      rowHasError = true;
    } else {
      seenLrns.add(lrn);
    }

    if (!firstName) {
      errors.push({ row: rowNum, field: "firstname", message: "First Name is required." });
      rowHasError = true;
    }

    if (!lastName) {
      errors.push({ row: rowNum, field: "lastname", message: "Last Name is required." });
      rowHasError = true;
    }

    if (!section) {
      errors.push({ row: rowNum, field: "section", message: "Section is required." });
      rowHasError = true;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ row: rowNum, field: "email", message: `Email "${email}" has an invalid format.` });
      rowHasError = true;
    }

    if (!rowHasError) {
      records.push({ lrn, firstName, lastName, section, email: email || undefined });
    }
  });

  return {
    records,
    errors,
    totalRows: rawRows.length,
    validCount: records.length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Gradebook Export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a formatted Excel gradebook workbook.
 * Returns a Buffer that can be sent as a file download.
 */
export function generateGradebookExcel(
  testTitle: string,
  rows: GradebookRow[]
): Buffer {
  const worksheetData = [
    // Title row
    [`${testTitle} — Class Gradebook`],
    [`Generated: ${new Date().toLocaleDateString("en-PH")}`],
    [],
    // Headers
    [
      "#",
      "Student Name",
      "LRN",
      "Section",
      "Raw Score",
      "Total Points",
      "Raw %",
      "Transmuted Grade",
      "Status",
      "Submitted At",
    ],
    // Data rows
    ...rows.map((row, i) => [
      i + 1,
      row.studentName,
      row.lrn,
      row.section,
      row.rawScore ?? "N/A",
      row.totalPoints,
      row.rawPercent,
      row.transmutedGrade ?? "Pending",
      row.status,
      row.submittedAt,
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Column widths
  worksheet["!cols"] = [
    { wch: 5 },  // #
    { wch: 25 }, // Student Name
    { wch: 15 }, // LRN
    { wch: 20 }, // Section
    { wch: 12 }, // Raw Score
    { wch: 12 }, // Total Points
    { wch: 10 }, // Raw %
    { wch: 18 }, // Transmuted Grade
    { wch: 12 }, // Status
    { wch: 20 }, // Submitted At
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Gradebook");

  return Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
}

/**
 * Generate a blank roster template for admins to fill in.
 *
 * The header row uses exactly the columns `parseRosterFile` requires, so a
 * filled-in template always imports. Two example rows are included and a notes
 * sheet carries the rules (they are ignored on import because parsing reads the
 * first sheet only).
 */
export function generateRosterTemplateExcel(): Buffer {
  const worksheetData = [
    ["LRN", "FirstName", "LastName", "Section", "Email"],
    ["123456789012", "Juan", "Dela Cruz", "Grade 10 - Aristotle", ""],
    ["123456789013", "Ana", "Reyes", "Grade 10 - Aristotle", "ana.reyes@example.com"],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  worksheet["!cols"] = [
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
    { wch: 26 },
    { wch: 28 },
  ];

  const notes = XLSX.utils.aoa_to_sheet([
    ["How to fill in this class list"],
    [],
    ["LRN", "Exactly 12 digits. This is also the student's first password."],
    ["FirstName", "Given name."],
    ["LastName", "Family name."],
    ["Section", "The section name. It is created automatically if it does not exist."],
    ["Email", "Optional. Leave blank if the student has no email."],
    [],
    ["Delete the example rows before importing."],
    ["Keep the header row exactly as it is."],
  ]);
  notes["!cols"] = [{ wch: 14 }, { wch: 70 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Class list");
  XLSX.utils.book_append_sheet(workbook, notes, "Instructions");

  return Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
}

/**
 * Generate a credentials summary Excel file for newly provisioned students.
 * Designed to be printed/distributed by the admin/adviser.
 */
export function generateCredentialsSummaryExcel(
  students: Array<{ name: string; username: string; temporaryPassword: string; lrn: string }>
): Buffer {
  const worksheetData = [
    ["Athena LMS — Student Account Credentials"],
    [`Generated: ${new Date().toLocaleDateString("en-PH")}`],
    ["IMPORTANT: Students must change their password upon first login."],
    [],
    ["Student Name", "Username", "Temporary Password", "LRN"],
    ...students.map((s) => [s.name, s.username, s.temporaryPassword, s.lrn]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  worksheet["!cols"] = [
    { wch: 25 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Credentials");

  return Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Item Analysis Export
// ─────────────────────────────────────────────────────────────────────────────

export interface ItemAnalysisExportRow {
  questionNumber: number;
  questionText: string;
  questionType: string;
  fullPoints: number;
  correctCount: number;
  wrongCount: number;
  totalResponses: number;
  percentCorrect: number;
  difficultyIndex: number;
  difficultyCategory: string;
  discriminationIndex: number;
  discriminationCategory: string;
}

/**
 * Generate an Excel workbook summarising how many students answered each item
 * correctly vs incorrectly, with the advanced indices as extra columns.
 */
export function generateItemAnalysisExcel(
  testTitle: string,
  rows: ItemAnalysisExportRow[]
): Buffer {
  const worksheetData = [
    [`${testTitle} — Item Analysis`],
    [`Generated: ${new Date().toLocaleDateString("en-PH")}`],
    [],
    [
      "#",
      "Question",
      "Type",
      "Points",
      "Correct",
      "Wrong",
      "Total Responses",
      "% Correct",
      "Difficulty (P)",
      "Difficulty",
      "Discrimination (D)",
      "Discrimination",
    ],
    ...rows.map((row) => [
      row.questionNumber,
      row.questionText,
      row.questionType,
      row.fullPoints,
      row.correctCount,
      row.wrongCount,
      row.totalResponses,
      `${row.percentCorrect}%`,
      row.difficultyIndex,
      row.difficultyCategory,
      row.discriminationIndex,
      row.discriminationCategory,
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  worksheet["!cols"] = [
    { wch: 5 },
    { wch: 50 },
    { wch: 16 },
    { wch: 8 },
    { wch: 9 },
    { wch: 8 },
    { wch: 16 },
    { wch: 11 },
    { wch: 13 },
    { wch: 12 },
    { wch: 16 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Item Analysis");

  return Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
}
