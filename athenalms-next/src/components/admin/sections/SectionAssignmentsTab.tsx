"use client";

import { BookOpen } from "lucide-react";

import type { SectionAssignmentRow } from "@/components/admin/sections/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SectionAssignmentsTabProps {
  assignments: SectionAssignmentRow[];
  loading: boolean;
}

/** Which teachers handle which subject in this section. Read-only for now. */
export function SectionAssignmentsTab({ assignments, loading }: SectionAssignmentsTabProps) {
  if (!loading && assignments.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No teachers assigned yet"
        description="Use Teacher assignments in the sidebar to give a teacher a subject in this section."
      />
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>School year</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-sm font-semibold">{row.teacherName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{row.subjectName}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {row.schoolYear || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
