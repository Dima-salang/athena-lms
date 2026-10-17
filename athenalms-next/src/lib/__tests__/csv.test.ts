import { describe, expect, it } from "vitest";

import { CSV_BOM, csvCell, toCsv } from "../csv";

describe("csvCell", () => {
  it("passes plain values through", () => {
    expect(csvCell("Mathematics 10")).toBe("Mathematics 10");
    expect(csvCell(42)).toBe("42");
  });

  it("renders null and undefined as empty", () => {
    expect(csvCell(null)).toBe("");
    expect(csvCell(undefined)).toBe("");
  });

  it("quotes commas, quotes and newlines", () => {
    expect(csvCell("Dela Cruz, Juan")).toBe('"Dela Cruz, Juan"');
    expect(csvCell('He said "hi"')).toBe('"He said ""hi"""');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
  });
});

describe("toCsv", () => {
  it("writes the header first and joins with CRLF", () => {
    const csv = toCsv(["Name", "LRN"], [["Juan", "123456789012"]]);
    expect(csv).toBe("Name,LRN\r\nJuan,123456789012");
  });

  it("keeps an empty cell for missing optional values", () => {
    expect(toCsv(["Email"], [[null]])).toBe("Email\r\n");
  });

  it("exposes a BOM for Excel", () => {
    expect(CSV_BOM).toBe("\uFEFF");
  });
});
