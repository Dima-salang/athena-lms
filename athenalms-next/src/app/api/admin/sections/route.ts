import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createSectionSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || (role !== "ADMIN" && role !== "TEACHER")) {
      return NextResponse.json({ error: "Forbidden: Admin or Teacher access required" }, { status: 403 });
    }

    // Teachers only see the sections they are assigned to; admins see all.
    let assignedSectionIds: string[] | undefined;
    if (role === "TEACHER") {
      const assignments = await db.teacherAssignment.findMany({
        where: { teacherProfile: { userId: session.user.id } },
        select: { sectionId: true },
      });
      assignedSectionIds = [...new Set(assignments.map((a) => a.sectionId))];
    }

    const sections = await db.section.findMany({
      where: assignedSectionIds ? { id: { in: assignedSectionIds } } : undefined,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });


    return NextResponse.json(
      sections.map((s) => ({
        id: s.id,
        name: s.name,
        adviserName: s.adviserName,
        gradeLevel: s.gradeLevel,
        schoolYear: s.schoolYear,
        isActive: s.isActive,
        studentCount: s._count.students,
      }))
    );
  } catch (error) {
    console.error("GET /api/admin/sections error:", error);
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createSectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const section = await db.section.create({
      data: parsed.data,
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "A section with this name already exists" }, { status: 409 });
    }
    console.error("POST /api/admin/sections error:", error);
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}
