import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { specialAccessSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || !["TEACHER", "ADMIN"].includes((session.user as { role?: string }).role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: testId } = await params;

    const overrides = await db.specialAccess.findMany({
      where: { testId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            studentProfile: { select: { lrn: true, section: { select: { name: true } } } },
          },
        },
      },
    });

    const { searchParams } = new URL(request.url);
    const includeCandidates = searchParams.get("candidates") === "true";

    const formattedOverrides = overrides.map((o) => ({
      id: o.id,
      studentId: o.studentId,
      studentName: `${o.student.firstName} ${o.student.lastName}`,
      username: o.student.username,
      lrn: o.student.studentProfile?.lrn,
      sectionName: o.student.studentProfile?.section?.name,
      customDueDate: o.customDueDate?.toISOString(),
      extendedSeconds: o.extendedSeconds,
      isUnlocked: o.isUnlocked,
    }));

    if (includeCandidates) {
      const testSections = await db.testSection.findMany({
        where: { testId },
        select: { sectionId: true },
      });
      const sectionIds = testSections.map((ts) => ts.sectionId);

      const candidateProfiles = await db.studentProfile.findMany({
        where: { sectionId: { in: sectionIds } },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, username: true },
          },
          section: { select: { name: true } },
        },
        orderBy: [{ user: { lastName: "asc" } }, { user: { firstName: "asc" } }],
      });

      const candidateStudents = candidateProfiles.map((cp) => ({
        id: cp.user.id,
        name: `${cp.user.lastName}, ${cp.user.firstName}`,
        username: cp.user.username,
        lrn: cp.lrn,
        sectionName: cp.section?.name || "—",
      }));

      return NextResponse.json({
        overrides: formattedOverrides,
        candidates: candidateStudents,
      });
    }

    return NextResponse.json(formattedOverrides);
  } catch (error) {
    console.error("GET special access error:", error);
    return NextResponse.json({ error: "Failed to fetch special access records" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || !["TEACHER", "ADMIN"].includes((session.user as { role?: string }).role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: testId } = await params;
    const body = await request.json();

    const parsed = specialAccessSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { studentId, customDueDate, extendedSeconds, isUnlocked } = parsed.data;

    const access = await db.specialAccess.upsert({
      where: {
        testId_studentId: { testId, studentId },
      },
      update: {
        customDueDate: customDueDate ? new Date(customDueDate) : null,
        extendedSeconds: extendedSeconds || null,
        isUnlocked,
      },
      create: {
        testId,
        studentId,
        customDueDate: customDueDate ? new Date(customDueDate) : null,
        extendedSeconds: extendedSeconds || null,
        isUnlocked,
      },
    });

    return NextResponse.json(access, { status: 201 });
  } catch (error) {
    console.error("POST special access error:", error);
    return NextResponse.json({ error: "Failed to save special access" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || !["TEACHER", "ADMIN"].includes((session.user as { role?: string }).role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Record ID is required" }, { status: 400 });
    }

    await db.specialAccess.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE special access error:", error);
    return NextResponse.json({ error: "Failed to delete special access" }, { status: 500 });
  }
}
