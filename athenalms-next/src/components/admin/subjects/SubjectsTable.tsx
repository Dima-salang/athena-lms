"use client";

import { BookOpen, Loader2, MoreHorizontal, Pencil, Power, PowerOff } from "lucide-react";

import type { SubjectItem } from "@/components/admin/subjects/types";
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

interface SubjectsTableProps {
  subjects: SubjectItem[];
  loading: boolean;
  canManage: boolean;
  busyId: string | null;
  onEdit: (subject: SubjectItem) => void;
  onToggleActive: (subject: SubjectItem, isActive: boolean) => void;
}

export function SubjectsTable({
  subjects,
  loading,
  canManage,
  busyId,
  onEdit,
  onToggleActive,
}: SubjectsTableProps) {
  const columns = canManage ? 4 : 3;

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Code</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              {canManage ? <TableHead className="w-16 text-right">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns} className="py-10 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="sr-only">Loading subjects</span>
                </TableCell>
              </TableRow>
            ) : subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns} className="p-0">
                  <EmptyState
                    icon={BookOpen}
                    title="No subjects to show"
                    description={
                      canManage
                        ? "Add the subjects your school offers."
                        : "No subjects are assigned to you yet."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-mono text-xs font-bold text-primary">
                    {subject.code || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-semibold">{subject.name}</div>
                    {subject.description ? (
                      <div className="max-w-md text-xs text-muted-foreground">
                        {subject.description}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {subject.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Actions for ${subject.name}`}
                          >
                            <MoreHorizontal className="h-4 w-4" aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(subject)}>
                            <Pencil className="mr-2 h-4 w-4" aria-hidden />
                            Edit subject
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onToggleActive(subject, !subject.isActive)}
                            disabled={busyId === subject.id}
                          >
                            {subject.isActive ? (
                              <>
                                <PowerOff className="mr-2 h-4 w-4" aria-hidden />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Power className="mr-2 h-4 w-4" aria-hidden />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
