import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createUserSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search")?.toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

    const where: Record<string, unknown> = {};
    if (role && ["ADMIN", "TEACHER", "STUDENT"].includes(role)) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [total, users] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          studentProfile: { include: { section: true } },
          teacherProfile: true,
        },
      }),
    ]);

    return NextResponse.json({
      data: users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        isActive: u.isActive,
        mustChangePassword: u.mustChangePassword,
        createdAt: u.createdAt.toISOString(),
        lrn: u.studentProfile?.lrn,
        sectionName: u.studentProfile?.section?.name,
        teacherProfileId: u.teacherProfile?.id,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { username, firstName, lastName, email, role, sectionId, lrn } = parsed.data;

    // Initial password default: LRN if student, else username
    const initialPlainPassword = role === "STUDENT" && lrn ? lrn : `${username}@123`;
    const passwordHash = await hashPassword(initialPlainPassword);

    const user = await db.user.create({
      data: {
        username,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email: email || null,
        role,
        passwordHash,
        mustChangePassword: true, // Always require first-login change for newly created accounts
        ...(role === "STUDENT" && lrn
          ? {
              studentProfile: {
                create: {
                  lrn,
                  sectionId: sectionId || null,
                },
              },
            }
          : {}),
        ...(role === "TEACHER"
          ? {
              teacherProfile: {
                create: {},
              },
            }
          : {}),
        ...(role === "ADMIN"
          ? {
              adminProfile: {
                create: {},
              },
            }
          : {}),
      },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        initialPassword: initialPlainPassword,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Username or email/LRN is already in use" },
        { status: 409 }
      );
    }
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own admin account" }, { status: 400 });
    }

    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
