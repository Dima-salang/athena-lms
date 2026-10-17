import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";

/**
 * POST /api/auth/login
 * Unified authentication endpoint accepting:
 *  - Username (e.g. "admin", "teacher.demo", "100000000001")
 *  - Email (e.g. "admin@athenalms.local")
 *
 * Resolves user credentials, ensures Better Auth Account record exists,
 * and delegates to Better Auth's session engine to issue HttpOnly session cookies.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawIdentifier = body.username ?? body.identifier ?? body.email;
    const password = body.password;

    if (!rawIdentifier || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const trimmedIdentifier = String(rawIdentifier).trim();

    // 1. Resolve user by username or email
    const user = await db.user.findFirst({
      where: {
        OR: [
          { username: trimmedIdentifier },
          { email: trimmedIdentifier },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "This account has been deactivated. Please contact an administrator." },
        { status: 403 }
      );
    }

    // 2. Ensure user has a valid email format for Better Auth's internal router
    const emailToUse = user.email || `${user.username}@athenalms.local`;
    if (!user.email) {
      await db.user.update({
        where: { id: user.id },
        data: { email: emailToUse },
      });
    }

    // 3. Ensure user has a linked "credential" Account record
    const account = await db.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
    });

    if (!account && user.passwordHash) {
      await db.account.create({
        data: {
          id: nanoid(),
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password: user.passwordHash,
        },
      });
    }

    // 4. Delegate to Better Auth signInEmail
    const authResponse = await auth.api.signInEmail({
      body: {
        email: emailToUse,
        password,
      },
      asResponse: true,
    });

    return authResponse;
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please verify your credentials." },
      { status: 401 }
    );
  }
}
