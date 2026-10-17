/**
 * Grading Engine
 *
 * Pure, stateless functions for auto-checking student answers across all
 * 6 question types. Zero external dependencies — fully unit-testable.
 *
 * Question Types:
 *  - MULTIPLE_CHOICE
 *  - TRUE_FALSE
 *  - IDENTIFICATION
 *  - ACRONYM
 *  - MATCHING
 *  - ESSAY (returns 0; manual grading required)
 */

export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "IDENTIFICATION"
  | "ACRONYM"
  | "MATCHING"
  | "ESSAY";

export interface GradableQuestion {
  id: string;
  questionType: QuestionType;
  fullPoints: number;
  correctAnswer?: string | null;
  alternativeAnswers?: string | null; // JSON array string e.g. '["Rizal","Jose Rizal"]'
  correctOptionId?: string | null;
}

export interface StudentAnswerInput {
  questionId: string;
  optionId?: string | null;
  textAnswer?: string | null;
  matchingPairs?: string | null; // JSON: [{optionId: string, matchedText: string}]
}

export interface GradingResult {
  questionId: string;
  points: number;
  isCorrect: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Grading per question type
// ─────────────────────────────────────────────────────────────────────────────

/** Grade a Multiple Choice answer. */
function gradeMultipleChoice(
  question: GradableQuestion,
  answer: StudentAnswerInput
): GradingResult {
  const isCorrect =
    !!answer.optionId &&
    !!question.correctOptionId &&
    answer.optionId === question.correctOptionId;

  return {
    questionId: question.id,
    points: isCorrect ? question.fullPoints : 0,
    isCorrect,
  };
}

/** Grade a True/False answer. */
function gradeTrueFalse(
  question: GradableQuestion,
  answer: StudentAnswerInput
): GradingResult {
  const normalise = (s: string | null | undefined) =>
    (s ?? "").trim().toLowerCase();

  const isCorrect =
    !!question.correctAnswer &&
    normalise(answer.textAnswer) === normalise(question.correctAnswer);

  return {
    questionId: question.id,
    points: isCorrect ? question.fullPoints : 0,
    isCorrect,
  };
}

/**
 * Grade an Identification or Acronym answer.
 * Comparison is case-insensitive and whitespace-trimmed.
 * Also checks alternativeAnswers JSON array if present.
 */
function gradeTextAnswer(
  question: GradableQuestion,
  answer: StudentAnswerInput
): GradingResult {
  const normalise = (s: string | null | undefined) =>
    (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");

  const studentNorm = normalise(answer.textAnswer);

  if (!studentNorm) {
    return { questionId: question.id, points: 0, isCorrect: false };
  }

  const primaryMatch = normalise(question.correctAnswer) === studentNorm;

  let alternativeMatch = false;
  if (!primaryMatch && question.alternativeAnswers) {
    try {
      const alternatives: string[] = JSON.parse(question.alternativeAnswers);
      alternativeMatch = alternatives.some(
        (alt) => normalise(alt) === studentNorm
      );
    } catch {
      // Malformed JSON — ignore alternatives
    }
  }

  const isCorrect = primaryMatch || alternativeMatch;
  return {
    questionId: question.id,
    points: isCorrect ? question.fullPoints : 0,
    isCorrect,
  };
}

/**
 * Grade a Matching Type answer.
 * matchingPairs: [{optionId, matchedText}]
 * Each correct pair scores (fullPoints / totalPairs) partial credit.
 */
interface MatchingPair {
  optionId: string; // Column A option id
  matchedText: string; // Student's chosen Column B text
}

function gradeMatching(
  question: GradableQuestion,
  answer: StudentAnswerInput,
  correctPairs: Array<{ optionId: string; correctText: string }>
): GradingResult {
  if (!answer.matchingPairs || correctPairs.length === 0) {
    return { questionId: question.id, points: 0, isCorrect: false };
  }

  let studentPairs: MatchingPair[];
  try {
    studentPairs = JSON.parse(answer.matchingPairs) as MatchingPair[];
  } catch {
    return { questionId: question.id, points: 0, isCorrect: false };
  }

  const normalise = (s: string) => s.trim().toLowerCase();
  const pointsPerPair = question.fullPoints / correctPairs.length;

  let correctCount = 0;
  for (const correct of correctPairs) {
    const studentPair = studentPairs.find((p) => p.optionId === correct.optionId);
    if (
      studentPair &&
      normalise(studentPair.matchedText) === normalise(correct.correctText)
    ) {
      correctCount++;
    }
  }

  const points = Math.round(correctCount * pointsPerPair * 100) / 100;
  return {
    questionId: question.id,
    points,
    isCorrect: correctCount === correctPairs.length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Grade a single student answer against its question.
 *
 * @param question  The question with answer key data.
 * @param answer    The student's recorded answer.
 * @param correctMatchingPairs  Required only for MATCHING type questions.
 */
export function gradeAnswer(
  question: GradableQuestion,
  answer: StudentAnswerInput,
  correctMatchingPairs: Array<{ optionId: string; correctText: string }> = []
): GradingResult {
  switch (question.questionType) {
    case "MULTIPLE_CHOICE":
      return gradeMultipleChoice(question, answer);

    case "TRUE_FALSE":
      return gradeTrueFalse(question, answer);

    case "IDENTIFICATION":
    case "ACRONYM":
      return gradeTextAnswer(question, answer);

    case "MATCHING":
      return gradeMatching(question, answer, correctMatchingPairs);

    case "ESSAY":
      // Essay requires manual teacher grading — return 0 by default
      return { questionId: question.id, points: 0, isCorrect: false };

    default:
      return { questionId: question.id, points: 0, isCorrect: false };
  }
}

/**
 * Grade a complete submission in one pass.
 * Returns a map of questionId -> GradingResult plus the total raw score.
 */
export function gradeSubmission(
  questions: GradableQuestion[],
  answers: StudentAnswerInput[],
  matchingPairsMap: Map<
    string,
    Array<{ optionId: string; correctText: string }>
  > = new Map()
): { results: GradingResult[]; rawScore: number } {
  const answerMap = new Map(answers.map((a) => [a.questionId, a]));

  const results: GradingResult[] = questions.map((q) => {
    const answer = answerMap.get(q.id);
    if (!answer) {
      return { questionId: q.id, points: 0, isCorrect: false };
    }
    const correctPairs = matchingPairsMap.get(q.id) ?? [];
    return gradeAnswer(q, answer, correctPairs);
  });

  const rawScore = results.reduce((sum, r) => sum + r.points, 0);

  return { results, rawScore };
}
