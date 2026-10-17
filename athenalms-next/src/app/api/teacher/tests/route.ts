import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createTestSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || !["TEACHER", "ADMIN"].includes((session.user as { role?: string }).role || "")) {
      return NextResponse.json({ error: "Forbidden: Teacher access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();

    const where: Record<string, unknown> = {
      authorId: session.user.id,
      isArchived: false,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const tests = await db.test.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        subject: { select: { id: true, name: true } },
        sections: { include: { section: { select: { id: true, name: true } } } },
        _count: {
          select: { questions: true, submissions: true },
        },
      },
    });

    return NextResponse.json(
      tests.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        examType: t.examType,
        subjectId: t.subject?.id,
        subjectName: t.subject?.name,
        sectionIds: t.sections.map((s) => s.section.id),
        sectionNames: t.sections.map((s) => s.section.name),
        durationSeconds: t.durationSeconds,
        hasInfiniteTime: t.hasInfiniteTime,
        issueDate: t.issueDate?.toISOString(),
        dueDate: t.dueDate?.toISOString(),
        isPublished: t.isPublished,
        isDraft: t.isDraft,
        maxScore: t.maxScore,
        questionCount: t._count.questions,
        submissionCount: t._count.submissions,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET /api/teacher/tests error:", error);
    return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || !["TEACHER", "ADMIN"].includes((session.user as { role?: string }).role || "")) {
      return NextResponse.json({ error: "Forbidden: Teacher access required" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createTestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      examType,
      subjectId,
      sectionIds,
      durationSeconds,
      hasInfiniteTime,
      issueDate,
      dueDate,
      shuffleQuestions,
      shuffleOptions,
    } = parsed.data;

    const test = await db.test.create({
      data: {
        title,
        description: description || null,
        examType,
        authorId: session.user.id,
        subjectId: subjectId || null,
        durationSeconds: hasInfiniteTime ? null : durationSeconds || null,
        hasInfiniteTime,
        issueDate: issueDate ? new Date(issueDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        shuffleQuestions,
        shuffleOptions,
        sections: {
          create: sectionIds.map((secId) => ({
            sectionId: secId,
          })),
        },
      },
      include: {
        subject: true,
        sections: { include: { section: true } },
      },
    });

    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error("POST /api/teacher/tests error:", error);
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 });
  }
}
