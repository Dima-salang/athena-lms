/**
 * Better Auth Client Configuration
 *
 * Client-side hooks and utilities for managing auth state.
 * Wraps Better Auth's built-in client with typed helpers.
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
});

export const { useSession, signIn, signOut } = authClient;
