import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { transmute, type TransmutationConfig, type TransmutationFormula } from "@/lib/transmutation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const submission = await db.submission.findUnique({
      where: { id },
      include: {
        test: {
          include: {
            questions: {
              orderBy: { orderIndex: "asc" },
              include: { options: true },
            },
            transmutationConfig: true,
          },
        },
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
        studentAnswers: {
          include: {
            option: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Role check: Only the student themselves or teachers/admins can view
    const userRole = (session.user as { role?: string }).role;
    if (userRole === "STUDENT" && submission.studentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("GET submission detail error:", error);
    return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 });
  }
}

// Teacher manual grading / score override
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || !["TEACHER", "ADMIN"].includes((session.user as { role?: string }).role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { answerOverrides, teacherNotes } = body as {
      answerOverrides?: Array<{ questionId: string; points: number; teacherComment?: string }>;
      teacherNotes?: string;
    };

    const submission = await db.submission.findUnique({
      where: { id },
      include: {
        test: {
          include: {
            transmutationConfig: true,
            questions: true,
          },
        },
        studentAnswers: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    await db.$transaction(async (tx) => {
      if (answerOverrides && answerOverrides.length > 0) {
        for (const override of answerOverrides) {
          await tx.studentAnswer.updateMany({
            where: {
              submissionId: id,
              questionId: override.questionId,
            },
            data: {
              points: override.points,
              teacherComment: override.teacherComment || null,
            },
          });
        }
      }

      // Recompute total raw score
      const allAnswers = await tx.studentAnswer.findMany({
        where: { submissionId: id },
      });

      const totalRaw = allAnswers.reduce((sum, a) => sum + (a.points || 0), 0);
      const totalPoints =
        submission.test.maxScore ||
        submission.test.questions.reduce((sum, q) => sum + q.fullPoints, 0);

      // Recompute DepEd transmuted grade
      const transConfig: TransmutationConfig = submission.test.transmutationConfig
        ? {
            formula: submission.test.transmutationConfig.formula as TransmutationFormula,
            baseScore: submission.test.transmutationConfig.baseScore ?? undefined,
            passingRawPercent: submission.test.transmutationConfig.passingRawPercent ?? undefined,
            passingGrade: submission.test.transmutationConfig.passingGrade ?? undefined,
          }
        : { formula: "DEPED_STANDARD" };

      const transmutationResult = transmute(
        totalRaw,
        totalPoints,
        transConfig
      );

      await tx.submission.update({
        where: { id },
        data: {
          rawScore: totalRaw,
          transmutedGrade: transmutationResult.transmutedGrade,
          status: "GRADED",
          gradedAt: new Date(),
          teacherNotes: teacherNotes !== undefined ? teacherNotes : submission.teacherNotes,
        },
      });
    });

    const updated = await db.submission.findUnique({
      where: { id },
      include: {
        studentAnswers: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH submission error:", error);
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  }
}
