import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractClientIp, isIpAllowed, getAllowedCidrs } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientIp = extractClientIp(request.headers);
    const allowedCidrs = getAllowedCidrs();

    // Verify campus IP whitelist if configured
    if (clientIp && !isIpAllowed(clientIp, allowedCidrs)) {
      return NextResponse.json(
        { error: "Access denied: Your IP address is outside the institutional network." },
        { status: 403 }
      );
    }

    const { testId } = await request.json();

    const test = await db.test.findUnique({
      where: { id: testId },
      include: {
        specialAccesses: { where: { studentId: session.user.id } },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Check if test has already ended
    const now = new Date();
    const specialAccess = test.specialAccesses[0];
    const effectiveDueDate = specialAccess?.customDueDate || test.dueDate;

    if (effectiveDueDate && now > effectiveDueDate) {
      return NextResponse.json(
        { error: "Test deadline has passed." },
        { status: 403 }
      );
    }

    // Check for existing submission
    let submission = await db.submission.findUnique({
      where: {
        testId_studentId: {
          testId,
          studentId: session.user.id,
        },
      },
      include: {
        studentAnswers: true,
      },
    });

    if (submission) {
      if (["SUBMITTED", "GRADED", "TIMED_OUT"].includes(submission.status)) {
        return NextResponse.json(
          { error: "You have already submitted this test." },
          { status: 400 }
        );
      }
      // Resuming existing in-progress submission
      return NextResponse.json(submission);
    }

    // Calculate end time
    let endTime: Date | null = null;
    if (!test.hasInfiniteTime && test.durationSeconds) {
      const extension = specialAccess?.extendedSeconds || 0;
      const totalSeconds = test.durationSeconds + extension;
      endTime = new Date(now.getTime() + totalSeconds * 1000);
    }

    // Create new submission with locked client IP
    submission = await db.submission.create({
      data: {
        testId,
        studentId: session.user.id,
        status: "IN_PROGRESS",
        startTime: now,
        endTime,
        clientIp: clientIp || null,
      },
      include: {
        studentAnswers: true,
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("POST /api/student/submissions/start error:", error);
    return NextResponse.json({ error: "Failed to start test" }, { status: 500 });
  }
}
