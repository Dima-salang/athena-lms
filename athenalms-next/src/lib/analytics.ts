/**
 * Item Analysis Engine
 *
 * Computes statistical indicators that help teachers evaluate test quality:
 *
 *  - Difficulty Index (P): proportion of students who answered correctly
 *    Classification: Easy (>0.7), Moderate (0.3–0.7), Difficult (<0.3)
 *
 *  - Discrimination Index (D): difference between high-scoring and
 *    low-scoring groups' performance on an item
 *    Classification: Excellent (>0.4), Good (0.3–0.4), Fair (0.2–0.3),
 *                    Poor (<0.2 — consider revising or rejecting)
 *
 *  - Distractor Analysis (MCQ): frequency of each wrong option selected,
 *    identifying non-functioning distractors
 *
 * All functions are pure and zero-dependency for deterministic unit testing.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type DifficultyCategory = "EASY" | "MODERATE" | "DIFFICULT";
export type DiscriminationCategory = "EXCELLENT" | "GOOD" | "FAIR" | "POOR";

export interface ItemDifficultyResult {
  questionId: string;
  p: number; // Difficulty Index (0–1)
  category: DifficultyCategory;
  correctCount: number;
  totalResponses: number;
}

export interface ItemDiscriminationResult {
  questionId: string;
  d: number; // Discrimination Index (-1 to 1)
  category: DiscriminationCategory;
  upperGroupCorrect: number;
  lowerGroupCorrect: number;
  groupSize: number;
}

export interface DistractorFrequency {
  optionId: string;
  optionText: string;
  selectedCount: number;
  frequency: number; // proportion (0–1)
  isFunctioning: boolean; // true if >5% chose it
}

export interface DistractorAnalysisResult {
  questionId: string;
  distractors: DistractorFrequency[];
  totalResponses: number;
}

export interface AnswerRecord {
  studentId: string;
  questionId: string;
  isCorrect: boolean;
  points: number;
  optionId?: string | null;
}

export interface StudentScore {
  studentId: string;
  totalPoints: number;
}

export interface FullItemAnalysisResult {
  questionId: string;
  difficulty: ItemDifficultyResult;
  discrimination: ItemDiscriminationResult;
  distractor?: DistractorAnalysisResult;
}

// ─────────────────────────────────────────────────────────────────────────────
// Difficulty Index
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classify a difficulty index P value.
 * P > 0.70 → Easy, 0.30–0.70 → Moderate, P < 0.30 → Difficult
 */
export function classifyDifficulty(p: number): DifficultyCategory {
  if (p > 0.70) return "EASY";
  if (p >= 0.30) return "MODERATE";
  return "DIFFICULT";
}

/**
 * Compute Difficulty Index (P) for a single question.
 * P = Number of correct responses / Total responses
 */
export function computeDifficultyIndex(
  questionId: string,
  answers: AnswerRecord[]
): ItemDifficultyResult {
  const relevant = answers.filter((a) => a.questionId === questionId);
  if (relevant.length === 0) {
    return {
      questionId,
      p: 0,
      category: "DIFFICULT",
      correctCount: 0,
      totalResponses: 0,
    };
  }

  const correctCount = relevant.filter((a) => a.isCorrect).length;
  const p = correctCount / relevant.length;

  return {
    questionId,
    p: Math.round(p * 1000) / 1000,
    category: classifyDifficulty(p),
    correctCount,
    totalResponses: relevant.length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Discrimination Index
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classify a discrimination index D value.
 * D > 0.40 → Excellent, 0.30–0.40 → Good, 0.20–0.30 → Fair, D < 0.20 → Poor
 */
export function classifyDiscrimination(d: number): DiscriminationCategory {
  if (d > 0.40) return "EXCELLENT";
  if (d >= 0.30) return "GOOD";
  if (d >= 0.20) return "FAIR";
  return "POOR";
}

/**
 * Compute Discrimination Index (D) for a single question.
 *
 * Method: Upper 27% vs Lower 27% of students by total test score.
 * D = (U correct / U count) - (L correct / L count)
 */
export function computeDiscriminationIndex(
  questionId: string,
  answers: AnswerRecord[],
  studentScores: StudentScore[]
): ItemDiscriminationResult {
  if (studentScores.length < 4) {
    // Not enough students for meaningful discrimination analysis
    return {
      questionId,
      d: 0,
      category: "POOR",
      upperGroupCorrect: 0,
      lowerGroupCorrect: 0,
      groupSize: 0,
    };
  }

  // Sort students by total score descending
  const sorted = [...studentScores].sort((a, b) => b.totalPoints - a.totalPoints);
  const groupSize = Math.max(1, Math.ceil(sorted.length * 0.27));

  const upperGroup = sorted.slice(0, groupSize).map((s) => s.studentId);
  const lowerGroup = sorted.slice(-groupSize).map((s) => s.studentId);

  const questionAnswers = answers.filter((a) => a.questionId === questionId);
  const answerByStudent = new Map(questionAnswers.map((a) => [a.studentId, a]));

  const upperCorrect = upperGroup.filter(
    (sid) => answerByStudent.get(sid)?.isCorrect
  ).length;
  const lowerCorrect = lowerGroup.filter(
    (sid) => answerByStudent.get(sid)?.isCorrect
  ).length;

  const d = upperCorrect / groupSize - lowerCorrect / groupSize;

  return {
    questionId,
    d: Math.round(d * 1000) / 1000,
    category: classifyDiscrimination(d),
    upperGroupCorrect: upperCorrect,
    lowerGroupCorrect: lowerCorrect,
    groupSize,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Distractor Analysis (MCQ)
// ─────────────────────────────────────────────────────────────────────────────

export interface OptionInfo {
  id: string;
  optionText: string;
}

/**
 * Compute distractor frequency for an MCQ question.
 * A functioning distractor attracts ≥5% of respondents.
 */
export function computeDistractorAnalysis(
  questionId: string,
  answers: AnswerRecord[],
  options: OptionInfo[],
  correctOptionId: string
): DistractorAnalysisResult {
  const relevant = answers.filter(
    (a) => a.questionId === questionId && a.optionId
  );

  const distractors: DistractorFrequency[] = options
    .filter((o) => o.id !== correctOptionId)
    .map((o) => {
      const selectedCount = relevant.filter((a) => a.optionId === o.id).length;
      const frequency =
        relevant.length > 0 ? selectedCount / relevant.length : 0;
      return {
        optionId: o.id,
        optionText: o.optionText,
        selectedCount,
        frequency: Math.round(frequency * 1000) / 1000,
        isFunctioning: frequency >= 0.05,
      };
    });

  return {
    questionId,
    distractors,
    totalResponses: relevant.length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Score Distribution
// ─────────────────────────────────────────────────────────────────────────────

export interface ScoreDistributionBucket {
  label: string;
  count: number;
  percentage: number;
}

/**
 * Group transmuted grades into standard DepEd performance brackets.
 * Brackets: Outstanding (90–100), Very Satisfactory (85–89),
 *            Satisfactory (80–84), Fairly Satisfactory (75–79),
 *            Did Not Meet Expectations (<75)
 */
export function computeScoreDistribution(
  grades: number[]
): ScoreDistributionBucket[] {
  const buckets = [
    { label: "Outstanding (90–100)", min: 90, max: 100 },
    { label: "Very Satisfactory (85–89)", min: 85, max: 89 },
    { label: "Satisfactory (80–84)", min: 80, max: 84 },
    { label: "Fairly Satisfactory (75–79)", min: 75, max: 79 },
    { label: "Did Not Meet Expectations (<75)", min: 0, max: 74 },
  ];

  return buckets.map(({ label, min, max }) => {
    const count = grades.filter((g) => g >= min && g <= max).length;
    return {
      label,
      count,
      percentage:
        grades.length > 0
          ? Math.round((count / grades.length) * 1000) / 10
          : 0,
    };
  });
}
