import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { toAdminUserDTO } from "@/lib/admin-users";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fieldErrors, updateSectionSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Read one section: its details, its students and its teacher assignments.
 * Teachers can only open sections they are assigned to.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || (role !== "ADMIN" && role !== "TEACHER")) {
      return NextResponse.json(
        { error: "Forbidden: Admin or Teacher access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (role === "TEACHER") {
      const assigned = await db.teacherAssignment.count({
        where: { sectionId: id, teacherProfile: { userId: session.user.id } },
      });
      if (assigned === 0) {
        return NextResponse.json({ error: "Forbidden: Not your section" }, { status: 403 });
      }
    }

    const section = await db.section.findUnique({
      where: { id },
      include: { _count: { select: { students: true } } },
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const [students, assignmentRows] = await Promise.all([
      db.user.findMany({
        where: { studentProfile: { is: { sectionId: id } } },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        include: { studentProfile: { include: { section: true } }, teacherProfile: true },
      }),
      db.teacherAssignment.findMany({
        where: { sectionId: id },
        orderBy: { createdAt: "asc" },
        include: { teacherProfile: { include: { user: true } }, subject: true },
      }),
    ]);

    return NextResponse.json({
      id: section.id,
      name: section.name,
      adviserName: section.adviserName,
      gradeLevel: section.gradeLevel,
      schoolYear: section.schoolYear,
      isActive: section.isActive,
      studentCount: section._count.students,
      students: students.map(toAdminUserDTO),
      assignments: assignmentRows.map((row) => ({
        id: row.id,
        teacherProfileId: row.teacherProfileId,
        teacherName: row.teacherProfile.user.name ?? row.teacherProfile.user.username,
        subjectId: row.subjectId,
        subjectName: row.subject.name,
        schoolYear: row.schoolYear,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/sections/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch section" }, { status: 500 });
  }
}

/** Edit a section, including switching it on or off. */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = updateSectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: fieldErrors(parsed.error) },
        { status: 400 }
      );
    }

    const section = await db.section.update({ where: { id }, data: parsed.data });
    const studentCount = await db.studentProfile.count({ where: { sectionId: id } });

    return NextResponse.json({
      id: section.id,
      name: section.name,
      adviserName: section.adviserName,
      gradeLevel: section.gradeLevel,
      schoolYear: section.schoolYear,
      isActive: section.isActive,
      studentCount,
    });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "A section with this name already exists" },
        { status: 409 }
      );
    }
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }
    console.error("PATCH /api/admin/sections/[id] error:", error);
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 });
  }
}
