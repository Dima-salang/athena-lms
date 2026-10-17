import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import {
  parseRosterFile,
  generateGradebookExcel,
  generateCredentialsSummaryExcel,
  type GradebookRow,
} from "../excel";

function createMockWorkbookBuffer(data: Array<Array<string | number>>): Buffer {
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

describe("Excel Roster Parsing", () => {
  it("parses valid student records successfully", () => {
    const rawData = [
      ["LRN", "FirstName", "LastName", "Section", "Email"],
      ["100000000001", "Juan", "Dela Cruz", "Grade 10 - Aristotle", "juan@test.com"],
      ["100000000002", "Maria", "Santos", "Grade 10 - Aristotle", "maria@test.com"],
    ];

    const buffer = createMockWorkbookBuffer(rawData);
    const result = parseRosterFile(buffer);

    expect(result.errors).toHaveLength(0);
    expect(result.validCount).toBe(2);
    expect(result.records[0].lrn).toBe("100000000001");
    expect(result.records[0].firstName).toBe("Juan");
    expect(result.records[1].lastName).toBe("Santos");
  });

  it("fails if required columns are missing", () => {
    const rawData = [
      ["FirstName", "LastName"], // Missing LRN, Section
      ["Juan", "Dela Cruz"],
    ];

    const buffer = createMockWorkbookBuffer(rawData);
    const result = parseRosterFile(buffer);

    expect(result.validCount).toBe(0);
    expect(result.errors[0].field).toBe("headers");
    expect(result.errors[0].message).toContain("Missing required columns");
  });

  it("flags invalid LRN formats (must be exactly 12 digits)", () => {
    const rawData = [
      ["LRN", "FirstName", "LastName", "Section"],
      ["12345", "Short", "LRN", "Section A"], // 5 digits
      ["100000000001", "Valid", "Student", "Section A"],
    ];

    const buffer = createMockWorkbookBuffer(rawData);
    const result = parseRosterFile(buffer);

    expect(result.validCount).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe("lrn");
  });

  it("detects duplicate LRNs in the same file", () => {
    const rawData = [
      ["LRN", "FirstName", "LastName", "Section"],
      ["100000000001", "Student", "One", "Section A"],
      ["100000000001", "Student", "Two", "Section A"], // Duplicate LRN
    ];

    const buffer = createMockWorkbookBuffer(rawData);
    const result = parseRosterFile(buffer);

    expect(result.validCount).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain("duplicated");
  });

  it("flags invalid email format", () => {
    const rawData = [
      ["LRN", "FirstName", "LastName", "Section", "Email"],
      ["100000000001", "Student", "One", "Section A", "not-an-email"],
    ];

    const buffer = createMockWorkbookBuffer(rawData);
    const result = parseRosterFile(buffer);

    expect(result.validCount).toBe(0);
    expect(result.errors[0].field).toBe("email");
  });
});

describe("Excel Export Generation", () => {
  it("generates a valid Gradebook Excel workbook buffer", () => {
    const rows: GradebookRow[] = [
      {
        studentName: "Dela Cruz, Juan",
        lrn: "100000000001",
        section: "Grade 10 - Aristotle",
        rawScore: 45,
        totalPoints: 50,
        rawPercent: "90%",
        transmutedGrade: 94,
        status: "GRADED",
        submittedAt: "2026-10-16 10:30 AM",
      },
    ];

    const buffer = generateGradebookExcel("Quarter 1 Mathematics Exam", rows);
    expect(buffer).toBeInstanceOf(Buffer);

    // Verify it is readable as an Excel file
    const wb = XLSX.read(buffer, { type: "buffer" });
    expect(wb.SheetNames).toContain("Gradebook");
    const sheet = wb.Sheets["Gradebook"];
    expect(sheet).toBeDefined();
  });

  it("generates a valid Credentials Summary Excel buffer", () => {
    const students = [
      {
        name: "Juan Dela Cruz",
        username: "student.001",
        temporaryPassword: "TmpPassword!123",
        lrn: "100000000001",
      },
    ];

    const buffer = generateCredentialsSummaryExcel(students);
    expect(buffer).toBeInstanceOf(Buffer);

    const wb = XLSX.read(buffer, { type: "buffer" });
    expect(wb.SheetNames).toContain("Credentials");
  });
});
