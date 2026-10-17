import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeTestAnalytics } from "@/lib/test-analytics";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (
      !session?.user ||
      !["TEACHER", "ADMIN"].includes((session.user as { role?: string }).role || "")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: testId } = await params;

    const test = await db.test.findUnique({
      where: { id: testId },
      include: {
        sections: { include: { section: true } },
        questions: {
          orderBy: { orderIndex: "asc" },
          include: { options: true },
        },
        submissions: {
          where: { status: { in: ["SUBMITTED", "GRADED"] } },
          include: {
            student: {
              include: {
                studentProfile: { include: { section: true } },
              },
            },
            studentAnswers: true,
          },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    const result = computeTestAnalytics(test);

    return NextResponse.json({
      ...result,
      testId: result.test.id,
      testTitle: result.test.title,
      totalPoints: result.summary.totalPoints,
      submissionCount: result.summary.totalSubmissions,
      averageRawScore: result.summary.averageRawScore,
      averageTransmutedGrade: result.summary.averageTransmutedGrade,
      passingRate: result.summary.passingRate,
      passingCount: result.summary.passingCount,
      failingCount: result.summary.failingCount,
    });
  } catch (error) {
    console.error("GET test analytics error:", error);
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}
