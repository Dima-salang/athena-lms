"use client";

import React from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GradebookEntryDTO } from "@/types";

export function GradebookTable({ rows }: { rows: GradebookEntryDTO[] }) {
  return (
    <Card>
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base font-semibold">Class gradebook</CardTitle>
        <CardDescription>
          Every finished submission with its raw score and converted grade.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>LRN</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Raw %</TableHead>
                <TableHead className="text-center">Converted grade</TableHead>
                <TableHead className="text-center">Remarks</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No completed submissions yet.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const isPassing = (row.transmutedGrade || 0) >= 75;
                  return (
                    <TableRow key={row.submissionId}>
                      <TableCell className="font-medium">{row.studentName}</TableCell>
                      <TableCell className="font-mono text-xs">{row.lrn}</TableCell>
                      <TableCell className="text-sm">{row.sectionName}</TableCell>
                      <TableCell className="text-center font-mono text-xs">
                        {row.rawScore} / {row.totalPoints}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs">
                        {row.rawPercent}%
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm font-semibold">
                        <span className={isPassing ? "text-success" : "text-destructive"}>
                          {row.transmutedGrade}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={isPassing ? "success" : "destructive"}
                          className="text-[10px]"
                        >
                          {isPassing ? "Passed" : "Failed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                          <Link href={`/teacher/submissions/${row.submissionId}`}>
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
