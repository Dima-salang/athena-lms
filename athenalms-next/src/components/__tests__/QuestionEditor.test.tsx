import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestionEditor, type EditorQuestion } from "../exam/QuestionEditor";
import { describe, it, expect, vi } from "vitest";

describe("QuestionEditor Component", () => {
  const baseMcqQuestion: EditorQuestion = {
    id: "q-1",
    questionNumber: 1,
    questionText: "What is the capital of the Philippines?",
    questionType: "MULTIPLE_CHOICE",
    fullPoints: 1,
    correctOptionId: "opt-2",
    orderIndex: 0,
    options: [
      { id: "opt-1", optionText: "Cebu City", orderIndex: 0 },
      { id: "opt-2", optionText: "Manila", orderIndex: 1 },
      { id: "opt-3", optionText: "Davao City", orderIndex: 2 },
    ],
  };

  it("renders question number, stem prompt, and points", () => {
    const handleChange = vi.fn();
    const handleDelete = vi.fn();

    render(
      <QuestionEditor
        question={baseMcqQuestion}
        onChange={handleChange}
        onDelete={handleDelete}
      />
    );

    expect(screen.getByText("Q1.")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("What is the capital of the Philippines?")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("1")).toBeInTheDocument();
  });

  it("triggers onChange when question prompt text is edited", () => {
    const handleChange = vi.fn();
    render(
      <QuestionEditor
        question={baseMcqQuestion}
        onChange={handleChange}
        onDelete={vi.fn()}
      />
    );

    const textarea = screen.getByDisplayValue("What is the capital of the Philippines?");
    fireEvent.change(textarea, { target: { value: "Updated prompt?" } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        questionText: "Updated prompt?",
      })
    );
  });

  it("triggers onChange when fullPoints is edited", () => {
    const handleChange = vi.fn();
    render(
      <QuestionEditor
        question={baseMcqQuestion}
        onChange={handleChange}
        onDelete={vi.fn()}
      />
    );

    const pointsInput = screen.getByDisplayValue("1");
    fireEvent.change(pointsInput, { target: { value: "2.5" } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        fullPoints: 2.5,
      })
    );
  });

  it("renders MCQ choices and allows adding a new option", () => {
    const handleChange = vi.fn();
    render(
      <QuestionEditor
        question={baseMcqQuestion}
        onChange={handleChange}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue("Cebu City")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Manila")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Davao City")).toBeInTheDocument();

    const addOptionBtn = screen.getByRole("button", { name: /Add Option/i });
    fireEvent.click(addOptionBtn);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.arrayContaining([
          expect.objectContaining({ optionText: "Cebu City" }),
          expect.objectContaining({ optionText: "Manila" }),
          expect.objectContaining({ optionText: "Davao City" }),
          expect.objectContaining({ optionText: "", orderIndex: 3 }),
        ]),
      })
    );
  });

  it("renders True/False configuration when questionType is TRUE_FALSE", () => {
    const tfQuestion: EditorQuestion = {
      id: "q-2",
      questionNumber: 2,
      questionText: "The earth is flat.",
      questionType: "TRUE_FALSE",
      fullPoints: 1,
      correctAnswer: "False",
      orderIndex: 1,
      options: [],
    };

    const handleChange = vi.fn();
    render(
      <QuestionEditor
        question={tfQuestion}
        onChange={handleChange}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText("Correct Answer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "True" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "False" })).toBeInTheDocument();

    // Click 'True' to switch answer
    fireEvent.click(screen.getByRole("button", { name: "True" }));
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        correctAnswer: "True",
      })
    );
  });

  it("renders Identification inputs when questionType is IDENTIFICATION", () => {
    const identQuestion: EditorQuestion = {
      id: "q-3",
      questionNumber: 3,
      questionText: "Who wrote Noli Me Tangere?",
      questionType: "IDENTIFICATION",
      fullPoints: 2,
      correctAnswer: "Jose Rizal",
      alternativeAnswers: "Dr. Jose Rizal, Pepe",
      orderIndex: 2,
      options: [],
    };

    const handleChange = vi.fn();
    render(
      <QuestionEditor
        question={identQuestion}
        onChange={handleChange}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue("Jose Rizal")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Dr. Jose Rizal, Pepe")).toBeInTheDocument();
  });

  it("renders Essay rubric when questionType is ESSAY", () => {
    const essayQuestion: EditorQuestion = {
      id: "q-4",
      questionNumber: 4,
      questionText: "Discuss the implications of the Industrial Revolution.",
      questionType: "ESSAY",
      fullPoints: 10,
      rubric: "5 pts Content, 3 pts Structure, 2 pts Grammar",
      orderIndex: 3,
      options: [],
    };

    render(
      <QuestionEditor
        question={essayQuestion}
        onChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(
      screen.getByDisplayValue("5 pts Content, 3 pts Structure, 2 pts Grammar")
    ).toBeInTheDocument();
  });
});
