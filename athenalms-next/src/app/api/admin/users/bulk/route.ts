import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { MAX_BULK_IDS, deleteBlockReason, splitBulkTargets } from "@/lib/admin-guards";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bulkUserActionSchema, fieldErrors } from "@/lib/validations";

/**
 * One bulk action over a set of accounts: activate, deactivate or delete.
 *
 * Nothing is deleted silently: accounts that cannot be removed (and the last
 * active administrator, and the acting admin's own account) come back in
 * `blocked` with a reason the UI can show.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const parsed = bulkUserActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: fieldErrors(parsed.error) },
        { status: 400 }
      );
    }

    const ids = Array.from(new Set(parsed.data.ids));
    const { action } = parsed.data;

    if (ids.length > MAX_BULK_IDS) {
      return NextResponse.json(
        { error: `Select at most ${MAX_BULK_IDS} accounts at a time.` },
        { status: 400 }
      );
    }

    const candidates = await db.user.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        role: true,
        isActive: true,
        _count: { select: { authoredTests: true, submissions: true } },
      },
    });

    const activeAdminCount = await db.user.count({ where: { role: "ADMIN", isActive: true } });

    const deleteReasons: Record<string, string> = {};
    if (action === "delete") {
      for (const candidate of candidates) {
        const reason = deleteBlockReason({
          authoredTestCount: candidate._count.authoredTests,
          submissionCount: candidate._count.submissions,
        });
        if (reason) deleteReasons[candidate.id] = reason;
      }
    }

    const { allowed, blocked } = splitBulkTargets(
      ids,
      candidates.map(({ id, role, isActive }) => ({ id, role, isActive })),
      { action, actingUserId: session.user.id, activeAdminCount, deleteReasons }
    );

    let affected = 0;
    if (allowed.length > 0) {
      if (action === "delete") {
        const result = await db.user.deleteMany({ where: { id: { in: allowed } } });
        affected = result.count;
      } else {
        const result = await db.user.updateMany({
          where: { id: { in: allowed } },
          data: { isActive: action === "activate" },
        });
        affected = result.count;
      }
    }

    return NextResponse.json({ action, affected, blocked });
  } catch (error) {
    console.error("POST /api/admin/users/bulk error:", error);
    return NextResponse.json({ error: "Failed to run bulk action" }, { status: 500 });
  }
}
