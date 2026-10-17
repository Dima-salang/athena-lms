import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { persistQuestions } from "@/lib/questions-persistence";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Lenient autosave for the test editor. Accepts incomplete questions (empty
 * stem, empty options, zero points) so drafts are persisted on every change.
 * The strict `POST .../questions` route remains for validated saves.
 */

const questionTypes = [
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "IDENTIFICATION",
  "ACRONYM",
  "MATCHING",
  "ESSAY",
] as const;

const examTypes = ["QUIZ", "LONG_TEST", "SUMMATIVE", "PERIODICAL"] as const;

const draftOptionSchema = z.object({
  id: z.string().nullish(),
  optionText: z.string().default(""),
  matchText: z.string().nullish(),
  orderIndex: z.number().int().default(0),
});

const draftQuestionSchema = z.object({
  id: z.string().nullish(),
  questionNumber: z.number().int().optional(),
  questionText: z.string().default(""),
  questionType: z.enum(questionTypes),
  fullPoints: z.number().nonnegative().default(0),
  correctAnswer: z.string().nullish(),
  alternativeAnswers: z.string().nullish(),
  correctOptionId: z.string().nullish(),
  rubric: z.string().nullish(),
  orderIndex: z.number().int().default(0),
  options: z.array(draftOptionSchema).default([]),
});

const draftSettingsSchema = z.object({
  title: z.string().optional(),
  description: z.string().nullish(),
  examType: z.enum(examTypes).optional(),
  durationSeconds: z.number().int().nonnegative().nullish(),
  hasInfiniteTime: z.boolean().optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  issueDate: z.string().nullish(),
  dueDate: z.string().nullish(),
  sectionIds: z.array(z.string()).optional(),
});

const draftBodySchema = z.object({
  settings: draftSettingsSchema.optional(),
  questions: z.array(draftQuestionSchema).default([]),
});

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (
      !session?.user ||
      !["TEACHER", "ADMIN"].includes(
        (session.user as { role?: string }).role || ""
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: testId } = await params;
    const body = await request.json();

    const parsed = draftBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid draft payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { settings, questions } = parsed.data;

    await db.$transaction(async (tx) => {
      if (settings) {
        const { sectionIds, issueDate, dueDate, ...scalars } = settings;

        if (Array.isArray(sectionIds)) {
          await tx.testSection.deleteMany({ where: { testId } });
          if (sectionIds.length > 0) {
            await tx.testSection.createMany({
              data: sectionIds.map((sectionId) => ({ testId, sectionId })),
            });
          }
        }

        await tx.test.update({
          where: { id: testId },
          data: {
            ...scalars,
            ...(issueDate !== undefined
              ? { issueDate: issueDate ? new Date(issueDate) : null }
              : {}),
            ...(dueDate !== undefined
              ? { dueDate: dueDate ? new Date(dueDate) : null }
              : {}),
          },
        });
      }

      const totalPoints = await persistQuestions(tx, testId, questions);
      await tx.test.update({
        where: { id: testId },
        data: { maxScore: totalPoints },
      });
    });

    const savedQuestions = await db.question.findMany({
      where: { testId },
      orderBy: { orderIndex: "asc" },
      include: { options: { orderBy: { orderIndex: "asc" } } },
    });

    return NextResponse.json({
      questions: savedQuestions,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("PUT /api/teacher/tests/[id]/draft error:", error);
    return NextResponse.json(
      { error: "Failed to autosave draft" },
      { status: 500 }
    );
  }
}
