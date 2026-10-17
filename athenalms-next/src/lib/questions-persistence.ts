import type { Prisma } from "@prisma/client";

/**
 * Shared question/option upsert used by both the strict save route
 * (`POST .../questions`) and the lenient autosave route (`PUT .../draft`).
 *
 * Caller is responsible for validation strictness; this function tolerates
 * empty strings so drafts can be persisted while a teacher is still authoring.
 */

export type QuestionTypeValue =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "IDENTIFICATION"
  | "ACRONYM"
  | "MATCHING"
  | "ESSAY";

export interface PersistableOption {
  id?: string | null;
  optionText?: string | null;
  matchText?: string | null;
  orderIndex?: number | null;
}

export interface PersistableQuestion {
  id?: string | null;
  questionNumber?: number | null;
  questionText?: string | null;
  questionType: QuestionTypeValue;
  fullPoints?: number | null;
  correctAnswer?: string | null;
  alternativeAnswers?: string | null;
  correctOptionId?: string | null;
  rubric?: string | null;
  orderIndex?: number | null;
  options?: PersistableOption[] | null;
}

/**
 * Upsert questions and their options for a test, delete removed ones, and
 * recompute the test's total points. Returns the new total.
 */
export async function persistQuestions(
  tx: Prisma.TransactionClient,
  testId: string,
  questions: PersistableQuestion[]
): Promise<number> {
  const incomingIds = questions
    .map((q) => q.id)
    .filter((id): id is string => Boolean(id));

  // Delete questions the teacher removed.
  if (incomingIds.length > 0) {
    await tx.question.deleteMany({ where: { testId, id: { notIn: incomingIds } } });
  }

  let totalPoints = 0;

  for (const [qIndex, q] of questions.entries()) {
    const fullPoints = q.fullPoints ?? 0;
    totalPoints += fullPoints;

    const commonData = {
      questionNumber: q.questionNumber ?? qIndex + 1,
      questionText: q.questionText ?? "",
      questionType: q.questionType,
      fullPoints,
      correctAnswer: q.correctAnswer || null,
      alternativeAnswers: q.alternativeAnswers || null,
      correctOptionId: q.correctOptionId || null,
      rubric: q.rubric || null,
      orderIndex: q.orderIndex ?? qIndex,
    };

    let questionId = q.id ?? undefined;

    if (questionId) {
      await tx.question.update({ where: { id: questionId }, data: commonData });
    } else {
      const created = await tx.question.create({
        data: { testId, ...commonData },
      });
      questionId = created.id;
    }

    const options = q.options ?? [];
    if (options.length === 0) continue;

    const incomingOptionIds = options
      .map((o) => o.id)
      .filter((id): id is string => Boolean(id));

    if (incomingOptionIds.length > 0) {
      await tx.option.deleteMany({
        where: { questionId, id: { notIn: incomingOptionIds } },
      });
    }

    let resolvedCorrectOptionId = q.correctOptionId || null;

    for (const [idx, opt] of options.entries()) {
      const optionData = {
        optionText: opt.optionText ?? "",
        matchText: opt.matchText || null,
        orderIndex: opt.orderIndex ?? idx,
      };

      let optionId: string;
      if (opt.id) {
        await tx.option.update({ where: { id: opt.id }, data: optionData });
        optionId = opt.id;
      } else {
        const created = await tx.option.create({
          data: { questionId, ...optionData },
        });
        optionId = created.id;
      }

      if (
        q.questionType === "MULTIPLE_CHOICE" &&
        ((opt.id && opt.id === q.correctOptionId) ||
          q.correctAnswer === String(idx) ||
          q.correctAnswer === String(opt.orderIndex ?? idx))
      ) {
        resolvedCorrectOptionId = optionId;
      }
    }

    if (q.questionType === "MULTIPLE_CHOICE" && resolvedCorrectOptionId) {
      await tx.question.update({
        where: { id: questionId },
        data: { correctOptionId: resolvedCorrectOptionId },
      });
    }
  }

  return totalPoints;
}
