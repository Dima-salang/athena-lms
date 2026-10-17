/**
 * Utility Functions
 *
 * Core helpers used across the application:
 *  - cn: Tailwind class merging (clsx + tailwind-merge)
 *  - Formatting: dates, scores, durations, names
 *  - Type guards and assertion helpers
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isValid } from "date-fns";

// ─────────────────────────────────────────────────────────────────────────────
// Tailwind Class Merging
// ─────────────────────────────────────────────────────────────────────────────

/** Merge Tailwind CSS classes without conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────────────────────────────────────
// Name Formatting
// ─────────────────────────────────────────────────────────────────────────────

/** Format first and last name into a display-friendly full name. */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/** Format name as "LastName, FirstName" for roster/gradebook display. */
export function formatRosterName(firstName: string, lastName: string): string {
  return `${lastName}, ${firstName}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Date / Time Formatting
// ─────────────────────────────────────────────────────────────────────────────

/** Format a date to a human-readable string. */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (!isValid(d)) return "Invalid date";
  return format(d, "MMM d, yyyy");
}

/** Format a date with time. */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (!isValid(d)) return "Invalid date";
  return format(d, "MMM d, yyyy h:mm a");
}

/** Format a date as relative time (e.g. "3 minutes ago"). */
export function formatRelativeTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (!isValid(d)) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// Duration Formatting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format seconds into a readable "Xh Ym" or "Ym Zs" string.
 * Used for displaying test duration and countdown timer.
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0:00";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Seconds a student actually spent on a submission.
 *
 * `Submission.endTime` is the *deadline* (start + the allowed duration), not the
 * moment the student finished — that is `submittedAt`. Measuring up to `endTime`
 * reported the full time limit rather than the time used, and for untimed tests
 * (which have no `endTime`) the old fallback to `Date.now()` made the figure grow
 * every time the page rendered, so a finished test looked like it was still running.
 *
 * Returns `null` while the submission is unfinished, so callers can show "—"
 * instead of a clock that never stops.
 */
export function elapsedSeconds(
  startedAt: Date | string | null | undefined,
  submittedAt: Date | string | null | undefined
): number | null {
  if (!startedAt || !submittedAt) return null;

  const start = startedAt instanceof Date ? startedAt : new Date(startedAt);
  const end = submittedAt instanceof Date ? submittedAt : new Date(submittedAt);
  if (!isValid(start) || !isValid(end)) return null;

  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));
}

/** Format minutes into "X hour(s) Y min" or "Y min" display. */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h} hour${h > 1 ? "s" : ""}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Score / Grade Formatting
// ─────────────────────────────────────────────────────────────────────────────

/** Format a score for display. */
export function formatScore(score: number | null | undefined, total: number): string {
  if (score === null || score === undefined) return "—";
  return `${score} / ${total}`;
}

/** Format a percentage. */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Role Display
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  TEACHER: "Teacher",
  STUDENT: "Student",
};

export function formatRole(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

// ─────────────────────────────────────────────────────────────────────────────
// Exam Type Display
// ─────────────────────────────────────────────────────────────────────────────

const EXAM_TYPE_LABELS: Record<string, string> = {
  QUIZ: "Quiz",
  LONG_TEST: "Long Test",
  SUMMATIVE: "Summative Test",
  PERIODICAL: "Periodical Exam",
};

export function formatExamType(type: string): string {
  return EXAM_TYPE_LABELS[type] ?? type;
}

// ─────────────────────────────────────────────────────────────────────────────
// Question Type Display
// ─────────────────────────────────────────────────────────────────────────────

const QUESTION_TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True / False",
  IDENTIFICATION: "Identification",
  ACRONYM: "Acronym",
  MATCHING: "Matching Type",
  ESSAY: "Essay",
};

export function formatQuestionType(type: string): string {
  return QUESTION_TYPE_LABELS[type] ?? type;
}

// ─────────────────────────────────────────────────────────────────────────────
// Type Guards
// ─────────────────────────────────────────────────────────────────────────────

export function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function assertNotNull<T>(
  value: T | null | undefined,
  message = "Expected value to be defined"
): T {
  if (value === null || value === undefined) throw new Error(message);
  return value;
}
