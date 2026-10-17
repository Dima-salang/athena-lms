/**
 * GET /api/auth/me
 * Returns the current authenticated user's profile and role details.
 * Also pulls the StudentProfile (LRN, section) if the user is a student.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      studentProfile: { include: { section: true } },
      teacherProfile: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
    isActive: user.isActive,
    studentProfile: user.studentProfile
      ? {
          lrn: user.studentProfile.lrn,
          sectionId: user.studentProfile.sectionId,
          sectionName: user.studentProfile.section?.name,
        }
      : null,
    teacherProfileId: user.teacherProfile?.id ?? null,
  });
}
