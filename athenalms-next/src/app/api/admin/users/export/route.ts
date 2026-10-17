import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { CSV_BOM, toCsv } from "@/lib/csv";
import { db } from "@/lib/db";
import {
  USER_EXPORT_HEADERS,
  buildAdminUsersOrderBy,
  buildAdminUsersWhere,
  buildUserExportRows,
  parseAdminUsersQuery,
  toAdminUserDTO,
  type AdminUserDTO,
} from "@/lib/admin-users";

/** Rows are read in batches so a big school doesn't load everything at once. */
const BATCH_SIZE = 500;
const MAX_ROWS = 20_000;

/**
 * Download the user list as CSV.
 *
 * Exports every account matching the current filters — not just the visible
 * page — using the same filter rules as `GET /api/admin/users`.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const query = parseAdminUsersQuery(new URL(request.url).searchParams);
    const where = buildAdminUsersWhere(query);
    const orderBy = buildAdminUsersOrderBy(query.sort);

    const users: AdminUserDTO[] = [];
    for (let skip = 0; skip < MAX_ROWS; skip += BATCH_SIZE) {
      const batch = await db.user.findMany({
        where,
        orderBy,
        skip,
        take: BATCH_SIZE,
        include: {
          studentProfile: { include: { section: true } },
          teacherProfile: true,
        },
      });
      users.push(...batch.map(toAdminUserDTO));
      if (batch.length < BATCH_SIZE) break;
    }

    const csv = toCsv(USER_EXPORT_HEADERS, buildUserExportRows(users));
    const today = new Date().toISOString().slice(0, 10);

    return new NextResponse(CSV_BOM + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="user-accounts-${today}.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/users/export error:", error);
    return NextResponse.json({ error: "Failed to export users" }, { status: 500 });
  }
}
