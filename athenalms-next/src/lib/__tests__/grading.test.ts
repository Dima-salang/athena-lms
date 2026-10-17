import { describe, it, expect } from "vitest";
import {
  gradeAnswer,
  gradeSubmission,
  type GradableQuestion,
  type StudentAnswerInput,
} from "../grading";

describe("Grading Engine - Individual Questions", () => {
  describe("MULTIPLE_CHOICE", () => {
    const mcqQuestion: GradableQuestion = {
      id: "q-mcq-1",
      questionType: "MULTIPLE_CHOICE",
      fullPoints: 2,
      correctOptionId: "opt-correct",
    };

    it("awards full points when the student selects the correct option", () => {
      const answer: StudentAnswerInput = {
        questionId: "q-mcq-1",
        optionId: "opt-correct",
      };
      const result = gradeAnswer(mcqQuestion, answer);
      expect(result.isCorrect).toBe(true);
      expect(result.points).toBe(2);
    });

    it("awards 0 points when the student selects an incorrect option", () => {
      const answer: StudentAnswerInput = {
        questionId: "q-mcq-1",
        optionId: "opt-wrong",
      };
      const result = gradeAnswer(mcqQuestion, answer);
      expect(result.isCorrect).toBe(false);
      expect(result.points).toBe(0);
    });

    it("awards 0 points when optionId is null or missing", () => {
      const answer: StudentAnswerInput = {
        questionId: "q-mcq-1",
        optionId: null,
      };
      const result = gradeAnswer(mcqQuestion, answer);
      expect(result.isCorrect).toBe(false);
      expect(result.points).toBe(0);
    });
  });

  describe("TRUE_FALSE", () => {
    const tfQuestion: GradableQuestion = {
      id: "q-tf-1",
      questionType: "TRUE_FALSE",
      fullPoints: 1,
      correctAnswer: "True",
    };

    it("awards points for exact case match", () => {
      const answer: StudentAnswerInput = {
        questionId: "q-tf-1",
        textAnswer: "True",
      };
      const result = gradeAnswer(tfQuestion, answer);
      expect(result.isCorrect).toBe(true);
      expect(result.points).toBe(1);
    });

    it("awards points case-insensitively with whitespace trimmed", () => {
      const answer: StudentAnswerInput = {
        questionId: "q-tf-1",
        textAnswer: "  true  ",
      };
      const result = gradeAnswer(tfQuestion, answer);
      expect(result.isCorrect).toBe(true);
      expect(result.points).toBe(1);
    });

    it("awards 0 points for incorrect boolean choice", () => {
      const answer: StudentAnswerInput = {
        questionId: "q-tf-1",
        textAnswer: "False",
      };
      const result = gradeAnswer(tfQuestion, answer);
      expect(result.isCorrect).toBe(false);
      expect(result.points).toBe(0);
    });
  });

  describe("IDENTIFICATION & ACRONYM", () => {
    const identQuestion: GradableQuestion = {
      id: "q-id-1",
      questionType: "IDENTIFICATION",
      fullPoints: 5,
      correctAnswer: "Jose Rizal",
      alternativeAnswers: JSON.stringify(["Dr. Jose Rizal", "Pepe", "Rizal"]),
    };

    it("matches primary answer case-insensitively", () => {
      const answer: StudentAnswerInput = {
        questionId: "q-id-1",
        textAnswer: "JOSE RIZAL",
      };
      const result = gradeAnswer(identQuestion, answer);
      expect(result.isCorrect).toBe(true);
      expect(result.points).toBe(5);
    });

    it("matches alternative accepted answers", () => {
      const answer: StudentAnswerInput = {
        questionId: "q-id-1",
        textAnswer: "Pepe",
      };
      const result = gradeAnswer(identQuestion, answer);
      expect(result.isCorrect).toBe(true);
      expect(result.points).toBe(5);
    });

    it("normalizes internal multi-spaces and edge whitespace", () => {
      const answer: StudentAnswerInput = {
        questionId: "q-id-1",
        textAnswer: "   Dr.   Jose    Rizal   ",
      };
      const result = gradeAnswer(identQuestion, answer);
      expect(result.isCorrect).toBe(true);
      expect(result.points).toBe(5);
    });

    it("awards 0 points for wrong text answer", () => {
      const answer: StudentAnswerInput = {
        questionId: "q-id-1",
        textAnswer: "Andres Bonifacio",
      };
      const result = gradeAnswer(identQuestion, answer);
      expect(result.isCorrect).toBe(false);
      expect(result.points).toBe(0);
    });

    it("awards 0 points for empty answer", () => {
      const answer: StudentAnswerInput = {
        questionId: "q-id-1",
        textAnswer: "   ",
      };
      const result = gradeAnswer(identQuestion, answer);
      expect(result.isCorrect).toBe(false);
      expect(result.points).toBe(0);
    });

    it("handles ACRONYM type identically", () => {
      const acronymQ: GradableQuestion = {
        id: "q-acr-1",
        questionType: "ACRONYM",
        fullPoints: 3,
        correctAnswer: "HTML",
        alternativeAnswers: JSON.stringify(["HyperText Markup Language"]),
      };

      const result = gradeAnswer(acronymQ, {
        questionId: "q-acr-1",
        textAnswer: "hypertext markup language",
      });
      expect(result.isCorrect).toBe(true);
      expect(result.points).toBe(3);
    });
  });

  describe("MATCHING", () => {
    const matchingQ: GradableQuestion = {
      id: "q-match-1",
      questionType: "MATCHING",
      fullPoints: 4,
    };

    const correctPairs = [
      { optionId: "opt-1", correctText: "Manila" },
      { optionId: "opt-2", correctText: "Tokyo" },
    ];

    it("awards full points when all pairs match", () => {
      const answer: StudentAnswerInput = {
        questionId: "q-match-1",
        matchingPairs: JSON.stringify([
          { optionId: "opt-1", matchedText: "manila" },
          { optionId: "opt-2", matchedText: "Tokyo" },
        ]),
      };
      const result = gradeAnswer(matchingQ, answer, correctPairs);
      expect(result.isCorrect).toBe(true);
      expect(result.points).toBe(4);
    });

    it("awards partial points when only half pairs match", () => {
      const answer: StudentAnswerInput = {
        questionId: "q-match-1",
        matchingPairs: JSON.stringify([
          { optionId: "opt-1", matchedText: "Manila" },
          { optionId: "opt-2", matchedText: "Seoul" },
        ]),
      };
      const result = gradeAnswer(matchingQ, answer, correctPairs);
      expect(result.isCorrect).toBe(false);
      expect(result.points).toBe(2);
    });

    it("handles malformed JSON gracefully with 0 points", () => {
      const answer: StudentAnswerInput = {
        questionId: "q-match-1",
        matchingPairs: "invalid-json-string",
      };
      const result = gradeAnswer(matchingQ, answer, correctPairs);
      expect(result.isCorrect).toBe(false);
      expect(result.points).toBe(0);
    });
  });

  describe("ESSAY", () => {
    const essayQ: GradableQuestion = {
      id: "q-essay-1",
      questionType: "ESSAY",
      fullPoints: 10,
    };

    it("always defaults to 0 points for manual grading", () => {
      const answer: StudentAnswerInput = {
        questionId: "q-essay-1",
        textAnswer: "A very thorough explanation of photosynthesis...",
      };
      const result = gradeAnswer(essayQ, answer);
      expect(result.isCorrect).toBe(false);
      expect(result.points).toBe(0);
    });
  });
});

describe("Grading Engine - Whole Submission", () => {
  const questions: GradableQuestion[] = [
    {
      id: "q1",
      questionType: "MULTIPLE_CHOICE",
      fullPoints: 2,
      correctOptionId: "opt-a",
    },
    {
      id: "q2",
      questionType: "TRUE_FALSE",
      fullPoints: 1,
      correctAnswer: "True",
    },
    {
      id: "q3",
      questionType: "IDENTIFICATION",
      fullPoints: 3,
      correctAnswer: "Oxygen",
    },
  ];

  it("calculates total raw score correctly across mixed questions", () => {
    const answers: StudentAnswerInput[] = [
      { questionId: "q1", optionId: "opt-a" }, // +2
      { questionId: "q2", textAnswer: "False" }, // +0
      { questionId: "q3", textAnswer: "oxygen" }, // +3
    ];

    const { results, rawScore } = gradeSubmission(questions, answers);
    expect(rawScore).toBe(5);
    expect(results).toHaveLength(3);
    expect(results[0].points).toBe(2);
    expect(results[1].points).toBe(0);
    expect(results[2].points).toBe(3);
  });

  it("handles missing answers by assigning 0 points", () => {
    const answers: StudentAnswerInput[] = [
      { questionId: "q1", optionId: "opt-a" }, // +2
    ];

    const { results, rawScore } = gradeSubmission(questions, answers);
    expect(rawScore).toBe(2);
    expect(results[1].points).toBe(0);
    expect(results[2].points).toBe(0);
  });
});
