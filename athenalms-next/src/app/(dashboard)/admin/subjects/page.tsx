"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { ListToolbar } from "@/components/admin/ListToolbar";
import { SubjectFormDialog } from "@/components/admin/subjects/SubjectFormDialog";
import { SubjectsTable } from "@/components/admin/subjects/SubjectsTable";
import {
  SUBJECT_SORT_LABELS,
  SUBJECT_STATUS_LABELS,
  useSubjects,
  type SubjectSort,
  type SubjectStatusFilter,
} from "@/components/admin/subjects/use-subjects";
import type { SubjectItem } from "@/components/admin/subjects/types";
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
import { useApiResource } from "@/hooks/use-api-resource";

export default function SubjectsPage() {
  const list = useSubjects();
  const { data: me } = useApiResource<{ role: string }>("/api/auth/me");
  const canManage = me?.role === "ADMIN";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubjectItem | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (subject: SubjectItem) => {
    setEditing(subject);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subjects"
        description="The subjects your school offers."
        actions={
          canManage ? (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              Add subject
            </Button>
          ) : null
        }
      />

      <ListToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search by subject name or code…"
        noun="subjects"
        shown={list.subjects.length}
        total={list.totalCount}
        hasActiveFilters={list.hasActiveFilters}
        onReset={list.resetFilters}
        filters={
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={list.status}
                onValueChange={(value) => list.setStatus(value as SubjectStatusFilter)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SUBJECT_STATUS_LABELS) as SubjectStatusFilter[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {SUBJECT_STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Sort by</Label>
              <Select
                value={list.sort}
                onValueChange={(value) => list.setSort(value as SubjectSort)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SUBJECT_SORT_LABELS) as SubjectSort[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {SUBJECT_SORT_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        }
      />

      {list.error ? <Alert variant="error">{list.error}</Alert> : null}

      <SubjectsTable
        subjects={list.subjects}
        loading={list.loading}
        canManage={canManage}
        busyId={list.busyId}
        onEdit={openEdit}
        onToggleActive={list.setActive}
      />

      <SubjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subject={editing}
        onSaved={list.reload}
      />

      {list.dialog}
    </div>
  );
}
