import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractClientIp, verifyExamIpLock, isExamIpLockEnabled } from "@/lib/security";
import { autosaveAnswersSchema } from "@/lib/validations";

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
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.studentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (["SUBMITTED", "GRADED", "TIMED_OUT"].includes(submission.status)) {
      return NextResponse.json(
        { error: "Submission has already been finalized." },
        { status: 400 }
      );
    }

    // Verify Exam Session IP Lock
    const clientIp = extractClientIp(request.headers);
    const lockEnabled = isExamIpLockEnabled();
    const lockCheck = verifyExamIpLock(clientIp, submission.clientIp, lockEnabled);

    if (!lockCheck.allowed) {
      return NextResponse.json(
        { error: lockCheck.reason || "Network violation detected." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = autosaveAnswersSchema.safeParse({
      submissionId,
      answers: body.answers,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid answer data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Upsert student answers in a transaction
    await db.$transaction(async (tx) => {
      for (const ans of parsed.data.answers) {
        await tx.studentAnswer.upsert({
          where: {
            submissionId_questionId: {
              submissionId,
              questionId: ans.questionId,
            },
          },
          update: {
            optionId: ans.optionId || null,
            textAnswer: ans.textAnswer || null,
            matchingPairs: ans.matchingPairs || null,
            isFlagged: ans.isFlagged,
            updatedAt: new Date(),
          },
          create: {
            submissionId,
            questionId: ans.questionId,
            optionId: ans.optionId || null,
            textAnswer: ans.textAnswer || null,
            matchingPairs: ans.matchingPairs || null,
            isFlagged: ans.isFlagged,
          },
        });
      }

      await tx.submission.update({
        where: { id: submissionId },
        data: { updatedAt: new Date() },
      });
    });

    return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Autosave error:", error);
    return NextResponse.json({ error: "Autosave failed" }, { status: 500 });
  }
}
