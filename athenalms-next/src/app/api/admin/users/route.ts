import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createUserSchema, fieldErrors } from "@/lib/validations";
import {
  buildAdminUsersOrderBy,
  buildAdminUsersWhere,
  parseAdminUsersQuery,
  toAdminUserDTO,
} from "@/lib/admin-users";
import { LAST_ADMIN_REASON, deleteBlockReason } from "@/lib/admin-guards";

/** The relations every admin user read needs (role, section, teacher profile). */
const USER_INCLUDE = {
  studentProfile: { include: { section: true } },
  teacherProfile: true,
} as const;

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const query = parseAdminUsersQuery(new URL(request.url).searchParams);
    const where = buildAdminUsersWhere(query);

    const [total, users] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: buildAdminUsersOrderBy(query.sort),
        include: USER_INCLUDE,
      }),
    ]);

    return NextResponse.json({
      data: users.map(toAdminUserDTO),
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
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
        {
          error: "Validation failed",
          fields: fieldErrors(parsed.error),
          details: parsed.error.flatten(),
        },
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

    const target = await db.user.findUnique({
      where: { id },
      select: {
        role: true,
        isActive: true,
        _count: {
          select: { authoredTests: true, submissions: true },
        },
      },
    });

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (target.role === "ADMIN" && target.isActive) {
      const activeAdmins = await db.user.count({ where: { role: "ADMIN", isActive: true } });
      if (activeAdmins <= 1) {
        return NextResponse.json({ error: LAST_ADMIN_REASON }, { status: 409 });
      }
    }

    // Tests and submissions reference the user directly.
    const blockedBy = deleteBlockReason({
      authoredTestCount: target._count.authoredTests,
      submissionCount: target._count.submissions,
    });
    if (blockedBy) {
      return NextResponse.json(
        { error: `This account cannot be deleted. ${blockedBy} Deactivate it instead.` },
        { status: 409 }
      );
    }

    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
