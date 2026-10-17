import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || !["TEACHER", "ADMIN"].includes((session.user as { role?: string }).role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const source = await db.test.findUnique({
      where: { id },
      include: {
        sections: true,
        questions: {
          include: { options: true },
        },
      },
    });

    if (!source) {
      return NextResponse.json({ error: "Source test not found" }, { status: 404 });
    }

    // Clone test in transaction
    const cloned = await db.$transaction(async (tx) => {
      const newTest = await tx.test.create({
        data: {
          title: `${source.title} (Copy)`,
          description: source.description,
          examType: source.examType,
          authorId: session.user.id,
          subjectId: source.subjectId,
          durationSeconds: source.durationSeconds,
          hasInfiniteTime: source.hasInfiniteTime,
          isDraft: true,
          isPublished: false,
          shuffleQuestions: source.shuffleQuestions,
          shuffleOptions: source.shuffleOptions,
          maxScore: source.maxScore,
        },
      });

      // Clone sections
      if (source.sections.length > 0) {
        await tx.testSection.createMany({
          data: source.sections.map((s) => ({
            testId: newTest.id,
            sectionId: s.sectionId,
          })),
        });
      }

      // Clone questions and their options
      for (const q of source.questions) {
        const optionIdMap = new Map<string, string>(); // oldOptionId -> newOptionId

        const newQuestion = await tx.question.create({
          data: {
            testId: newTest.id,
            questionNumber: q.questionNumber,
            questionText: q.questionText,
            questionType: q.questionType,
            fullPoints: q.fullPoints,
            correctAnswer: q.correctAnswer,
            alternativeAnswers: q.alternativeAnswers,
            rubric: q.rubric,
            imageUrl: q.imageUrl,
            orderIndex: q.orderIndex,
          },
        });

        // Clone options
        for (const opt of q.options) {
          const newOptId = nanoid();
          optionIdMap.set(opt.id, newOptId);

          await tx.option.create({
            data: {
              id: newOptId,
              questionId: newQuestion.id,
              optionText: opt.optionText,
              matchText: opt.matchText,
              orderIndex: opt.orderIndex,
            },
          });
        }

        // If question had a correctOptionId, re-map it to the cloned option
        if (q.correctOptionId && optionIdMap.has(q.correctOptionId)) {
          await tx.question.update({
            where: { id: newQuestion.id },
            data: { correctOptionId: optionIdMap.get(q.correctOptionId) },
          });
        }
      }

      return newTest;
    });

    return NextResponse.json(cloned, { status: 201 });
  } catch (error) {
    console.error("POST /api/teacher/tests/[id]/duplicate error:", error);
    return NextResponse.json({ error: "Failed to duplicate test" }, { status: 500 });
  }
}
