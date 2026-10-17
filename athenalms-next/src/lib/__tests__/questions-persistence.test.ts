import { describe, it, expect } from "vitest";

import {
  answeredChoiceMessage,
  answeredQuestionMessage,
} from "../questions-persistence";

/**
 * A question or choice a student answered cannot be removed — StudentAnswer
 * points at both with a Restrict foreign key, so the delete would fail with
 * P2003. These messages are what the teacher sees instead, so they have to name
 * the item that is in the way.
 */
describe("answered-item messages", () => {
  it("names a single answered question", () => {
    expect(answeredQuestionMessage([3])).toBe(
      "You can't delete Question 3 — a student has already answered it."
    );
  });

  it("lists several answered questions", () => {
    expect(answeredQuestionMessage([3, 5])).toBe(
      "You can't delete Questions 3 and 5 — students have already answered them."
    );
    expect(answeredQuestionMessage([1, 2, 3, 4])).toBe(
      "You can't delete Questions 1, 2 and 3 (and 1 more) — students have already answered them."
    );
  });

  it("names the question whose choice is answered", () => {
    expect(answeredChoiceMessage(7)).toBe(
      "You can't remove a choice in Question 7 — a student has already picked it."
    );
  });
});
