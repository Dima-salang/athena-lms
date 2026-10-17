/**
 * Prisma Database Seeder
 * Populates the database with initial required data:
 *  - Default admin account
 *  - Sample sections, subjects, teacher assignments
 *  - Sample teacher and student accounts for development/testing
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function main() {
  console.log("🌱 Starting database seed...");

  // ── System Configuration Defaults ────────────────────────────────────────
  await prisma.systemConfig.upsert({
    where: { key: "TRANSMUTATION_FORMULA" },
    update: {},
    create: {
      key: "TRANSMUTATION_FORMULA",
      value: "DEPED_STANDARD",
      description: "Default grade transmutation formula for all tests",
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: "ALLOWED_CIDR_BLOCKS" },
    update: {},
    create: {
      key: "ALLOWED_CIDR_BLOCKS",
      value: "",
      description:
        "Comma-separated CIDR blocks for campus IP whitelisting (empty = disabled)",
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: "EXAM_IP_LOCK_ENABLED" },
    update: {},
    create: {
      key: "EXAM_IP_LOCK_ENABLED",
      value: "false",
      description: "Lock student exam session to their starting IP address",
    },
  });

  // ── Admin Account ─────────────────────────────────────────────────────────
  const adminPasswordHash = await hashPassword("admin");
  const adminExists = await prisma.user.findUnique({
    where: { username: "admin" },
  });

  let adminUser = adminExists;
  if (!adminExists) {
    adminUser = await prisma.user.create({
      data: {
        id: nanoid(),
        username: "admin",
        name: "System Administrator",
        email: "admin@athenalms.local",
        passwordHash: adminPasswordHash,
        firstName: "System",
        lastName: "Administrator",
        role: "ADMIN",
        mustChangePassword: false,
        adminProfile: { create: {} },
      },
    });
    console.log("✅ Admin user created (username: admin / password: admin)");
  } else {
    // Ensure password hash (and required `name`) are up to date
    await prisma.user.update({
      where: { id: adminExists.id },
      data: {
        passwordHash: adminPasswordHash,
        name: adminExists.name ?? "System Administrator",
      },
    });
    console.log("⏭️  Admin user updated (username: admin / password: admin)");
  }

  const effectiveAdminId = adminUser ? adminUser.id : adminExists!.id;

  // Ensure Account record exists for Better Auth
  await prisma.account.deleteMany({
    where: { userId: effectiveAdminId, providerId: "credential" },
  });
  await prisma.account.create({
    data: {
      id: nanoid(),
      userId: effectiveAdminId,
      accountId: effectiveAdminId,
      providerId: "credential",
      password: adminPasswordHash,
    },
  });

  // ── Sample Sections ───────────────────────────────────────────────────────
  const section10A = await prisma.section.upsert({
    where: { name: "Grade 10 - Aristotle" },
    update: {},
    create: {
      name: "Grade 10 - Aristotle",
      adviserName: "Mrs. Santos",
      gradeLevel: "Grade 10",
      schoolYear: "2026-2027",
    },
  });

  const section10B = await prisma.section.upsert({
    where: { name: "Grade 10 - Plato" },
    update: {},
    create: {
      name: "Grade 10 - Plato",
      adviserName: "Mr. Reyes",
      gradeLevel: "Grade 10",
      schoolYear: "2026-2027",
    },
  });

  console.log("✅ Sections seeded");

  // ── Sample Subjects ───────────────────────────────────────────────────────
  const mathSubject = await prisma.subject.upsert({
    where: { name: "Mathematics 10" },
    update: {},
    create: {
      name: "Mathematics 10",
      code: "MATH10",
      description: "Core mathematics for Grade 10",
    },
  });

  const scienceSubject = await prisma.subject.upsert({
    where: { name: "Science 10" },
    update: {},
    create: {
      name: "Science 10",
      code: "SCI10",
      description: "Physics, Chemistry, and Biology integration",
    },
  });

  console.log("✅ Subjects seeded");

  // ── Sample Teacher ────────────────────────────────────────────────────────
  const teacherPasswordHash = await hashPassword("Teacher@123");
  let teacherUser = await prisma.user.findUnique({
    where: { username: "teacher.demo" },
  });

  if (!teacherUser) {
    teacherUser = await prisma.user.create({
      data: {
        id: nanoid(),
        username: "teacher.demo",
        name: "Maria Cruz",
        email: "teacher@athenalms.local",
        passwordHash: teacherPasswordHash,
        firstName: "Maria",
        lastName: "Cruz",
        role: "TEACHER",
        mustChangePassword: false,
        teacherProfile: {
          create: {
            employeeId: "TCH-001",
          },
        },
      },
    });
    console.log(
      "✅ Demo teacher created (username: teacher.demo / password: Teacher@123)"
    );
  } else {
    await prisma.user.update({
      where: { id: teacherUser.id },
      data: {
        passwordHash: teacherPasswordHash,
        email: "teacher@athenalms.local",
        name: teacherUser.name ?? "Maria Cruz",
      },
    });
  }

  // Ensure Teacher Account record exists
  await prisma.account.deleteMany({
    where: { userId: teacherUser.id, providerId: "credential" },
  });
  await prisma.account.create({
    data: {
      id: nanoid(),
      userId: teacherUser.id,
      accountId: teacherUser.id,
      providerId: "credential",
      password: teacherPasswordHash,
    },
  });

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUser.id },
  });

  // ── Teacher Assignments ───────────────────────────────────────────────────
  if (teacherProfile) {
    await prisma.teacherAssignment
      .upsert({
        where: {
          teacherProfileId_sectionId_subjectId: {
            teacherProfileId: teacherProfile.id,
            sectionId: section10A.id,
            subjectId: mathSubject.id,
          },
        },
        update: {},
        create: {
          teacherProfileId: teacherProfile.id,
          sectionId: section10A.id,
          subjectId: mathSubject.id,
          schoolYear: "2026-2027",
        },
      })
      .catch(() => {
        /* Assignment already exists */
      });

    await prisma.teacherAssignment
      .upsert({
        where: {
          teacherProfileId_sectionId_subjectId: {
            teacherProfileId: teacherProfile.id,
            sectionId: section10B.id,
            subjectId: mathSubject.id,
          },
        },
        update: {},
        create: {
          teacherProfileId: teacherProfile.id,
          sectionId: section10B.id,
          subjectId: mathSubject.id,
          schoolYear: "2026-2027",
        },
      })
      .catch(() => {});

    console.log("✅ Teacher assignments seeded");
  }

  // ── Sample Students ───────────────────────────────────────────────────────
  const sampleStudents = [
    { username: "student.001", lrn: "100000000001", firstName: "Juan", lastName: "Dela Cruz" },
    { username: "student.002", lrn: "100000000002", firstName: "Ana", lastName: "Reyes" },
    { username: "student.003", lrn: "100000000003", firstName: "Carlos", lastName: "Santos" },
  ];

  for (const s of sampleStudents) {
    const studentPasswordHash = await hashPassword(s.lrn); // Initial password = LRN
    let studentUser = await prisma.user.findUnique({ where: { username: s.username } });
    if (!studentUser) {
      studentUser = await prisma.user.create({
        data: {
          id: nanoid(),
          username: s.username,
          name: `${s.firstName} ${s.lastName}`,
          email: `${s.username}@athenalms.local`,
          passwordHash: studentPasswordHash,
          firstName: s.firstName,
          lastName: s.lastName,
          role: "STUDENT",
          mustChangePassword: true, // Force password change on first login
          studentProfile: {
            create: {
              lrn: s.lrn,
              sectionId: section10A.id,
            },
          },
        },
      });
    } else {
      await prisma.user.update({
        where: { id: studentUser.id },
        data: {
          email: `${s.username}@athenalms.local`,
          passwordHash: studentPasswordHash,
          name: studentUser.name ?? `${s.firstName} ${s.lastName}`,
        },
      });
    }

    // Ensure Student Account record exists
    await prisma.account.deleteMany({
      where: { userId: studentUser.id, providerId: "credential" },
    });
    await prisma.account.create({
      data: {
        id: nanoid(),
        userId: studentUser.id,
        accountId: studentUser.id,
        providerId: "credential",
        password: studentPasswordHash,
      },
    });
  }

  console.log("✅ Sample students seeded (initial password = LRN)");
  console.log("🎉 Database seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
