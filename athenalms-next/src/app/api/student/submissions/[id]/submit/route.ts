import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { gradeSubmission, type QuestionType } from "@/lib/grading";
import { transmute, type TransmutationConfig, type TransmutationFormula } from "@/lib/transmutation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: submissionId } = await params;

    const submission = await db.submission.findUnique({
      where: { id: submissionId },
      include: {
        test: {
          include: {
            questions: {
              include: { options: true },
            },
            transmutationConfig: true,
          },
        },
        studentAnswers: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.studentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (["SUBMITTED", "GRADED"].includes(submission.status)) {
      return NextResponse.json(
        { error: "Test has already been submitted." },
        { status: 400 }
      );
    }

    const test = submission.test;
    const now = new Date();

    // Prepare questions and matching pairs
    const matchingPairsMap = new Map<string, Array<{ optionId: string; correctText: string }>>();
    for (const q of test.questions) {
      if (q.questionType === "MATCHING") {
        matchingPairsMap.set(
          q.id,
          q.options.map((o) => ({ optionId: o.id, correctText: o.matchText || "" }))
        );
      }
    }

    const answersInput = submission.studentAnswers.map((a) => ({
      questionId: a.questionId,
      optionId: a.optionId,
      textAnswer: a.textAnswer,
      matchingPairs: a.matchingPairs,
    }));

    // Run Auto-Grading Engine
    const gradableQuestions = test.questions.map((q) => ({
      ...q,
      questionType: q.questionType as QuestionType,
    }));

    const { results, rawScore } = gradeSubmission(
      gradableQuestions,
      answersInput,
      matchingPairsMap
    );

    const totalPoints =
      test.maxScore || test.questions.reduce((sum, q) => sum + q.fullPoints, 0);

    // Compute DepEd Transmuted Grade
    const transConfig: TransmutationConfig = test.transmutationConfig
      ? {
          formula: test.transmutationConfig.formula as TransmutationFormula,
          baseScore: test.transmutationConfig.baseScore ?? undefined,
          passingRawPercent: test.transmutationConfig.passingRawPercent ?? undefined,
          passingGrade: test.transmutationConfig.passingGrade ?? undefined,
        }
      : { formula: "DEPED_STANDARD" };

    const transmutationResult = transmute(
      rawScore,
      totalPoints,
      transConfig
    );

    // Check if test contains ESSAY questions (if yes, status = SUBMITTED awaiting teacher review, else GRADED)
    const hasEssay = test.questions.some((q) => q.questionType === "ESSAY");
    const finalStatus = hasEssay ? "SUBMITTED" : "GRADED";

    // Persist scores and submission finalization in transaction
    await db.$transaction(async (tx) => {
      for (const res of results) {
        await tx.studentAnswer.updateMany({
          where: {
            submissionId,
            questionId: res.questionId,
          },
          data: {
            points: res.points,
          },
        });
      }

      await tx.submission.update({
        where: { id: submissionId },
        data: {
          status: finalStatus,
          submittedAt: now,
          gradedAt: hasEssay ? null : now,
          rawScore,
          transmutedGrade: transmutationResult.transmutedGrade,
        },
      });
    });

    return NextResponse.json({
      success: true,
      submissionId,
      status: finalStatus,
      rawScore,
      totalPoints,
      rawPercent: transmutationResult.rawPercent,
      transmutedGrade: transmutationResult.transmutedGrade,
      isPassing: transmutationResult.isPassing,
      hasPendingEssay: hasEssay,
    });
  } catch (error) {
    console.error("Submit test error:", error);
    return NextResponse.json({ error: "Failed to submit test" }, { status: 500 });
  }
}
