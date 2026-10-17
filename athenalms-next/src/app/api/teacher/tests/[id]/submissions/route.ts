import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { gradeSubmission, type QuestionType } from "@/lib/grading";
import { transmute, type TransmutationConfig, type TransmutationFormula } from "@/lib/transmutation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || !["TEACHER", "ADMIN"].includes((session.user as { role?: string }).role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: testId } = await params;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();

    const submissions = await db.submission.findMany({
      where: {
        testId,
        ...(search
          ? {
              student: {
                OR: [
                  { firstName: { contains: search } },
                  { lastName: { contains: search } },
                  { username: { contains: search } },
                ],
              },
            }
          : {}),
      },
      orderBy: { submittedAt: "desc" },
      include: {
        test: { select: { maxScore: true, title: true } },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            studentProfile: {
              select: {
                lrn: true,
                section: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      submissions.map((s) => ({
        id: s.id,
        testId: s.testId,
        testTitle: s.test.title,
        studentId: s.studentId,
        studentName: `${s.student.firstName} ${s.student.lastName}`,
        studentLrn: s.student.studentProfile?.lrn || "—",
        sectionName: s.student.studentProfile?.section?.name || "—",
        status: s.status,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime?.toISOString(),
        submittedAt: s.submittedAt?.toISOString(),
        gradedAt: s.gradedAt?.toISOString(),
        rawScore: s.rawScore,
        transmutedGrade: s.transmutedGrade,
        totalPoints: s.test.maxScore || 0,
      }))
    );
  } catch (error) {
    console.error("GET submissions error:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

// Recalculate all submissions for a test (e.g. after correcting an answer key)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || !["TEACHER", "ADMIN"].includes((session.user as { role?: string }).role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: testId } = await params;

    const test = await db.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          include: { options: true },
        },
        transmutationConfig: true,
        submissions: {
          where: { status: { in: ["SUBMITTED", "GRADED"] } },
          include: { studentAnswers: true },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    const totalPoints = test.maxScore || test.questions.reduce((sum, q) => sum + q.fullPoints, 0);

    // Matching pairs map
    const matchingPairsMap = new Map<string, Array<{ optionId: string; correctText: string }>>();
    for (const q of test.questions) {
      if (q.questionType === "MATCHING") {
        matchingPairsMap.set(
          q.id,
          q.options.map((o) => ({ optionId: o.id, correctText: o.matchText || "" }))
        );
      }
    }

    let recalculatedCount = 0;

    for (const sub of test.submissions) {
      const answersInput = sub.studentAnswers.map((a) => ({
        questionId: a.questionId,
        optionId: a.optionId,
        textAnswer: a.textAnswer,
        matchingPairs: a.matchingPairs,
      }));

      // Grade objective questions
      const gradableQuestions = test.questions.map((q) => ({
        ...q,
        questionType: q.questionType as QuestionType,
      }));

      const { results, rawScore: objectiveRaw } = gradeSubmission(
        gradableQuestions,
        answersInput,
        matchingPairsMap
      );

      // Preserve essay scores if already graded by teacher
      let essayPoints = 0;
      for (const a of sub.studentAnswers) {
        const q = test.questions.find((quest) => quest.id === a.questionId);
        if (q?.questionType === "ESSAY" && a.points !== null) {
          essayPoints += a.points;
        }
      }

      const totalRaw = objectiveRaw + essayPoints;

      // Compute DepEd transmuted grade
      const transConfig: TransmutationConfig = test.transmutationConfig
        ? {
            formula: test.transmutationConfig.formula as TransmutationFormula,
            baseScore: test.transmutationConfig.baseScore ?? undefined,
            passingRawPercent: test.transmutationConfig.passingRawPercent ?? undefined,
            passingGrade: test.transmutationConfig.passingGrade ?? undefined,
          }
        : { formula: "DEPED_STANDARD" };

      const transmutationResult = transmute(
        totalRaw,
        totalPoints,
        transConfig
      );

      // Update submission and student answers
      await db.$transaction(async (tx) => {
        for (const res of results) {
          const q = test.questions.find((quest) => quest.id === res.questionId);
          if (q?.questionType !== "ESSAY") {
            await tx.studentAnswer.updateMany({
              where: { submissionId: sub.id, questionId: res.questionId },
              data: { points: res.points },
            });
          }
        }

        await tx.submission.update({
          where: { id: sub.id },
          data: {
            rawScore: totalRaw,
            transmutedGrade: transmutationResult.transmutedGrade,
            gradedAt: new Date(),
          },
        });
      });

      recalculatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Recalculated scores for ${recalculatedCount} submission(s)`,
    });
  } catch (error) {
    console.error("POST recalculate submissions error:", error);
    return NextResponse.json({ error: "Failed to recalculate submissions" }, { status: 500 });
  }
}
