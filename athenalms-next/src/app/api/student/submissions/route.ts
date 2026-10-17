import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await db.submission.findMany({
      where: { studentId: session.user.id },
      orderBy: { submittedAt: "desc" },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            examType: true,
            maxScore: true,
            subject: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json(
      submissions.map((s) => ({
        id: s.id,
        testId: s.test.id,
        testTitle: s.test.title,
        examType: s.test.examType,
        subjectName: s.test.subject?.name,
        status: s.status,
        startTime: s.startTime.toISOString(),
        submittedAt: s.submittedAt?.toISOString(),
        rawScore: s.rawScore,
        totalPoints: s.test.maxScore || 0,
        transmutedGrade: s.transmutedGrade,
      }))
    );
  } catch (error) {
    console.error("GET student submissions error:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
