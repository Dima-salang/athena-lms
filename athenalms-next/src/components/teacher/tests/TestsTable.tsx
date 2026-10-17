"use client";

import Link from "next/link";
import {
  BarChart3,
  Copy,
  Key,
  Loader2,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatExamType } from "@/lib/utils";
import type { TeacherTestItem } from "@/components/teacher/tests/types";

interface TestsTableProps {
  tests: TeacherTestItem[];
  loading: boolean;
  cloningId: string | null;
  hasAnyTests: boolean;
  onDuplicate: (id: string) => void;
  onArchive: (test: TeacherTestItem) => void;
  onReset: () => void;
}

function RowActions({
  test,
  cloningId,
  onDuplicate,
  onArchive,
  compact,
}: {
  test: TeacherTestItem;
  cloningId: string | null;
  onDuplicate: (id: string) => void;
  onArchive: (test: TeacherTestItem) => void;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" asChild title="Edit test" className="h-8 w-8">
        <Link href={`/teacher/tests/${test.id}/edit`}>
          <Pencil className="h-4 w-4" aria-hidden />
          <span className="sr-only">Edit</span>
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild title="Submissions" className="h-8 w-8">
        <Link href={`/teacher/tests/${test.id}/submissions`}>
          <Users className="h-4 w-4" aria-hidden />
          <span className="sr-only">Submissions</span>
        </Link>
      </Button>
      {!compact ? (
        <>
          <Button variant="ghost" size="icon" asChild title="Results & analytics" className="h-8 w-8">
            <Link href={`/teacher/tests/${test.id}/analytics`}>
              <BarChart3 className="h-4 w-4" aria-hidden />
              <span className="sr-only">Results and analytics</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            title="Special access"
            className="h-8 w-8"
          >
            <Link href={`/teacher/tests/${test.id}/special-access`}>
              <Key className="h-4 w-4" aria-hidden />
              <span className="sr-only">Special access</span>
            </Link>
          </Button>
        </>
      ) : null}
      <Button
        variant="ghost"
        size="icon"
        title="Duplicate test"
        disabled={cloningId === test.id}
        onClick={() => onDuplicate(test.id)}
        className="h-8 w-8"
      >
        {cloningId === test.id ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Copy className="h-4 w-4" aria-hidden />
        )}
        <span className="sr-only">Duplicate</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Archive test"
        onClick={() => onArchive(test)}
        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
        <span className="sr-only">Archive</span>
      </Button>
    </div>
  );
}

function StatusBadges({ test }: { test: TeacherTestItem }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge variant={test.isPublished ? "success" : "secondary"} className="text-[10px]">
        {test.isPublished ? "Published" : "Draft"}
      </Badge>
      {test.hasInfiniteTime ? (
        <Badge variant="outline" className="text-[10px]">
          Untimed
        </Badge>
      ) : null}
    </div>
  );
}

export function TestsTable({
  tests,
  loading,
  cloningId,
  hasAnyTests,
  onDuplicate,
  onArchive,
  onReset,
}: TestsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border bg-card py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (tests.length === 0) {
    return hasAnyTests ? (
      <EmptyState
        title="No tests match your filters"
        description="Try a different search term, or reset the filters."
        action={
          <Button variant="outline" onClick={onReset}>
            Reset filters
          </Button>
        }
      />
    ) : (
      <EmptyState
        title="No tests yet"
        description="Create your first test to get started."
        action={
          <Button asChild>
            <Link href="/teacher/tests/create">Create test</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject &amp; sections</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-center">Submissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="max-w-xs">
                      <Link
                        href={`/teacher/tests/${test.id}/edit`}
                        className="font-medium hover:text-primary"
                      >
                        {test.title}
                      </Link>
                      <div className="mt-1.5">
                        <StatusBadges test={test} />
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">
                      {formatExamType(test.examType)}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-medium">{test.subjectName || "—"}</div>
                      <div className="text-muted-foreground">
                        {test.sectionNames.length > 0
                          ? test.sectionNames.join(", ")
                          : "No sections"}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">
                      {formatDate(test.dueDate)}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">
                      {test.questionCount}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">
                      <Link
                        href={`/teacher/tests/${test.id}/submissions`}
                        className="text-primary hover:underline"
                      >
                        {test.submissionCount}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActions
                        test={test}
                        cloningId={cloningId}
                        onDuplicate={onDuplicate}
                        onArchive={onArchive}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {tests.map((test) => (
          <Card key={test.id}>
            <CardContent className="space-y-3 p-4">
              <div className="space-y-2">
                <Link
                  href={`/teacher/tests/${test.id}/edit`}
                  className="font-medium hover:text-primary"
                >
                  {test.title}
                </Link>
                <StatusBadges test={test} />
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Type</dt>
                  <dd>{formatExamType(test.examType)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Deadline</dt>
                  <dd>{formatDate(test.dueDate)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Items</dt>
                  <dd>{test.questionCount}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Submissions</dt>
                  <dd>{test.submissionCount}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">
                    {test.subjectName || "No subject"}
                  </dt>
                  <dd>
                    {test.sectionNames.length > 0
                      ? test.sectionNames.join(", ")
                      : "No sections"}
                  </dd>
                </div>
              </dl>
              <div className="border-t pt-3">
                <RowActions
                  test={test}
                  cloningId={cloningId}
                  onDuplicate={onDuplicate}
                  onArchive={onArchive}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
