"use client";

import { KeyRound, Loader2, UserPlus, Users } from "lucide-react";

import { fullName, type AdminUserItem } from "@/components/admin/users/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const NO_SECTION = "none";

interface SectionStudentsTabProps {
  students: AdminUserItem[];
  loading: boolean;
  currentSectionId: string;
  /** Every other section a student could be moved to. */
  moveTargets: { id: string; name: string; isActive: boolean }[];
  busyId: string | null;
  canManage: boolean;
  onMove: (student: AdminUserItem, sectionId: string | null) => void;
  onAdd: () => void;
}

/** Who is in this section, and where they can be moved. */
export function SectionStudentsTab({
  students,
  loading,
  currentSectionId,
  moveTargets,
  busyId,
  canManage,
  onMove,
  onAdd,
}: SectionStudentsTabProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>LRN</TableHead>
              <TableHead>Password</TableHead>
              <TableHead className="w-56">Section</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="sr-only">Loading students</span>
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="p-0">
                  <EmptyState
                    icon={Users}
                    title="No students in this section yet"
                    description="Add students who are not in a section, or move them here from another section."
                    action={
                      canManage ? (
                        <Button onClick={onAdd} className="gap-2">
                          <UserPlus className="h-4 w-4" aria-hidden />
                          Add students
                        </Button>
                      ) : null
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="text-sm font-semibold">{fullName(student)}</div>
                    <div className="text-xs text-muted-foreground">
                      @{student.username}
                      {student.isActive ? "" : " • inactive"}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{student.lrn ?? "—"}</TableCell>
                  <TableCell>
                    {student.mustChangePassword ? (
                      <Badge variant="warning" className="gap-1">
                        <KeyRound className="h-3 w-3" aria-hidden />
                        Must change password
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Password set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {canManage ? (
                      <Select
                        value={currentSectionId}
                        onValueChange={(value) =>
                          onMove(student, value === NO_SECTION ? null : value)
                        }
                        disabled={busyId !== null}
                      >
                        <SelectTrigger
                          className="h-9 text-sm"
                          aria-label={`Move or remove ${fullName(student)}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_SECTION}>Remove from section</SelectItem>
                          {moveTargets.map((target) => (
                            <SelectItem key={target.id} value={target.id}>
                              Move to {target.name}
                              {target.isActive ? "" : " (inactive)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
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
