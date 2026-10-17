/**
 * Better Auth Server Configuration
 *
 * Configures authentication with:
 *  - Credentials provider (username + password)
 *  - Prisma database adapter for session storage
 *  - Role-based session claims
 *  - Secure HttpOnly cookie sessions
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "sqlite",
  }),

  // Session cookie configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 10, // 10 hours — matches exam session duration
    },
  },

  // Email & Password with custom bcrypt hashing
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password: string) => hashPassword(password),
      verify: async ({ password, hash }: { password: string; hash: string }) =>
        verifyPassword(password, hash),
    },
  },

  // Additional session fields beyond Better Auth defaults
  user: {
    additionalFields: {
      username: { type: "string", required: true },
      firstName: { type: "string", required: true },
      lastName: { type: "string", required: true },
      role: { type: "string", required: true },
      mustChangePassword: { type: "boolean", required: false, defaultValue: false },
      isActive: { type: "boolean", required: false, defaultValue: true },
    },
  },

  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  ],
});

export type Auth = typeof auth;
