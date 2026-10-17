/**
 * Better Auth catch-all API handler
 * Mounts all Better Auth endpoints at /api/auth/*
 */

import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return auth.handler(request);
}

export async function POST(request: NextRequest) {
  return auth.handler(request);
}
