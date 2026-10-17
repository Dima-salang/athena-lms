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

    const { id } = await params;

    const submission = await db.submission.findUnique({
      where: { id },
      include: {
        test: {
          include: {
            subject: { select: { name: true, code: true } },
            questions: {
              orderBy: { orderIndex: "asc" },
              include: { options: true },
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

    // Role check: Only the student owner or a teacher/admin can view
    const userRole = (session.user as { role?: string }).role;
    if (userRole === "STUDENT" && submission.studentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("GET student submission detail error:", error);
    return NextResponse.json({ error: "Failed to fetch submission details" }, { status: 500 });
  }
}
