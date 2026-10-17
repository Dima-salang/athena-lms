/**
 * Zod Validation Schemas
 *
 * Centralized validation schemas used for:
 *  - API request body validation (server-side)
 *  - React Hook Form resolver (client-side)
 *
 * Keeping schemas in one place ensures client and server validations stay in sync.
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Auth Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/\d/, "Must contain at least one digit"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const firstLoginChangePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/\d/, "Must contain at least one digit"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

// ─────────────────────────────────────────────────────────────────────────────
// Admin Schemas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Learner Reference Number. Roster import has always enforced this; the admin
 * create/edit forms now share the same rule so a typo can't become a student's
 * first password.
 */
const lrnValue = z
  .string()
  .regex(/^\d{12}$/, "LRN must be exactly 12 digits");

export const createSectionSchema = z.object({
  name: z.string().min(1, "Section name is required").max(100),
  adviserName: z.string().optional(),
  gradeLevel: z.string().optional(),
  schoolYear: z.string().optional(),
});

export const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(100),
  code: z.string().optional(),
  description: z.string().optional(),
});

export const createTeacherAssignmentSchema = z.object({
  teacherProfileId: z.string().min(1, "Teacher is required"),
  sectionId: z.string().min(1, "Section is required"),
  subjectId: z.string().min(1, "Subject is required"),
  schoolYear: z.string().optional(),
});

export const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
  sectionId: z.string().optional(), // Required if role = STUDENT
  lrn: lrnValue.optional().or(z.literal("")), // Required if role = STUDENT
});

/** Editing an existing account. Every field is optional (partial update). */
export const updateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]).optional(),
  sectionId: z.string().nullable().optional(),
  lrn: lrnValue.optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export const updateSectionSchema = z.object({
  name: z.string().min(1, "Section name is required").max(100).optional(),
  adviserName: z.string().optional(),
  gradeLevel: z.string().optional(),
  schoolYear: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(100).optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateTeacherAssignmentSchema = z.object({
  teacherProfileId: z.string().min(1, "Teacher is required").optional(),
  sectionId: z.string().min(1, "Section is required").optional(),
  subjectId: z.string().min(1, "Subject is required").optional(),
  schoolYear: z.string().optional(),
});

/** Admin bulk action over a set of accounts. */
export const bulkUserActionSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one account"),
  action: z.enum(["activate", "deactivate", "delete"]),
});

/** First message per field, so the UI can show it under the right input. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const createTestSchema = z.object({
  title: z.string().min(1, "Test title is required").max(200),
  description: z.string().optional(),
  examType: z.enum(["QUIZ", "LONG_TEST", "SUMMATIVE", "PERIODICAL"]),
  subjectId: z.string().optional(),
  sectionIds: z.array(z.string()).min(1, "At least one section is required"),
  durationSeconds: z.number().int().positive().optional().nullable(),
  hasInfiniteTime: z.boolean().default(false),
  issueDate: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
});

export const optionSchema = z.object({
  id: z.string().optional(),
  optionText: z.string().min(1, "Option text is required"),
  matchText: z.string().optional().nullable(),
  orderIndex: z.number().int().default(0),
});

export const questionSchema = z.object({
  id: z.string().optional(),
  questionNumber: z.number().int().positive(),
  questionText: z.string().min(1, "Question text is required"),
  questionType: z.enum([
    "MULTIPLE_CHOICE",
    "TRUE_FALSE",
    "IDENTIFICATION",
    "ACRONYM",
    "MATCHING",
    "ESSAY",
  ]),
  fullPoints: z.number().positive("Points must be positive"),
  correctAnswer: z.string().optional().nullable(),
  alternativeAnswers: z.string().optional().nullable(), // JSON
  correctOptionId: z.string().optional().nullable(),
  rubric: z.string().optional().nullable(),
  orderIndex: z.number().int().default(0),
  options: z.array(optionSchema).default([]),
});

export const specialAccessSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  customDueDate: z.string().datetime().optional().nullable(),
  extendedSeconds: z.number().int().nonnegative().optional().nullable(),
  isUnlocked: z.boolean().default(true),
});

// ─────────────────────────────────────────────────────────────────────────────
// Student Answer Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const studentAnswerSchema = z.object({
  questionId: z.string(),
  optionId: z.string().optional().nullable(),
  textAnswer: z.string().optional().nullable(),
  matchingPairs: z.string().optional().nullable(), // JSON
  isFlagged: z.boolean().default(false),
});

export const autosaveAnswersSchema = z.object({
  submissionId: z.string(),
  answers: z.array(studentAnswerSchema),
});

// ─────────────────────────────────────────────────────────────────────────────
// Inferred Types (for React Hook Form usage)
// ─────────────────────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type FirstLoginChangePasswordInput = z.infer<
  typeof firstLoginChangePasswordSchema
>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type CreateTestInput = z.infer<typeof createTestSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type OptionInput = z.infer<typeof optionSchema>;
export type StudentAnswerInput = z.infer<typeof studentAnswerSchema>;
export type SpecialAccessInput = z.infer<typeof specialAccessSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
