import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, validatePasswordStrength } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If not first login, verify current password
    if (!user.mustChangePassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required" },
          { status: 400 }
        );
      }
      if (!user.passwordHash) {
        return NextResponse.json(
          { error: "Account does not have a password set" },
          { status: 400 }
        );
      }
      const isValidCurrent = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValidCurrent) {
        return NextResponse.json(
          { error: "Incorrect current password" },
          { status: 400 }
        );
      }
    }

    // Validate new password strength
    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.valid) {
      return NextResponse.json(
        { error: strengthCheck.errors.join(" ") },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(newPassword);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
