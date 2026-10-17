import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { StudentTestItemDTO, ExamType, SubmissionStatus } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: { section: true },
    });

    if (!studentProfile || !studentProfile.sectionId) {
      return NextResponse.json({
        available: [],
        upcoming: [],
        completed: [],
      });
    }

    const now = new Date();

    // 1. Tests distributed to student's section OR granted via Special Access
    const tests = await db.test.findMany({
      where: {
        isPublished: true,
        isArchived: false,
        OR: [
          {
            sections: {
              some: { sectionId: studentProfile.sectionId },
            },
          },
          {
            specialAccesses: {
              some: { studentId: session.user.id, isUnlocked: true },
            },
          },
        ],
      },
      include: {
        subject: { select: { name: true, code: true } },
        specialAccesses: {
          where: { studentId: session.user.id },
        },
        submissions: {
          where: { studentId: session.user.id },
          select: {
            id: true,
            status: true,
            rawScore: true,
            transmutedGrade: true,
            submittedAt: true,
            endTime: true,
          },
        },
        _count: { select: { questions: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    const available: StudentTestItemDTO[] = [];
    const upcoming: StudentTestItemDTO[] = [];
    const completed: StudentTestItemDTO[] = [];

    for (const t of tests) {
      const specialAccess = t.specialAccesses[0];
      const effectiveDueDate = specialAccess?.customDueDate || t.dueDate;
      const submission = t.submissions[0];

      const item: StudentTestItemDTO = {
        id: t.id,
        title: t.title,
        description: t.description,
        examType: t.examType as ExamType,
        subjectName: t.subject?.name,
        subjectCode: t.subject?.code,
        durationSeconds: t.durationSeconds,
        hasInfiniteTime: t.hasInfiniteTime,
        issueDate: t.issueDate?.toISOString(),
        dueDate: effectiveDueDate?.toISOString(),
        createdAt: t.createdAt.toISOString(),
        questionCount: t._count.questions,
        submission: submission
          ? {
              id: submission.id,
              status: submission.status as SubmissionStatus,
              rawScore: submission.rawScore,
              transmutedGrade: submission.transmutedGrade,
              submittedAt: submission.submittedAt?.toISOString(),
              endTime: submission.endTime?.toISOString(),
            }
          : null,
      };

      if (submission && ["SUBMITTED", "GRADED", "TIMED_OUT"].includes(submission.status)) {
        completed.push(item);
      } else if (t.issueDate && now < t.issueDate && !specialAccess?.isUnlocked) {
        upcoming.push(item);
      } else {
        // Active / Available test
        available.push(item);
      }
    }

    return NextResponse.json({ available, upcoming, completed });
  } catch (error) {
    console.error("GET student tests error:", error);
    return NextResponse.json({ error: "Failed to fetch student tests" }, { status: 500 });
  }
}
