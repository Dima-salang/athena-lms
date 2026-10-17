import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateItemAnalysisExcel } from "@/lib/excel";
import { computeTestAnalytics } from "@/lib/test-analytics";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Download a per-item correct/wrong summary as an Excel workbook. */
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

    const { itemAnalysis } = computeTestAnalytics(test);

    const buffer = generateItemAnalysisExcel(
      test.title,
      itemAnalysis.map((item) => ({
        questionNumber: item.questionNumber,
        questionText: item.questionText,
        questionType: item.questionType,
        fullPoints: item.fullPoints,
        correctCount: item.correctCount,
        wrongCount: item.wrongCount,
        totalResponses: item.totalResponses,
        percentCorrect: item.percentCorrect,
        difficultyIndex: item.difficultyIndex,
        difficultyCategory: item.difficultyCategory,
        discriminationIndex: item.discriminationIndex,
        discriminationCategory: item.discriminationCategory,
      }))
    );

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          test.title
        )}_item-analysis.xlsx"`,
      },
    });
  } catch (error) {
    console.error("GET item analysis export error:", error);
    return NextResponse.json(
      { error: "Failed to export item analysis" },
      { status: 500 }
    );
  }
}
