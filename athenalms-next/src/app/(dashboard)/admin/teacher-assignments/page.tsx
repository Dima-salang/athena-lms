"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { AssignmentFormDialog } from "@/components/admin/assignments/AssignmentFormDialog";
import { AssignmentsTable } from "@/components/admin/assignments/AssignmentsTable";
import { useAssignments } from "@/components/admin/assignments/use-assignments";
import {
  ASSIGNMENT_SORT_LABELS,
  type AssignmentItem,
  type AssignmentSort,
} from "@/components/admin/assignments/types";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TeacherAssignmentsPage() {
  const list = useAssignments();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AssignmentItem | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (assignment: AssignmentItem) => {
    setEditing(assignment);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher assignments"
        description="Choose which teacher handles which class and subject."
        actions={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            Assign teacher
          </Button>
        }
      />

      <ListToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search by teacher, section or subject…"
        noun="assignments"
        shown={list.assignments.length}
        total={list.totalCount}
        hasActiveFilters={list.hasActiveFilters}
        onReset={list.resetFilters}
        filters={
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Section</Label>
              <Select value={list.sectionFilter} onValueChange={list.setSectionFilter}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All sections</SelectItem>
                  {list.sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Subject</Label>
              <Select value={list.subjectFilter} onValueChange={list.setSubjectFilter}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All subjects</SelectItem>
                  {list.subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Sort by</Label>
              <Select
                value={list.sort}
                onValueChange={(value) => list.setSort(value as AssignmentSort)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ASSIGNMENT_SORT_LABELS) as AssignmentSort[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {ASSIGNMENT_SORT_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        }
      />

      {list.error ? <Alert variant="error">{list.error}</Alert> : null}

      <AssignmentsTable
        assignments={list.assignments}
        loading={list.loading}
        busyId={list.busyId}
        onEdit={openEdit}
        onRemove={list.remove}
      />

      <AssignmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        assignment={editing}
        teachers={list.teachers}
        sections={list.sections}
        subjects={list.subjects}
        onSaved={list.reload}
      />

      {list.dialog}
    </div>
  );
}
