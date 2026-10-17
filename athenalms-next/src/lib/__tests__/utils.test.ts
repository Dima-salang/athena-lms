import { describe, it, expect } from "vitest";
import {
  cn,
  formatFullName,
  formatRosterName,
  formatDate,
  formatDateTime,
  formatDuration,
  elapsedSeconds,
  formatMinutes,
  formatScore,
  formatPercent,
  formatRole,
  formatExamType,
  formatQuestionType,
  isNotNull,
  assertNotNull,
} from "../utils";

describe("Utils Library", () => {
  it("merges Tailwind classes with cn", () => {
    expect(cn("px-2 py-1", "bg-blue-500")).toBe("px-2 py-1 bg-blue-500");
    expect(cn("px-2", "px-4")).toBe("px-4"); // twMerge resolves conflict
  });

  it("formats names properly", () => {
    expect(formatFullName("Juan", "Dela Cruz")).toBe("Juan Dela Cruz");
    expect(formatRosterName("Juan", "Dela Cruz")).toBe("Dela Cruz, Juan");
  });

  it("formats dates safely with null checks", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDateTime(null)).toBe("—");
    expect(formatDate(new Date(2026, 9, 16))).toContain("2026");
  });

  it("formats duration seconds into hh:mm:ss or mm:ss", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(3665)).toBe("1:01:05");
  });

  it("measures time spent from start to submit, not to the deadline", () => {
    const start = new Date("2026-10-17T10:00:00Z");
    // Timed test: the deadline is an hour out, but the student finished in 18 min.
    expect(
      elapsedSeconds(start, new Date("2026-10-17T10:18:17Z"))
    ).toBe(1097);
    // Dates passed as ISO strings (what the API sends) behave the same.
    expect(
      elapsedSeconds("2026-10-17T10:00:00Z", "2026-10-17T10:18:17Z")
    ).toBe(1097);
  });

  it("returns no elapsed time while a submission is unfinished", () => {
    const start = new Date("2026-10-17T10:00:00Z");
    // Untimed test: no deadline, nothing submitted yet — no ticking clock.
    expect(elapsedSeconds(start, null)).toBeNull();
    expect(elapsedSeconds(start, undefined)).toBeNull();
    expect(elapsedSeconds(null, new Date())).toBeNull();
    expect(elapsedSeconds(start, "not-a-date")).toBeNull();
  });

  it("never reports negative time spent", () => {
    // Clock skew between the server that stamped startTime and the client.
    expect(
      elapsedSeconds(
        new Date("2026-10-17T10:00:00Z"),
        new Date("2026-10-17T09:59:30Z")
      )
    ).toBe(0);
  });

  it("formats minutes into readable strings", () => {
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(60)).toBe("1 hour");
    expect(formatMinutes(90)).toBe("1h 30m");
  });

  it("formats score and percentage", () => {
    expect(formatScore(null, 50)).toBe("—");
    expect(formatScore(45, 50)).toBe("45 / 50");
    expect(formatPercent(87.5)).toBe("87.5%");
  });

  it("formats display roles, exam types, and question types", () => {
    expect(formatRole("ADMIN")).toBe("Administrator");
    expect(formatRole("TEACHER")).toBe("Teacher");
    expect(formatRole("STUDENT")).toBe("Student");

    expect(formatExamType("QUIZ")).toBe("Quiz");
    expect(formatExamType("SUMMATIVE")).toBe("Summative Test");

    expect(formatQuestionType("MULTIPLE_CHOICE")).toBe("Multiple Choice");
    expect(formatQuestionType("TRUE_FALSE")).toBe("True / False");
  });

  it("handles type guards and assertions", () => {
    expect(isNotNull("hello")).toBe(true);
    expect(isNotNull(null)).toBe(false);
    expect(isNotNull(undefined)).toBe(false);

    expect(assertNotNull("val")).toBe("val");
    expect(() => assertNotNull(null)).toThrow();
  });
});
