/**
 * DepEd Grade Transmutation Engine
 *
 * Converts a raw score percentage to a DepEd-compliant transmuted grade
 * (grade range: 60–100, passing threshold: 75 at 60% raw score).
 *
 * Supports three formulas:
 *  1. DEPED_STANDARD — Official DepEd lookup table interpolation
 *  2. LINEAR_50_BASE — Grade = (raw/total) × 50 + 50
 *  3. CUSTOM         — Configurable base score and passing thresholds
 *
 * All functions are pure and zero-dependency for deterministic unit testing.
 */

export type TransmutationFormula =
  | "DEPED_STANDARD"
  | "LINEAR_50_BASE"
  | "CUSTOM";

export interface TransmutationConfig {
  formula: TransmutationFormula;
  baseScore?: number; // Minimum grade (CUSTOM only, default: 60)
  passingRawPercent?: number; // Raw % that maps to passing (CUSTOM only, default: 60)
  passingGrade?: number; // Transmuted passing grade (CUSTOM only, default: 75)
}

export interface TransmutationResult {
  rawScore: number;
  totalPoints: number;
  rawPercent: number;
  transmutedGrade: number;
  isPassing: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Official DepEd Standard Transmutation Table
// Source: DepEd Order No. 8, s. 2015 (K to 12 Grading System)
// Maps raw score percentage intervals to transmuted grades
// ─────────────────────────────────────────────────────────────────────────────

/** Each entry: [rawPercentMin (inclusive), rawPercentMax (inclusive), transmutedGrade] */
const DEPED_TABLE: ReadonlyArray<readonly [number, number, number]> = [
  [100.00, 100.00, 100],
  [98.40, 99.99,  99],
  [96.80, 98.39,  98],
  [95.20, 96.79,  97],
  [93.60, 95.19,  96],
  [92.00, 93.59,  95],
  [90.40, 91.99,  94],
  [88.80, 90.39,  93],
  [87.20, 88.79,  92],
  [85.60, 87.19,  91],
  [84.00, 85.59,  90],
  [82.40, 83.99,  89],
  [80.80, 82.39,  88],
  [79.20, 80.79,  87],
  [77.60, 79.19,  86],
  [76.00, 77.59,  85],
  [74.40, 75.99,  84],
  [72.80, 74.39,  83],
  [71.20, 72.79,  82],
  [69.60, 71.19,  81],
  [68.00, 69.59,  80],
  [66.40, 67.99,  79],
  [64.80, 66.39,  78],
  [63.20, 64.79,  77],
  [61.60, 63.19,  76],
  [60.00, 61.59,  75], // Passing threshold: 60% raw → 75 transmuted
  [56.00, 59.99,  74],
  [52.00, 55.99,  73],
  [48.00, 51.99,  72],
  [44.00, 47.99,  71],
  [40.00, 43.99,  70],
  [36.00, 39.99,  69],
  [32.00, 35.99,  68],
  [28.00, 31.99,  67],
  [24.00, 27.99,  66],
  [20.00, 23.99,  65],
  [16.00, 19.99,  64],
  [12.00, 15.99,  63],
  [8.00,  11.99,  62],
  [4.00,  7.99,   61],
  [0.00,  3.99,   60],
] as const;

/**
 * Lookup the DepEd standard transmuted grade for a given raw percentage.
 * Returns 60 (minimum) for any value below 4%.
 */
export function depedStandardTransmutation(rawPercent: number): number {
  const clamped = Math.max(0, Math.min(100, rawPercent));

  for (const [min, max, grade] of DEPED_TABLE) {
    if (clamped >= min && clamped <= max) {
      return grade;
    }
  }

  return 60; // Fallback — should never be reached with valid input
}

/**
 * Linear 50-base formula:
 *   Grade = (rawScore / totalPoints) × 50 + 50
 * Passing: 50% raw → 75 transmuted
 */
export function linear50BaseTransmutation(rawPercent: number): number {
  const grade = rawPercent * 0.5 + 50;
  return Math.min(100, Math.max(50, Math.round(grade * 100) / 100));
}

/**
 * Custom transmutation formula using configurable thresholds.
 * Linearly interpolates between:
 *   0% raw → baseScore
 *   passingRawPercent% raw → passingGrade
 *   100% raw → 100
 */
export function customTransmutation(
  rawPercent: number,
  baseScore: number,
  passingRawPercent: number,
  passingGrade: number
): number {
  if (rawPercent <= 0) return baseScore;
  if (rawPercent >= 100) return 100;

  if (rawPercent < passingRawPercent) {
    // Linear interpolation: baseScore → passingGrade
    const ratio = rawPercent / passingRawPercent;
    const grade = baseScore + ratio * (passingGrade - baseScore);
    return Math.round(grade * 100) / 100;
  } else {
    // Linear interpolation: passingGrade → 100
    const ratio = (rawPercent - passingRawPercent) / (100 - passingRawPercent);
    const grade = passingGrade + ratio * (100 - passingGrade);
    return Math.round(grade * 100) / 100;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute the full transmutation result for a submission.
 *
 * @param rawScore   The student's earned points.
 * @param totalPoints  The maximum possible points for the test.
 * @param config     Transmutation configuration (defaults to DepEd standard).
 */
export function transmute(
  rawScore: number,
  totalPoints: number,
  config: TransmutationConfig = { formula: "DEPED_STANDARD" }
): TransmutationResult {
  if (totalPoints <= 0) {
    return {
      rawScore: 0,
      totalPoints: 0,
      rawPercent: 0,
      transmutedGrade: 60,
      isPassing: false,
    };
  }

  const safeRaw = Math.max(0, rawScore);
  const rawPercent = (safeRaw / totalPoints) * 100;

  let transmutedGrade: number;

  switch (config.formula) {
    case "LINEAR_50_BASE":
      transmutedGrade = linear50BaseTransmutation(rawPercent);
      break;

    case "CUSTOM":
      transmutedGrade = customTransmutation(
        rawPercent,
        config.baseScore ?? 60,
        config.passingRawPercent ?? 60,
        config.passingGrade ?? 75
      );
      break;

    case "DEPED_STANDARD":
    default:
      transmutedGrade = depedStandardTransmutation(rawPercent);
      break;
  }

  return {
    rawScore: safeRaw,
    totalPoints,
    rawPercent: Math.round(rawPercent * 100) / 100,
    transmutedGrade: Math.round(transmutedGrade * 100) / 100,
    isPassing: transmutedGrade >= 75,
  };
}
