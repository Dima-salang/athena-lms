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
    if (!session?.user || !["TEACHER", "ADMIN"].includes((session.user as { role?: string }).role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const test = await db.test.findUnique({
      where: { id },
      include: {
        subject: true,
        sections: { include: { section: true } },
        questions: {
          orderBy: { orderIndex: "asc" },
          include: {
            options: { orderBy: { orderIndex: "asc" } },
          },
        },
        transmutationConfig: true,
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error("GET /api/teacher/tests/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch test details" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || !["TEACHER", "ADMIN"].includes((session.user as { role?: string }).role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const { sectionIds, issueDate, dueDate, ...scalarUpdates } = body;

    // Handle section updates if provided
    if (Array.isArray(sectionIds)) {
      await db.testSection.deleteMany({ where: { testId: id } });
      await db.testSection.createMany({
        data: sectionIds.map((secId: string) => ({ testId: id, sectionId: secId })),
      });
    }

    const updated = await db.test.update({
      where: { id },
      data: {
        ...scalarUpdates,
        ...(issueDate !== undefined ? { issueDate: issueDate ? new Date(issueDate) : null } : {}),
        ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      },
      include: {
        subject: true,
        sections: { include: { section: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/teacher/tests/[id] error:", error);
    return NextResponse.json({ error: "Failed to update test" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || !["TEACHER", "ADMIN"].includes((session.user as { role?: string }).role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Soft archive or delete
    await db.test.update({
      where: { id },
      data: { isArchived: true },
    });

    return NextResponse.json({ success: true, message: "Test archived successfully" });
  } catch (error) {
    console.error("DELETE /api/teacher/tests/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete test" }, { status: 500 });
  }
}
