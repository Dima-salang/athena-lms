import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createSubjectSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || (role !== "ADMIN" && role !== "TEACHER")) {
      return NextResponse.json(
        { error: "Forbidden: Admin or Teacher access required" },
        { status: 403 },
      );
    }

    // Teachers only see the subjects they are assigned to; admins see all.
    let assignedSubjectIds: string[] | undefined;
    if (role === "TEACHER") {
      const assignments = await db.teacherAssignment.findMany({
        where: { teacherProfile: { userId: session.user.id } },
        select: { subjectId: true },
      });
      assignedSubjectIds = [...new Set(assignments.map((a) => a.subjectId))];
    }

    const subjects = await db.subject.findMany({
      where: assignedSubjectIds ? { id: { in: assignedSubjectIds } } : undefined,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("GET /api/admin/subjects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = createSubjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const subject = await db.subject.create({
      data: parsed.data,
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "A subject with this name or code already exists" },
        { status: 409 },
      );
    }
    console.error("POST /api/admin/subjects error:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 },
    );
  }
}
