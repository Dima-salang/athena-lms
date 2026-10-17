"use client";

import Link from "next/link";
import { Eye, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { SubmissionItem } from "@/components/teacher/submissions/types";

export function SubmissionsTable({
  submissions,
  loading,
  hasAny,
}: {
  submissions: SubmissionItem[];
  loading: boolean;
  hasAny: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border bg-card py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>LRN</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Converted grade</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    {hasAny
                      ? "No submissions match your filters."
                      : "No submissions yet. Students will appear here once they start the test."}
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((sub) => {
                  const isPassing = (sub.transmutedGrade || 0) >= 75;
                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.studentName}</TableCell>
                      <TableCell className="font-mono text-xs">{sub.studentLrn}</TableCell>
                      <TableCell className="text-sm">{sub.sectionName}</TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={sub.status} />
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs">
                        {sub.rawScore !== null && sub.rawScore !== undefined ? (
                          <>
                            {sub.rawScore} / {sub.totalPoints}
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm font-semibold">
                        {sub.transmutedGrade !== null &&
                        sub.transmutedGrade !== undefined ? (
                          <span className={isPassing ? "text-success" : "text-destructive"}>
                            {sub.transmutedGrade}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {sub.submittedAt ? formatDate(sub.submittedAt) : "In progress"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" asChild className="h-8 gap-1.5 text-xs">
                          <Link href={`/teacher/submissions/${sub.id}`}>
                            <Eye className="h-3.5 w-3.5" aria-hidden />
                            Review
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
