import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { persistQuestions } from "@/lib/questions-persistence";
import { questionSchema } from "@/lib/validations";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const saveQuestionsPayloadSchema = z.array(questionSchema);

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (
      !session?.user ||
      !["TEACHER", "ADMIN"].includes(
        (session.user as { role?: string }).role || "",
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: testId } = await params;
    const body = await request.json();

    const parsed = saveQuestionsPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const questionsData = parsed.data;

    // Save in transaction: upsert questions/options, then refresh total points.
    await db.$transaction(async (tx) => {
      const totalPoints = await persistQuestions(tx, testId, questionsData);
      await tx.test.update({
        where: { id: testId },
        data: { maxScore: totalPoints },
      });
    });

    const updatedQuestions = await db.question.findMany({
      where: { testId },
      orderBy: { orderIndex: "asc" },
      include: {
        options: { orderBy: { orderIndex: "asc" } },
      },
    });

    return NextResponse.json(updatedQuestions);
  } catch (error) {
    console.error("POST /api/teacher/tests/[id]/questions error:", error);
    return NextResponse.json(
      { error: "Failed to save questions" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (
      !session?.user ||
      !["TEACHER", "ADMIN"].includes(
        (session.user as { role?: string }).role || "",
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 },
      );
    }

    await db.question.delete({ where: { id: questionId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE question error:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 },
    );
  }
}
