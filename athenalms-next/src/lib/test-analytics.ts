import {
  computeDifficultyIndex,
  computeDiscriminationIndex,
  computeDistractorAnalysis,
  computeScoreDistribution,
  type AnswerRecord,
  type DistractorFrequency,
  type DifficultyCategory,
  type DiscriminationCategory,
  type ScoreDistributionBucket,
  type StudentScore,
} from "@/lib/analytics";

/**
 * Shared analytics computation for a single test. Used by both the analytics
 * screen (`.../analytics`) and the item-analysis Excel export route so the
 * numbers can never drift apart.
 */

export interface AnalyticsQuestionInput {
  id: string;
  questionNumber: number;
  questionText: string;
  questionType: string;
  fullPoints: number;
  correctOptionId: string | null;
  options: { id: string; optionText: string }[];
}

export interface AnalyticsAnswerInput {
  questionId: string;
  points: number | null;
  optionId: string | null;
}

export interface AnalyticsSubmissionInput {
  id: string;
  studentId: string;
  status: string;
  rawScore: number | null;
  transmutedGrade: number | null;
  submittedAt: Date | null;
  student: {
    firstName: string;
    lastName: string;
    studentProfile: { lrn: string | null; section: { name: string } | null } | null;
  };
  studentAnswers: AnalyticsAnswerInput[];
}

export interface AnalyticsTestInput {
  id: string;
  title: string;
  maxScore: number | null;
  questions: AnalyticsQuestionInput[];
  sections: { section: { id: string; name: string } }[];
  submissions: AnalyticsSubmissionInput[];
}

export interface GradebookEntry {
  studentId: string;
  studentName: string;
  lrn: string;
  sectionName: string;
  submissionId: string;
  status: string;
  rawScore: number | null;
  totalPoints: number;
  rawPercent: number;
  transmutedGrade: number | null;
  submittedAt: string | null;
}

export interface ItemAnalysisEntry {
  questionId: string;
  questionNumber: number;
  questionText: string;
  questionType: string;
  fullPoints: number;
  correctCount: number;
  wrongCount: number;
  totalResponses: number;
  percentCorrect: number;
  difficultyIndex: number;
  difficultyCategory: DifficultyCategory;
  discriminationIndex: number;
  discriminationCategory: DiscriminationCategory;
  distractors: DistractorFrequency[];
}

export interface TestAnalyticsSummary {
  totalSubmissions: number;
  totalPoints: number;
  averageRawScore: number;
  averageTransmutedGrade: number;
  passingRate: number;
  passingCount: number;
  failingCount: number;
}

export interface TestAnalyticsResult {
  test: { id: string; title: string; sections: { section: { id: string; name: string } }[] };
  summary: TestAnalyticsSummary;
  gradebook: GradebookEntry[];
  itemAnalysis: ItemAnalysisEntry[];
  scoreDistribution: ScoreDistributionBucket[];
}

export function computeTestAnalytics(test: AnalyticsTestInput): TestAnalyticsResult {
  const totalPoints =
    test.maxScore || test.questions.reduce((sum, q) => sum + q.fullPoints, 0);

  const gradebook: GradebookEntry[] = test.submissions.map((sub) => {
    const rawScore = sub.rawScore || 0;
    const rawPercent = totalPoints > 0 ? (rawScore / totalPoints) * 100 : 0;
    return {
      studentId: sub.studentId,
      studentName: `${sub.student.lastName}, ${sub.student.firstName}`,
      lrn: sub.student.studentProfile?.lrn || "—",
      sectionName: sub.student.studentProfile?.section?.name || "—",
      submissionId: sub.id,
      status: sub.status,
      rawScore: sub.rawScore,
      totalPoints,
      rawPercent: Math.round(rawPercent * 10) / 10,
      transmutedGrade: sub.transmutedGrade,
      submittedAt: sub.submittedAt?.toISOString() ?? null,
    };
  });

  const answerRecords: AnswerRecord[] = [];
  const studentScores: StudentScore[] = [];

  for (const sub of test.submissions) {
    studentScores.push({ studentId: sub.studentId, totalPoints: sub.rawScore || 0 });

    for (const ans of sub.studentAnswers) {
      const question = test.questions.find((q) => q.id === ans.questionId);
      answerRecords.push({
        studentId: sub.studentId,
        questionId: ans.questionId,
        isCorrect: (ans.points || 0) >= (question?.fullPoints || 1),
        points: ans.points || 0,
        optionId: ans.optionId,
      });
    }
  }

  const itemAnalysis: ItemAnalysisEntry[] = test.questions.map((q) => {
    const difficulty = computeDifficultyIndex(q.id, answerRecords);
    const discrimination = computeDiscriminationIndex(q.id, answerRecords, studentScores);

    let distractors: DistractorFrequency[] = [];
    if (q.questionType === "MULTIPLE_CHOICE" && q.correctOptionId) {
      distractors =
        computeDistractorAnalysis(
          q.id,
          answerRecords,
          q.options.map((o) => ({ id: o.id, optionText: o.optionText })),
          q.correctOptionId
        ).distractors || [];
    }

    const totalResponses = difficulty.totalResponses;
    const correctCount = difficulty.correctCount;

    return {
      questionId: q.id,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      questionType: q.questionType,
      fullPoints: q.fullPoints,
      correctCount,
      wrongCount: Math.max(0, totalResponses - correctCount),
      totalResponses,
      percentCorrect:
        totalResponses > 0 ? Math.round((correctCount / totalResponses) * 100) : 0,
      difficultyIndex: difficulty.p,
      difficultyCategory: difficulty.category,
      discriminationIndex: discrimination.d,
      discriminationCategory: discrimination.category,
      distractors,
    };
  });

  const validGrades = test.submissions
    .map((s) => s.transmutedGrade)
    .filter((g): g is number => g !== null);

  const averageRawScore =
    gradebook.length > 0
      ? gradebook.reduce((sum, g) => sum + (g.rawScore || 0), 0) / gradebook.length
      : 0;

  const averageTransmutedGrade =
    validGrades.length > 0
      ? validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length
      : 0;

  const passingCount = validGrades.filter((g) => g >= 75).length;
  const passingRate =
    validGrades.length > 0 ? (passingCount / validGrades.length) * 100 : 0;

  return {
    test: {
      id: test.id,
      title: test.title,
      sections: test.sections.map((s) => ({
        section: { id: s.section.id, name: s.section.name },
      })),
    },
    summary: {
      totalSubmissions: test.submissions.length,
      totalPoints,
      averageRawScore: Math.round(averageRawScore * 100) / 100,
      averageTransmutedGrade: Math.round(averageTransmutedGrade * 100) / 100,
      passingRate: Math.round(passingRate * 10) / 10,
      passingCount,
      failingCount: validGrades.length - passingCount,
    },
    gradebook,
    itemAnalysis,
    scoreDistribution: computeScoreDistribution(validGrades),
  };
}
