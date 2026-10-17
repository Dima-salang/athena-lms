import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createTeacherAssignmentSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const assignments = await db.teacherAssignment.findMany({
      include: {
        teacherProfile: {
          include: {
            user: {
              select: { firstName: true, lastName: true, username: true },
            },
          },
        },
        section: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      assignments.map((a) => ({
        id: a.id,
        teacherProfileId: a.teacherProfileId,
        teacherName: `${a.teacherProfile.user.firstName} ${a.teacherProfile.user.lastName}`,
        teacherUsername: a.teacherProfile.user.username,
        sectionId: a.section.id,
        sectionName: a.section.name,
        subjectId: a.subject.id,
        subjectName: a.subject.name,
        subjectCode: a.subject.code,
        schoolYear: a.schoolYear,
      }))
    );
  } catch (error) {
    console.error("GET /api/admin/teacher-assignments error:", error);
    return NextResponse.json({ error: "Failed to fetch teacher assignments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createTeacherAssignmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const assignment = await db.teacherAssignment.create({
      data: parsed.data,
      include: {
        teacherProfile: { include: { user: true } },
        section: true,
        subject: true,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "This teacher assignment already exists for this section and subject" },
        { status: 409 }
      );
    }
    console.error("POST /api/admin/teacher-assignments error:", error);
    return NextResponse.json({ error: "Failed to create teacher assignment" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    await db.teacherAssignment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/teacher-assignments error:", error);
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
  }
}
