import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Users, CheckCircle2, ArrowRight } from "lucide-react";
import { formatExamType } from "@/lib/utils";

export default async function TeacherDashboardPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  const teacherId = session?.user?.id || "";

  const [tests, totalSubmissions] = await Promise.all([
    db.test.findMany({
      where: { authorId: teacherId, isArchived: false },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        subject: { select: { name: true } },
        sections: { include: { section: { select: { name: true } } } },
        _count: { select: { submissions: true, questions: true } },
      },
    }),
    db.submission.count({
      where: { test: { authorId: teacherId } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Teacher dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Create tests, review submissions, and see how your class did.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/teacher/tests/create">
            <Plus className="h-4 w-4" aria-hidden />
            Create test
          </Link>
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests</CardTitle>
            <FileText className="h-4 w-4 text-primary" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-semibold">{tests.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">Your most recent tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-semibold">{totalSubmissions}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Tests finished by students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All tests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Search, filter, and duplicate any of your tests.
            </p>
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link href="/teacher/tests">View all tests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">Recent tests</CardTitle>
            <CardDescription>Your latest updated tests</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
            <Link href="/teacher/tests">
              View all <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              You haven&apos;t created any tests yet. Select &quot;Create test&quot; to
              get started.
            </div>
          ) : (
            <div className="divide-y">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="flex flex-col items-start justify-between gap-3 py-4 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm hover:text-primary transition-colors">
                        <Link href={`/teacher/tests/${test.id}/edit`}>{test.title}</Link>
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {formatExamType(test.examType)}
                      </Badge>
                      {test.isPublished ? (
                        <Badge variant="success" className="text-[10px]">Published</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-2 items-center">
                      <span>{test.subject?.name || "General"}</span>
                      <span>•</span>
                      <span>{test._count.questions} questions</span>
                      <span>•</span>
                      <span>{test._count.submissions} submissions</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button asChild variant="outline" size="sm" className="text-xs h-8">
                      <Link href={`/teacher/tests/${test.id}/submissions`}>Submissions</Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm" className="text-xs h-8">
                      <Link href={`/teacher/tests/${test.id}/analytics`}>Analytics</Link>
                    </Button>
                    <Button asChild size="sm" className="text-xs h-8">
                      <Link href={`/teacher/tests/${test.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
