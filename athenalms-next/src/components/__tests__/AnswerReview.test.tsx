import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { AnswerReview, parseMatchingPairs } from "../exam/AnswerReview";
import type { QuestionDTO, StudentAnswerDTO } from "../../types";

describe("AnswerReview", () => {
  it("labels the correct multiple-choice option even when the student chose wrong", () => {
    const question: QuestionDTO = {
      questionNumber: 1,
      questionText: "Capital of France?",
      questionType: "MULTIPLE_CHOICE",
      fullPoints: 1,
      orderIndex: 0,
      correctOptionId: "o2",
      options: [
        { id: "o1", optionText: "Madrid", orderIndex: 0 },
        { id: "o2", optionText: "Paris", orderIndex: 1 },
      ],
    };
    const answer: StudentAnswerDTO = { questionId: "q1", optionId: "o1" };

    render(<AnswerReview question={question} answer={answer} />);

    expect(screen.getByText("Correct answer")).toBeInTheDocument();
    expect(screen.getByText("Your answer")).toBeInTheDocument();
  });

  it("states the correct answer explicitly for text answers", () => {
    const question: QuestionDTO = {
      questionNumber: 2,
      questionText: "Who is the national hero?",
      questionType: "IDENTIFICATION",
      fullPoints: 1,
      orderIndex: 1,
      correctAnswer: "Rizal",
      alternativeAnswers: JSON.stringify(["Jose Rizal"]),
      options: [],
    };
    const answer: StudentAnswerDTO = { questionId: "q2", textAnswer: "Bonifacio" };

    render(<AnswerReview question={question} answer={answer} />);

    expect(screen.getByText("Correct answer")).toBeInTheDocument();
    expect(screen.getByText("Rizal")).toBeInTheDocument();
    expect(screen.getByText(/Also accepted: Jose Rizal/)).toBeInTheDocument();
  });

  it("shows premises, the student's match, and the correct match for matching questions", () => {
    const question: QuestionDTO = {
      questionNumber: 3,
      questionText: "Match the items",
      questionType: "MATCHING",
      fullPoints: 2,
      orderIndex: 2,
      options: [
        { id: "a", optionText: "Sun", matchText: "Star", orderIndex: 0 },
        { id: "b", optionText: "Moon", matchText: "Satellite", orderIndex: 1 },
      ],
    };
    const answer: StudentAnswerDTO = {
      questionId: "q3",
      matchingPairs: JSON.stringify([{ optionId: "a", matchedText: "Satellite" }]),
    };

    render(<AnswerReview question={question} answer={answer} />);

    // Premise (Column A) and both the student's pick and the correct answer.
    expect(screen.getByText("Sun")).toBeInTheDocument();
    // "Satellite" is the student's (wrong) match for Sun, and also the correct
    // match for Moon — both are visible.
    expect(screen.getAllByText("Satellite")).toHaveLength(2);
    expect(screen.getByText("Star")).toBeInTheDocument();
    // The unmatched premise is called out.
    expect(screen.getByText("Not matched")).toBeInTheDocument();
  });

  it("parses matching pairs safely", () => {
    expect(parseMatchingPairs(null)).toEqual([]);
    expect(parseMatchingPairs("not json")).toEqual([]);
    expect(
      parseMatchingPairs(JSON.stringify([{ optionId: "a", matchedText: "Star" }]))
    ).toEqual([{ optionId: "a", matchedText: "Star" }]);
  });
});
