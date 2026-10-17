import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseRosterFile } from "@/lib/excel";
import { hashPassword } from "@/lib/password";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const parseResult = parseRosterFile(arrayBuffer);

    if (parseResult.errors.length > 0 && parseResult.records.length === 0) {
      return NextResponse.json(
        {
          error: "Roster parsing failed",
          details: parseResult.errors,
        },
        { status: 400 }
      );
    }

    const sectionCache = new Map<string, string>(); // sectionName -> sectionId
    const provisionedStudents: Array<{
      name: string;
      username: string;
      temporaryPassword: string;
      lrn: string;
    }> = [];

    const creationErrors: Array<{ lrn: string; error: string }> = [];

    for (const record of parseResult.records) {
      try {
        // Ensure section exists (upsert)
        let sectionId = sectionCache.get(record.section);
        if (!sectionId) {
          const section = await db.section.upsert({
            where: { name: record.section },
            update: {},
            create: { name: record.section },
          });
          sectionId = section.id;
          sectionCache.set(record.section, sectionId);
        }

        // Generate username: firstname.lastname or lrn
        const baseUsername = `${record.firstName.toLowerCase().replace(/[^a-z0-9]/g, "")}.${record.lastName.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
        let username = baseUsername;
        let suffix = 1;
        while (await db.user.findUnique({ where: { username } })) {
          username = `${baseUsername}${suffix}`;
          suffix++;
        }

        // Initial password = LRN
        const temporaryPassword = record.lrn;
        const passwordHash = await hashPassword(temporaryPassword);

        // Check if student with this LRN already exists
        const existingStudent = await db.studentProfile.findUnique({
          where: { lrn: record.lrn },
        });

        if (existingStudent) {
          creationErrors.push({
            lrn: record.lrn,
            error: `Student with LRN ${record.lrn} already registered.`,
          });
          continue;
        }

        // Create user and profile in transaction
        await db.user.create({
          data: {
            id: nanoid(),
            username,
            name: `${record.firstName} ${record.lastName}`,
            email: record.email || null,
            firstName: record.firstName,
            lastName: record.lastName,
            role: "STUDENT",
            passwordHash,
            mustChangePassword: true, // Enforce mandatory first-login password change
            studentProfile: {
              create: {
                lrn: record.lrn,
                sectionId,
              },
            },
          },
        });

        provisionedStudents.push({
          name: `${record.firstName} ${record.lastName}`,
          username,
          temporaryPassword,
          lrn: record.lrn,
        });
      } catch (err: unknown) {
        creationErrors.push({
          lrn: record.lrn,
          error: (err as Error).message || "Failed to create student account",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully provisioned ${provisionedStudents.length} student account(s)`,
      totalRecordsInFile: parseResult.totalRows,
      successfulCount: provisionedStudents.length,
      failedCount: creationErrors.length + parseResult.errors.length,
      validationErrors: parseResult.errors,
      creationErrors,
      students: provisionedStudents,
    });
  } catch (error) {
    console.error("POST /api/admin/roster-upload error:", error);
    return NextResponse.json({ error: "Roster batch processing failed" }, { status: 500 });
  }
}
