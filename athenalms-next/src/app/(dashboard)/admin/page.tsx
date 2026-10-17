import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Layers, BookOpen, UserCheck, Upload, ArrowRight } from "lucide-react";

export default async function AdminDashboardPage() {
  const [
    studentCount,
    teacherCount,
    sectionCount,
    subjectCount,
  ] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }),
    db.user.count({ where: { role: "TEACHER" } }),
    db.section.count({ where: { isActive: true } }),
    db.subject.count({ where: { isActive: true } }),
  ]);

  const cards = [
    {
      title: "Students Enrolled",
      value: studentCount,
      description: "Active student accounts",
      icon: Users,
      color: "bg-primary text-primary-foreground",
      href: "/admin/users?role=STUDENT",
    },
    {
      title: "Faculty Members",
      value: teacherCount,
      description: "Teaching staff registered",
      icon: UserCheck,
      color: "bg-lime text-lime-foreground",
      href: "/admin/users?role=TEACHER",
    },
    {
      title: "Class Sections",
      value: sectionCount,
      description: "Active class cohorts",
      icon: Layers,
      color: "bg-success text-success-foreground",
      href: "/admin/sections",
    },
    {
      title: "Academic Subjects",
      value: subjectCount,
      description: "Course catalogue items",
      icon: BookOpen,
      color: "bg-warning text-warning-foreground",
      href: "/admin/subjects",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Institutional Administration</h1>
        <p className="text-sm text-muted-foreground">
          Manage system rosters, academic taxonomy, teacher assignments, and institutional access.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.title} href={c.href}>
              <Card className="hover:border-primary/50 transition-all hover:shadow-md cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
                  <div className={`flex h-9 w-9 items-center justify-center border-2 border-border ${c.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{c.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Batch Roster Provisioning
            </CardTitle>
            <CardDescription>
              Upload class lists via Excel (.xlsx) or CSV files. Automatically provision student accounts with pregenerated credentials and mandatory first-login password changes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="gap-2">
              <Link href="/admin/roster-upload">
                Upload Class Roster
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              Teacher Subject Assignments
            </CardTitle>
            <CardDescription>
              Assign teachers to specific sections and academic courses. Authorizes instructors to create tests and grade students within their jurisdiction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/admin/teacher-assignments">
                Manage Faculty Assignments
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
