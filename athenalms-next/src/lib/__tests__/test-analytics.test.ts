import { describe, it, expect } from "vitest";

import { computeTestAnalytics, type AnalyticsTestInput } from "../test-analytics";

function makeTest(): AnalyticsTestInput {
  return {
    id: "t1",
    title: "Quarter 1 Quiz",
    maxScore: 10,
    questions: [
      {
        id: "q1",
        questionNumber: 1,
        questionText: "Capital of the Philippines?",
        questionType: "MULTIPLE_CHOICE",
        fullPoints: 5,
        correctOptionId: "o1",
        options: [
          { id: "o1", optionText: "Manila" },
          { id: "o2", optionText: "Cebu" },
        ],
      },
      {
        id: "q2",
        questionNumber: 2,
        questionText: "The sun rises in the east.",
        questionType: "TRUE_FALSE",
        fullPoints: 5,
        correctOptionId: null,
        options: [],
      },
    ],
    sections: [{ section: { id: "s1", name: "Grade 10 - Rizal" } }],
    submissions: [
      {
        id: "sub1",
        studentId: "st1",
        status: "GRADED",
        rawScore: 10,
        transmutedGrade: 95,
        submittedAt: new Date("2026-01-01T10:00:00Z"),
        student: {
          firstName: "Ana",
          lastName: "Reyes",
          studentProfile: { lrn: "1001", section: { name: "Grade 10 - Rizal" } },
        },
        studentAnswers: [
          { questionId: "q1", points: 5, optionId: "o1" },
          { questionId: "q2", points: 5, optionId: null },
        ],
      },
      {
        id: "sub2",
        studentId: "st2",
        status: "GRADED",
        rawScore: 5,
        transmutedGrade: 80,
        submittedAt: new Date("2026-01-01T10:05:00Z"),
        student: {
          firstName: "Ben",
          lastName: "Cruz",
          studentProfile: { lrn: "1002", section: { name: "Grade 10 - Rizal" } },
        },
        studentAnswers: [
          { questionId: "q1", points: 5, optionId: "o1" },
          { questionId: "q2", points: 0, optionId: null },
        ],
      },
      {
        id: "sub3",
        studentId: "st3",
        status: "GRADED",
        rawScore: 5,
        transmutedGrade: 70,
        submittedAt: null,
        student: {
          firstName: "Cara",
          lastName: "Diaz",
          studentProfile: { lrn: "1003", section: { name: "Grade 10 - Rizal" } },
        },
        studentAnswers: [
          { questionId: "q1", points: 0, optionId: "o2" },
          { questionId: "q2", points: 5, optionId: null },
        ],
      },
      {
        id: "sub4",
        studentId: "st4",
        status: "SUBMITTED",
        rawScore: 0,
        transmutedGrade: 60,
        submittedAt: null,
        student: {
          firstName: "Dan",
          lastName: "Lopez",
          studentProfile: null,
        },
        studentAnswers: [
          { questionId: "q1", points: 0, optionId: "o2" },
          { questionId: "q2", points: 0, optionId: null },
        ],
      },
    ],
  };
}

describe("computeTestAnalytics", () => {
  it("summarises submissions, averages, and passing rate", () => {
    const { summary } = computeTestAnalytics(makeTest());

    expect(summary.totalSubmissions).toBe(4);
    expect(summary.totalPoints).toBe(10);
    expect(summary.averageRawScore).toBe(5);
    // (95 + 80 + 70 + 60) / 4
    expect(summary.averageTransmutedGrade).toBe(76.25);
    expect(summary.passingCount).toBe(2);
    expect(summary.failingCount).toBe(2);
    expect(summary.passingRate).toBe(50);
  });

  it("builds gradebook rows with derived percentages and fallbacks", () => {
    const { gradebook } = computeTestAnalytics(makeTest());
    expect(gradebook).toHaveLength(4);

    const ana = gradebook[0];
    expect(ana.studentName).toBe("Reyes, Ana");
    expect(ana.lrn).toBe("1001");
    expect(ana.sectionName).toBe("Grade 10 - Rizal");
    expect(ana.rawPercent).toBe(100);
    expect(ana.submittedAt).toBe("2026-01-01T10:00:00.000Z");

    const dan = gradebook[3];
    expect(dan.rawPercent).toBe(0);
    expect(dan.lrn).toBe("—");
    expect(dan.sectionName).toBe("—");
    expect(dan.submittedAt).toBeNull();
  });

  it("counts correct vs wrong per item", () => {
    const { itemAnalysis } = computeTestAnalytics(makeTest());
    expect(itemAnalysis).toHaveLength(2);

    const [q1, q2] = itemAnalysis;
    expect(q1.correctCount).toBe(2);
    expect(q1.wrongCount).toBe(2);
    expect(q1.totalResponses).toBe(4);
    expect(q1.percentCorrect).toBe(50);
    expect(q1.difficultyIndex).toBe(0.5);
    expect(q1.difficultyCategory).toBe("MODERATE");

    expect(q2.correctCount).toBe(2);
    expect(q2.wrongCount).toBe(2);
    expect(q2.percentCorrect).toBe(50);
    // Non-MCQ items carry no distractor data.
    expect(q2.distractors).toEqual([]);
  });

  it("reports distractors for multiple choice items", () => {
    const { itemAnalysis } = computeTestAnalytics(makeTest());
    const q1 = itemAnalysis[0];

    expect(q1.distractors).toHaveLength(1);
    expect(q1.distractors[0]).toMatchObject({
      optionId: "o2",
      selectedCount: 2,
      isFunctioning: true,
    });
  });

  it("builds the score distribution buckets", () => {
    const { scoreDistribution } = computeTestAnalytics(makeTest());
    expect(scoreDistribution).toHaveLength(5);
    const outstanding = scoreDistribution.find((b) => b.label.startsWith("Outstanding"));
    expect(outstanding?.count).toBe(1);
  });

  it("falls back to summing question points when maxScore is missing", () => {
    const input = makeTest();
    input.maxScore = null;
    const { summary, gradebook } = computeTestAnalytics(input);
    expect(summary.totalPoints).toBe(10);
    expect(gradebook[0].totalPoints).toBe(10);
  });
});
