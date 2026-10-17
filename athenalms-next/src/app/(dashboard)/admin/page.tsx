import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Layers, UserCheck, Users } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { db } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [
    studentCount,
    teacherCount,
    sectionCount,
    subjectCount,
    assignmentCount,
    onTemporaryPassword,
    noSectionCount,
    inactiveCount,
  ] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }),
    db.user.count({ where: { role: "TEACHER" } }),
    db.section.count({ where: { isActive: true } }),
    db.subject.count({ where: { isActive: true } }),
    db.teacherAssignment.count(),
    db.user.count({ where: { role: "STUDENT", mustChangePassword: true } }),
    db.user.count({
      where: {
        role: "STUDENT",
        isActive: true,
        OR: [ { studentProfile: { is: null } }, { studentProfile: { is: { sectionId: null } } } ],
      },
    }),
    db.user.count({ where: { isActive: false, role: { in: [ "STUDENT", "TEACHER" ] } } }),
  ]);

  const attention = [
    {
      count: noSectionCount,
      title: `${noSectionCount} student${noSectionCount === 1 ? "" : "s"} not in a section`,
      description: "They are enrolled but will not see any class tests until you place them.",
      href: "/admin/users?role=STUDENT&section=unassigned",
      action: "Place students",
    },
    {
      count: onTemporaryPassword,
      title: `${onTemporaryPassword} student${
        onTemporaryPassword === 1 ? "" : "s"
      } still on a temporary password`,
      description: "They have not signed in yet, or have not changed their password.",
      href: "/admin/users?role=STUDENT&status=must-change-password",
      action: "Review accounts",
    },
    {
      count: inactiveCount,
      title: `${inactiveCount} deactivated account${inactiveCount === 1 ? "" : "s"}`,
      description: "Students and teachers who cannot sign in until you activate them.",
      href: "/admin/users",
      action: "Review accounts",
    },
  ].filter((item) => item.count > 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin dashboard"
        description="Manage student accounts, sections, subjects, and which teachers handle what."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Students"
          value={studentCount}
          hint="All student accounts"
          icon={Users}
          tone="primary"
          href="/admin/users?role=STUDENT"
        />
        <StatCard
          label="Teachers"
          value={teacherCount}
          hint={`${assignmentCount} class assignment${assignmentCount === 1 ? "" : "s"}`}
          icon={UserCheck}
          tone="success"
          href="/admin/users?role=TEACHER"
        />
        <StatCard
          label="Sections"
          value={sectionCount}
          hint="Active sections"
          icon={Layers}
          tone="gold"
          href="/admin/sections"
        />
        <StatCard
          label="Subjects"
          value={subjectCount}
          hint="Subjects you offer"
          icon={BookOpen}
          tone="warning"
          href="/admin/subjects"
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-xs label-mono font-bold text-muted-foreground">
          Needs attention
        </h2>

        {attention.length === 0 ? (
          <Alert variant="success">
            Nothing needs attention right now. Every student is in a section, and every account
            has a password of its own.
          </Alert>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {attention.map((item) => (
              <Card key={item.title} className="border-warning">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">{item.title}</CardTitle>
                  <CardDescription className="text-xs">{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link href={item.href}>
                      {item.action}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" aria-hidden />
              Import students
            </CardTitle>
            <CardDescription>
              Add a whole class at once from an Excel or CSV list. Each new student signs in with
              their LRN and changes it at first sign-in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="gap-2">
              <Link href="/admin/roster-upload">
                Import students
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" aria-hidden />
              Teacher assignments
            </CardTitle>
            <CardDescription>
              Choose which teacher handles which class and subject. This is what lets them create
              tests and grade students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/admin/teacher-assignments">
                Manage assignments
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
