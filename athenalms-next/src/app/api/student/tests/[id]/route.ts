import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: testId } = await params;

    const test = await db.test.findUnique({
      where: { id: testId },
      include: {
        subject: { select: { name: true, code: true } },
        questions: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            questionNumber: true,
            questionText: true,
            questionType: true,
            fullPoints: true,
            imageUrl: true,
            orderIndex: true,
            options: {
              orderBy: { orderIndex: "asc" },
              select: {
                id: true,
                optionText: true,
                matchText: true,
                orderIndex: true,
              },
            },
          },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Shuffle questions if configured
    let questions = [...test.questions];
    if (test.shuffleQuestions) {
      questions.sort(() => Math.random() - 0.5);
    }

    // Shuffle options if configured (for MCQ)
    if (test.shuffleOptions) {
      questions = questions.map((q) => {
        if (q.questionType === "MULTIPLE_CHOICE") {
          return {
            ...q,
            options: [...q.options].sort(() => Math.random() - 0.5),
          };
        }
        return q;
      });
    }

    return NextResponse.json({
      id: test.id,
      title: test.title,
      description: test.description,
      examType: test.examType,
      subjectName: test.subject?.name,
      durationSeconds: test.durationSeconds,
      hasInfiniteTime: test.hasInfiniteTime,
      dueDate: test.dueDate?.toISOString(),
      questions,
    });
  } catch (error) {
    console.error("GET student test details error:", error);
    return NextResponse.json({ error: "Failed to fetch test" }, { status: 500 });
  }
}
