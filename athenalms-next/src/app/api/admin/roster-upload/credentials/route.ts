import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateCredentialsSummaryExcel } from "@/lib/excel";

/**
 * Download the hand-out sheet for students who have not signed in yet.
 *
 * Only accounts that still must change their password are listed, because their
 * password is the LRN. Everyone else has chosen their own password, which the
 * school should not be able to read.
 *
 * Optional `?section=<id>` limits the export to one section;
 * `?section=unassigned` covers students with no section.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const section = new URL(request.url).searchParams.get("section");

    const students = await db.user.findMany({
      where: {
        role: "STUDENT",
        mustChangePassword: true,
        ...(section === "unassigned"
          ? { OR: [ { studentProfile: { is: null } }, { studentProfile: { is: { sectionId: null } } } ] }
          : section
            ? { studentProfile: { is: { sectionId: section } } }
            : {}),
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: { studentProfile: { include: { section: true } } },
    });

    if (students.length === 0) {
      return NextResponse.json(
        { error: "Every student has already set their own password — there is nothing to hand out." },
        { status: 409 }
      );
    }

    const buffer = generateCredentialsSummaryExcel(
      students.map((student) => ({
        name: `${student.firstName} ${student.lastName}`.trim(),
        username: student.username,
        temporaryPassword: student.studentProfile?.lrn ?? "",
        lrn: student.studentProfile?.lrn ?? "",
      }))
    );

    const today = new Date().toISOString().slice(0, 10);
    const suffix = section && section !== "unassigned" ? "-section" : "";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="student-passwords${suffix}-${today}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/roster-upload/credentials error:", error);
    return NextResponse.json({ error: "Failed to build the password sheet" }, { status: 500 });
  }
}
