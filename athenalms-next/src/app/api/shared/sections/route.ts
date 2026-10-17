import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const sections = await db.section.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        adviserName: true,
        gradeLevel: true,
      },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error("GET /api/shared/sections error:", error);
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }
}
