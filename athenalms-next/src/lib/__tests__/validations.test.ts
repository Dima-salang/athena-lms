import { describe, it, expect } from "vitest";
import {
  loginSchema,
  changePasswordSchema,
  createSectionSchema,
  createSubjectSchema,
  createTestSchema,
  questionSchema,
  autosaveAnswersSchema,
} from "../validations";

describe("Validation Schemas", () => {
  it("validates login inputs", () => {
    expect(
      loginSchema.safeParse({ username: "admin", password: "pwd" }).success,
    ).toBe(true);
    expect(loginSchema.safeParse({ username: "", password: "" }).success).toBe(
      false,
    );
  });

  it("validates password change rules with matching confirmation", () => {
    const valid = changePasswordSchema.safeParse({
      currentPassword: "OldPassword123!",
      newPassword: "NewPassword123!",
      confirmPassword: "NewPassword123!",
    });
    expect(valid.success).toBe(true);

    const mismatch = changePasswordSchema.safeParse({
      currentPassword: "OldPassword123!",
      newPassword: "NewPassword123!",
      confirmPassword: "DifferentPassword123!",
    });
    expect(mismatch.success).toBe(false);
  });

  it("validates section and subject creation", () => {
    expect(
      createSectionSchema.safeParse({ name: "Grade 10 - Socrates" }).success,
    ).toBe(true);
    expect(createSectionSchema.safeParse({ name: "" }).success).toBe(false);

    expect(createSubjectSchema.safeParse({ name: "Biology 10" }).success).toBe(
      true,
    );
  });

  it("validates test and question structure", () => {
    const testResult = createTestSchema.safeParse({
      title: "Quarter 1 Summative Exam",
      examType: "SUMMATIVE",
      sectionIds: ["sec-1"],
    });
    expect(testResult.success).toBe(true);

    const questionResult = questionSchema.safeParse({
      questionNumber: 1,
      questionText: "What is the powerhouse of the cell?",
      questionType: "MULTIPLE_CHOICE",
      fullPoints: 2,
      options: [
        { optionText: "Mitochondria", orderIndex: 0 },
        { optionText: "Nucleus", orderIndex: 1 },
      ],
    });
    expect(questionResult.success).toBe(true);
  });

  it("validates autosave answers payload", () => {
    const result = autosaveAnswersSchema.safeParse({
      submissionId: "sub-123",
      answers: [
        { questionId: "q-1", optionId: "opt-1", isFlagged: false },
        { questionId: "q-2", textAnswer: "True", isFlagged: true },
      ],
    });
    expect(result.success).toBe(true);
  });
});
