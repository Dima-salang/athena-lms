import { describe, expect, it } from "vitest";

import {
  bulkUserActionSchema,
  createUserSchema,
  fieldErrors,
  updateSectionSchema,
  updateSubjectSchema,
  updateTeacherAssignmentSchema,
  updateUserSchema,
} from "../validations";

describe("updateUserSchema", () => {
  it("accepts a partial update", () => {
    expect(updateUserSchema.safeParse({ firstName: "Maria" }).success).toBe(true);
    expect(updateUserSchema.safeParse({}).success).toBe(true);
  });

  it("allows clearing a section and an email", () => {
    const parsed = updateUserSchema.safeParse({ sectionId: null, email: "" });
    expect(parsed.success).toBe(true);
  });

  it("rejects an empty required field", () => {
    expect(updateUserSchema.safeParse({ firstName: "" }).success).toBe(false);
  });

  it("rejects a malformed email", () => {
    expect(updateUserSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });

  it("requires a 12-digit LRN when one is given", () => {
    expect(updateUserSchema.safeParse({ lrn: "123456789012" }).success).toBe(true);
    expect(updateUserSchema.safeParse({ lrn: "12345" }).success).toBe(false);
    expect(updateUserSchema.safeParse({ lrn: "12345678901a" }).success).toBe(false);
  });

  it("rejects an unknown role", () => {
    expect(updateUserSchema.safeParse({ role: "PRINCIPAL" }).success).toBe(false);
  });
});

describe("createUserSchema LRN rule", () => {
  it("stays optional but must be 12 digits when present", () => {
    expect(createUserSchema.safeParse({ username: "student.004", firstName: "A", lastName: "B", role: "STUDENT" }).success).toBe(true);
    expect(createUserSchema.safeParse({ username: "student.004", firstName: "A", lastName: "B", role: "STUDENT", lrn: "" }).success).toBe(true);
    expect(createUserSchema.safeParse({ username: "student.004", firstName: "A", lastName: "B", role: "STUDENT", lrn: "12" }).success).toBe(false);
  });
});

describe("updateSectionSchema / updateSubjectSchema", () => {
  it("accepts partial edits and the active flag", () => {
    expect(updateSectionSchema.safeParse({ isActive: false }).success).toBe(true);
    expect(updateSectionSchema.safeParse({ name: "Grade 10 - Socrates" }).success).toBe(true);
    expect(updateSubjectSchema.safeParse({ isActive: true, description: "" }).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(updateSectionSchema.safeParse({ name: "" }).success).toBe(false);
    expect(updateSubjectSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

describe("updateTeacherAssignmentSchema", () => {
  it("accepts a single changed field", () => {
    expect(updateTeacherAssignmentSchema.safeParse({ subjectId: "sub-2" }).success).toBe(true);
  });

  it("rejects empty ids", () => {
    expect(updateTeacherAssignmentSchema.safeParse({ sectionId: "" }).success).toBe(false);
  });
});

describe("bulkUserActionSchema", () => {
  it("accepts the three known actions", () => {
    for (const action of [ "activate", "deactivate", "delete" ] as const) {
      expect(bulkUserActionSchema.safeParse({ ids: [ "u1" ], action }).success).toBe(true);
    }
  });

  it("needs at least one id", () => {
    expect(bulkUserActionSchema.safeParse({ ids: [], action: "delete" }).success).toBe(false);
  });

  it("rejects an unknown action", () => {
    expect(bulkUserActionSchema.safeParse({ ids: [ "u1" ], action: "expel" }).success).toBe(false);
  });
});

describe("fieldErrors", () => {
  it("keeps the first message per field", () => {
    const parsed = updateUserSchema.safeParse({ firstName: "", email: "nope" });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const fields = fieldErrors(parsed.error);
    expect(fields.firstName).toBe("First name is required");
    expect(fields.email).toBe("Invalid email");
  });
});
