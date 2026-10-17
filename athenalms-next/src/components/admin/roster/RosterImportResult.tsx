"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RosterUploadResponse } from "@/components/admin/roster/types";
import { Download } from "lucide-react";

interface RosterImportResultProps {
  result: RosterUploadResponse;
  onExportCredentials: () => void;
}

/** What the import did: how many accounts, their starting passwords, and what failed. */
export function RosterImportResult({ result, onExportCredentials }: RosterImportResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Import finished — {result.successfulCount} account
          {result.successfulCount === 1 ? "" : "s"} created
        </CardTitle>
        <CardDescription>
          Every new student starts with their 12-digit LRN as the password and must change it at
          first sign-in.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {result.failedCount > 0 ? (
          <Alert variant="warning">
            {result.failedCount} row{result.failedCount === 1 ? "" : "s"} could not be imported.
            {result.creationErrors.length > 0 ? (
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
                {result.creationErrors.slice(0, 5).map((failure) => (
                  <li key={failure.lrn}>
                    <span className="font-mono">{failure.lrn}</span>: {failure.error}
                  </li>
                ))}
              </ul>
            ) : null}
          </Alert>
        ) : null}

        {result.validationErrors.length > 0 ? (
          <Alert variant="warning">
            {result.validationErrors.length} row
            {result.validationErrors.length === 1 ? "" : "s"} in the file had problems, so
            {result.validationErrors.length === 1 ? " it was" : " they were"} skipped.
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
              {result.validationErrors.slice(0, 5).map((problem) => (
                <li key={`${problem.row}-${problem.field ?? "row"}`}>
                  Row {problem.row}: {problem.message}
                </li>
              ))}
            </ul>
          </Alert>
        ) : null}

        {result.students.length > 0 ? (
          <div className="border-2 border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>LRN</TableHead>
                  <TableHead>Starting password</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.students.map((student) => (
                  <TableRow key={student.username}>
                    <TableCell className="text-sm font-semibold">{student.name}</TableCell>
                    <TableCell className="font-mono text-xs">{student.username}</TableCell>
                    <TableCell className="font-mono text-xs">{student.lrn}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {student.temporaryPassword}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </CardContent>

      <CardContent className="border-t-2 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Must change password as soon as they sign in.
          </p>
          <Button variant="outline" size="sm" className="gap-2" onClick={onExportCredentials}>
            <Download className="h-4 w-4" aria-hidden />
            Download passwords (Excel)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
