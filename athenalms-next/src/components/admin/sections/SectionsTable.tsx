"use client";

import Link from "next/link";
import { Layers, Loader2, MoreHorizontal, Pencil, Power, PowerOff, Users } from "lucide-react";

import type { SectionItem } from "@/components/admin/sections/types";
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

interface SectionsTableProps {
  sections: SectionItem[];
  loading: boolean;
  canManage: boolean;
  busyId: string | null;
  onEdit: (section: SectionItem) => void;
  onToggleActive: (section: SectionItem, isActive: boolean) => void;
}

export function SectionsTable({
  sections,
  loading,
  canManage,
  busyId,
  onEdit,
  onToggleActive,
}: SectionsTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Section</TableHead>
              <TableHead>Grade level</TableHead>
              <TableHead>Adviser</TableHead>
              <TableHead>School year</TableHead>
              <TableHead className="text-center">Students</TableHead>
              <TableHead>Status</TableHead>
              {canManage ? <TableHead className="w-16 text-right">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={canManage ? 7 : 6} className="py-10 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="sr-only">Loading sections</span>
                </TableCell>
              </TableRow>
            ) : sections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 7 : 6} className="p-0">
                  <EmptyState
                    icon={Layers}
                    title="No sections to show"
                    description={
                      canManage
                        ? "Create a section to start placing students."
                        : "No sections are assigned to you yet."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              sections.map((section) => (
                <TableRow key={section.id}>
                  <TableCell>
                    <Link
                      href={`/admin/sections/${section.id}`}
                      className="text-sm font-semibold underline-offset-4 hover:underline"
                    >
                      {section.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{section.gradeLevel || "—"}</TableCell>
                  <TableCell className="text-sm">{section.adviserName || "Unassigned"}</TableCell>
                  <TableCell className="text-sm">{section.schoolYear || "—"}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1.5 border-2 border-border bg-muted px-2 py-0.5 text-xs font-semibold">
                      <Users className="h-3 w-3 text-muted-foreground" aria-hidden />
                      {section.studentCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    {section.isActive ? (
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
                            aria-label={`Actions for ${section.name}`}
                          >
                            <MoreHorizontal className="h-4 w-4" aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(section)}>
                            <Pencil className="mr-2 h-4 w-4" aria-hidden />
                            Edit section
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onToggleActive(section, !section.isActive)}
                            disabled={busyId === section.id}
                          >
                            {section.isActive ? (
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
