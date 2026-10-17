import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestionPalette, type QuestionStatus } from "../exam/QuestionPalette";
import { describe, it, expect, vi } from "vitest";

describe("QuestionPalette Component", () => {
  const mockQuestions: QuestionStatus[] = [
    { questionId: "q1", questionNumber: 1, isAnswered: true, isFlagged: false },
    { questionId: "q2", questionNumber: 2, isAnswered: false, isFlagged: true },
    { questionId: "q3", questionNumber: 3, isAnswered: true, isFlagged: true },
    { questionId: "q4", questionNumber: 4, isAnswered: false, isFlagged: false },
    { questionId: "q5", questionNumber: 5, isAnswered: false, isFlagged: false },
  ];

  it("renders the question navigation header and answered count", () => {
    render(
      <QuestionPalette
        questions={mockQuestions}
        currentIndex={0}
        onSelectQuestion={vi.fn()}
      />
    );

    expect(screen.getByText("Question Navigation")).toBeInTheDocument();
    expect(screen.getByText("2/5 answered")).toBeInTheDocument();
  });

  it("renders buttons for every question in the list", () => {
    render(
      <QuestionPalette
        questions={mockQuestions}
        currentIndex={0}
        onSelectQuestion={vi.fn()}
      />
    );

    for (let i = 1; i <= 5; i++) {
      expect(screen.getByRole("button", { name: String(i) })).toBeInTheDocument();
    }
  });

  it("calls onSelectQuestion with corresponding index when a button is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <QuestionPalette
        questions={mockQuestions}
        currentIndex={0}
        onSelectQuestion={handleSelect}
      />
    );

    const q3Btn = screen.getByRole("button", { name: "3" });
    fireEvent.click(q3Btn);
    expect(handleSelect).toHaveBeenCalledWith(2);

    const q5Btn = screen.getByRole("button", { name: "5" });
    fireEvent.click(q5Btn);
    expect(handleSelect).toHaveBeenCalledWith(4);
  });

  it("indicates the currently selected question", () => {
    const { rerender } = render(
      <QuestionPalette
        questions={mockQuestions}
        currentIndex={1}
        onSelectQuestion={vi.fn()}
      />
    );

    const q2Btn = screen.getByRole("button", { name: "2" });
    // Should have ring / active styling
    expect(q2Btn.className).toContain("ring-2");

    rerender(
      <QuestionPalette
        questions={mockQuestions}
        currentIndex={3}
        onSelectQuestion={vi.fn()}
      />
    );
    const q4Btn = screen.getByRole("button", { name: "4" });
    expect(q4Btn.className).toContain("ring-2");
  });
});
