import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { LAST_ADMIN_REASON } from "@/lib/admin-guards";
import { toAdminUserDTO } from "@/lib/admin-users";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fieldErrors, updateUserSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const USER_INCLUDE = {
  studentProfile: { include: { section: true } },
  teacherProfile: true,
} as const;

/**
 * Edit one account.
 *
 * Handles the fields that used to be create-only: name, email, role, and — for
 * students — the LRN and section. `sectionId: null` removes a student from their
 * section; `isActive: false` deactivates instead of deleting.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: fieldErrors(parsed.error) },
        { status: 400 }
      );
    }
    const input = parsed.data;

    const target = await db.user.findUnique({
      where: { id },
      include: { studentProfile: true, teacherProfile: true, adminProfile: true },
    });

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isSelf = id === session.user.id;
    const nextRole = input.role ?? target.role;
    const changingRole = nextRole !== target.role;

    if (isSelf && changingRole) {
      return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 });
    }
    if (isSelf && input.isActive === false) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account." },
        { status: 400 }
      );
    }
    if (!isSelf && input.isActive === false && target.role === "ADMIN" && target.isActive) {
      const activeAdmins = await db.user.count({ where: { role: "ADMIN", isActive: true } });
      if (activeAdmins <= 1) {
        return NextResponse.json({ error: LAST_ADMIN_REASON }, { status: 409 });
      }
    }

    const firstName = input.firstName ?? target.firstName;
    const lastName = input.lastName ?? target.lastName;

    const data: Record<string, unknown> = {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
    };

    if (input.email !== undefined) data.email = input.email ? input.email : null;
    if (input.isActive !== undefined) data.isActive = input.isActive;

    if (changingRole) {
      if (nextRole === "STUDENT" && !input.lrn) {
        return NextResponse.json(
          {
            error: "A student account needs a 12-digit LRN.",
            fields: { lrn: "LRN is required for students" },
          },
          { status: 400 }
        );
      }

      const submissions = await db.submission.count({ where: { studentId: id } });
      if (submissions > 0) {
        return NextResponse.json(
          { error: "This account has test submissions, so its role cannot be changed." },
          { status: 409 }
        );
      }

      if (nextRole !== "STUDENT" && target.studentProfile) data.studentProfile = { delete: true };
      if (nextRole !== "TEACHER" && target.teacherProfile) data.teacherProfile = { delete: true };
      if (nextRole !== "ADMIN" && target.adminProfile) data.adminProfile = { delete: true };

      if (nextRole === "STUDENT") {
        data.studentProfile = { create: { lrn: input.lrn as string, sectionId: input.sectionId ?? null } };
      }
      if (nextRole === "TEACHER") data.teacherProfile = { create: {} };
      if (nextRole === "ADMIN") data.adminProfile = { create: {} };

      data.role = nextRole;
    } else if (nextRole === "STUDENT" && target.studentProfile) {
      const profile: Record<string, unknown> = {};
      if (input.lrn) profile.lrn = input.lrn;
      if (input.sectionId !== undefined) profile.sectionId = input.sectionId;
      if (Object.keys(profile).length > 0) data.studentProfile = { update: profile };
    }

    const updated = await db.user.update({ where: { id }, data, include: USER_INCLUDE });

    return NextResponse.json(toAdminUserDTO(updated));
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "That username, email or LRN is already in use." },
        { status: 409 }
      );
    }
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
