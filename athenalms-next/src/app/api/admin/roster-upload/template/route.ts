import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { generateRosterTemplateExcel } from "@/lib/excel";

/** Download a blank class list with the headers the importer expects. */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const buffer = generateRosterTemplateExcel();

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="class-list-template.xlsx"',
      },
    });
  } catch (error) {
    console.error("GET /api/admin/roster-upload/template error:", error);
    return NextResponse.json({ error: "Failed to build the template" }, { status: 500 });
  }
}
