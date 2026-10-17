import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fieldErrors, updateTeacherAssignmentSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Change who teaches what: teacher, section, subject or school year. */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = updateTeacherAssignmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: fieldErrors(parsed.error) },
        { status: 400 }
      );
    }

    const assignment = await db.teacherAssignment.update({
      where: { id },
      data: parsed.data,
      include: {
        teacherProfile: { include: { user: true } },
        section: true,
        subject: true,
      },
    });

    return NextResponse.json({
      id: assignment.id,
      teacherProfileId: assignment.teacherProfileId,
      teacherName: `${assignment.teacherProfile.user.firstName} ${assignment.teacherProfile.user.lastName}`,
      teacherUsername: assignment.teacherProfile.user.username,
      sectionId: assignment.sectionId,
      sectionName: assignment.section.name,
      subjectId: assignment.subjectId,
      subjectName: assignment.subject.name,
      subjectCode: assignment.subject.code,
      schoolYear: assignment.schoolYear,
    });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "This teacher already has that subject in that section." },
        { status: 409 }
      );
    }
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }
    console.error("PATCH /api/admin/teacher-assignments/[id] error:", error);
    return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
  }
}
