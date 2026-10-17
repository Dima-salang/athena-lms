import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Reset one account to its known starting password.
 *
 * Student accounts go back to their 12-digit LRN; staff and admin accounts go
 * back to `username@123`. The password is returned once so the admin can hand
 * it over, and the account is flagged to change it at next sign-in.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Use your own password settings to change your password." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id },
      include: { studentProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isStudent = user.role === "STUDENT";
    const temporaryPassword = isStudent ? user.studentProfile?.lrn : `${user.username}@123`;

    if (!temporaryPassword) {
      return NextResponse.json(
        { error: "This student has no LRN, so there is no password to reset to." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(temporaryPassword);

    await db.user.update({
      where: { id },
      data: { passwordHash, mustChangePassword: true },
    });

    return NextResponse.json({
      username: user.username,
      temporaryPassword,
      mustChangePassword: true,
      /** Where the password came from, so the UI can explain it. */
      source: isStudent ? "lrn" : "username",
    });
  } catch (error) {
    console.error("POST /api/admin/users/[id]/reset-password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
