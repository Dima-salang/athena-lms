"use client";

import { Layers, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { AssignmentItem } from "@/components/admin/assignments/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AssignmentsTableProps {
  assignments: AssignmentItem[];
  loading: boolean;
  busyId: string | null;
  onEdit: (assignment: AssignmentItem) => void;
  onRemove: (assignment: AssignmentItem) => void;
}

export function AssignmentsTable({
  assignments,
  loading,
  busyId,
  onEdit,
  onRemove,
}: AssignmentsTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>School year</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="sr-only">Loading assignments</span>
                </TableCell>
              </TableRow>
            ) : assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <EmptyState
                    icon={Layers}
                    title="No assignments yet"
                    description='Use "Assign teacher" to give a teacher a class and subject.'
                  />
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div className="text-sm font-semibold">{assignment.teacherName}</div>
                    <div className="text-xs text-muted-foreground">
                      @{assignment.teacherUsername}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{assignment.subjectName}</Badge>
                    {assignment.subjectCode ? (
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {assignment.subjectCode}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm">{assignment.sectionName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {assignment.schoolYear || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Actions for ${assignment.teacherName} in ${assignment.sectionName}`}
                        >
                          <MoreHorizontal className="h-4 w-4" aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(assignment)}>
                          <Pencil className="mr-2 h-4 w-4" aria-hidden />
                          Edit assignment
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onRemove(assignment)}
                          disabled={busyId === assignment.id}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" aria-hidden />
                          Remove assignment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
