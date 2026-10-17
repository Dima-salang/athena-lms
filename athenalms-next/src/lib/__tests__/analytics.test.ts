import { describe, it, expect } from "vitest";
import {
  classifyDifficulty,
  computeDifficultyIndex,
  classifyDiscrimination,
  computeDiscriminationIndex,
  computeDistractorAnalysis,
  computeScoreDistribution,
  type AnswerRecord,
  type StudentScore,
} from "../analytics";

describe("Difficulty Index Analysis", () => {
  it("classifies difficulty levels correctly", () => {
    expect(classifyDifficulty(0.85)).toBe("EASY");
    expect(classifyDifficulty(0.5)).toBe("MODERATE");
    expect(classifyDifficulty(0.2)).toBe("DIFFICULT");
  });

  it("computes difficulty index for mixed responses", () => {
    const answers: AnswerRecord[] = [
      { studentId: "s1", questionId: "q1", isCorrect: true, points: 1 },
      { studentId: "s2", questionId: "q1", isCorrect: true, points: 1 },
      { studentId: "s3", questionId: "q1", isCorrect: false, points: 0 },
      { studentId: "s4", questionId: "q1", isCorrect: false, points: 0 },
    ];

    const result = computeDifficultyIndex("q1", answers);
    expect(result.p).toBe(0.5);
    expect(result.category).toBe("MODERATE");
    expect(result.correctCount).toBe(2);
    expect(result.totalResponses).toBe(4);
  });

  it("handles zero answers defensively", () => {
    const result = computeDifficultyIndex("q-none", []);
    expect(result.p).toBe(0);
    expect(result.category).toBe("DIFFICULT");
    expect(result.totalResponses).toBe(0);
  });
});

describe("Discrimination Index Analysis", () => {
  it("classifies discrimination categories accurately", () => {
    expect(classifyDiscrimination(0.45)).toBe("EXCELLENT");
    expect(classifyDiscrimination(0.35)).toBe("GOOD");
    expect(classifyDiscrimination(0.25)).toBe("FAIR");
    expect(classifyDiscrimination(0.1)).toBe("POOR");
  });

  it("computes discrimination index with upper and lower cohorts", () => {
    const studentScores: StudentScore[] = [
      { studentId: "s1", totalPoints: 100 },
      { studentId: "s2", totalPoints: 90 },
      { studentId: "s3", totalPoints: 85 },
      { studentId: "s4", totalPoints: 70 },
      { studentId: "s5", totalPoints: 60 },
      { studentId: "s6", totalPoints: 50 },
      { studentId: "s7", totalPoints: 40 },
      { studentId: "s8", totalPoints: 30 },
    ];

    // Upper 27% (~2 students: s1, s2) got q1 correct
    // Lower 27% (~2 students: s7, s8) got q1 wrong
    const answers: AnswerRecord[] = [
      { studentId: "s1", questionId: "q1", isCorrect: true, points: 1 },
      { studentId: "s2", questionId: "q1", isCorrect: true, points: 1 },
      { studentId: "s3", questionId: "q1", isCorrect: true, points: 1 },
      { studentId: "s4", questionId: "q1", isCorrect: false, points: 0 },
      { studentId: "s5", questionId: "q1", isCorrect: false, points: 0 },
      { studentId: "s6", questionId: "q1", isCorrect: false, points: 0 },
      { studentId: "s7", questionId: "q1", isCorrect: false, points: 0 },
      { studentId: "s8", questionId: "q1", isCorrect: false, points: 0 },
    ];

    const result = computeDiscriminationIndex("q1", answers, studentScores);
    expect(result.d).toBe(1); // 2/2 - 0/2 = 1.0
    expect(result.category).toBe("EXCELLENT");
  });

  it("returns POOR when fewer than 4 students are present", () => {
    const result = computeDiscriminationIndex("q1", [], [
      { studentId: "s1", totalPoints: 10 },
    ]);
    expect(result.category).toBe("POOR");
    expect(result.d).toBe(0);
  });
});

describe("Distractor Analysis", () => {
  it("identifies functioning and non-functioning distractors", () => {
    const options = [
      { id: "opt-correct", optionText: "Photosynthesis" },
      { id: "opt-d1", optionText: "Respiration" },
      { id: "opt-d2", optionText: "Digestion" },
    ];

    const answers: AnswerRecord[] = [
      { studentId: "s1", questionId: "q1", isCorrect: true, points: 1, optionId: "opt-correct" },
      { studentId: "s2", questionId: "q1", isCorrect: false, points: 0, optionId: "opt-d1" },
      { studentId: "s3", questionId: "q1", isCorrect: false, points: 0, optionId: "opt-d1" },
      // Nobody chose opt-d2
    ];

    const result = computeDistractorAnalysis("q1", answers, options, "opt-correct");
    expect(result.distractors).toHaveLength(2);

    const d1 = result.distractors.find((d) => d.optionId === "opt-d1");
    expect(d1?.isFunctioning).toBe(true);

    const d2 = result.distractors.find((d) => d.optionId === "opt-d2");
    expect(d2?.isFunctioning).toBe(false);
  });
});

describe("Score Distribution", () => {
  it("brackets grades into standard DepEd academic achievement categories", () => {
    const grades = [95, 88, 82, 77, 65, 50];
    const distribution = computeScoreDistribution(grades);

    expect(distribution).toHaveLength(5);
    expect(distribution[0].count).toBe(1); // Outstanding 90-100 (95)
    expect(distribution[1].count).toBe(1); // Very Satisfactory 85-89 (88)
    expect(distribution[2].count).toBe(1); // Satisfactory 80-84 (82)
    expect(distribution[3].count).toBe(1); // Fairly Satisfactory 75-79 (77)
    expect(distribution[4].count).toBe(2); // Did Not Meet <75 (65, 50)
  });
});
