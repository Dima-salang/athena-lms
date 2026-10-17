import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateGradebookExcel, type GradebookRow } from "@/lib/excel";

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

    const test = await db.test.findUnique({
      where: { id: testId },
      include: {
        submissions: {
          include: {
            student: {
              include: {
                studentProfile: { include: { section: true } },
              },
            },
          },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    const totalPoints = test.maxScore || 100;

    const rows: GradebookRow[] = test.submissions.map((sub) => {
      const raw = sub.rawScore || 0;
      const pct = totalPoints > 0 ? (raw / totalPoints) * 100 : 0;

      return {
        studentName: `${sub.student.lastName}, ${sub.student.firstName}`,
        lrn: sub.student.studentProfile?.lrn || "—",
        section: sub.student.studentProfile?.section?.name || "—",
        rawScore: sub.rawScore,
        totalPoints,
        rawPercent: `${pct.toFixed(1)}%`,
        transmutedGrade: sub.transmutedGrade,
        status: sub.status,
        submittedAt: sub.submittedAt ? sub.submittedAt.toLocaleString("en-PH") : "Pending",
      };
    });

    const excelBuffer = generateGradebookExcel(test.title, rows);

    return new Response(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(test.title)}_gradebook.xlsx"`,
      },
    });
  } catch (error) {
    console.error("GET export error:", error);
    return NextResponse.json({ error: "Failed to export gradebook" }, { status: 500 });
  }
}
