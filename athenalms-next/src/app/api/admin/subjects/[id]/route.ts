import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fieldErrors, updateSubjectSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Edit a subject, including switching it on or off. */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = updateSubjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: fieldErrors(parsed.error) },
        { status: 400 }
      );
    }

    const subject = await db.subject.update({ where: { id }, data: parsed.data });

    return NextResponse.json({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      description: subject.description,
      isActive: subject.isActive,
    });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "A subject with this name or code already exists" },
        { status: 409 }
      );
    }
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }
    console.error("PATCH /api/admin/subjects/[id] error:", error);
    return NextResponse.json({ error: "Failed to update subject" }, { status: 500 });
  }
}
