"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { ListToolbar } from "@/components/admin/ListToolbar";
import { SectionFormDialog } from "@/components/admin/sections/SectionFormDialog";
import { SectionsTable } from "@/components/admin/sections/SectionsTable";
import {
  SECTION_SORT_LABELS,
  SECTION_STATUS_LABELS,
  useSections,
  type SectionSort,
  type SectionStatusFilter,
} from "@/components/admin/sections/use-sections";
import type { SectionItem } from "@/components/admin/sections/types";
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

export default function SectionsPage() {
  const list = useSections();
  const { data: me } = useApiResource<{ role: string }>("/api/auth/me");
  const canManage = me?.role === "ADMIN";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SectionItem | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (section: SectionItem) => {
    setEditing(section);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sections"
        description="Set up your sections and who advises each one."
        actions={
          canManage ? (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              Add section
            </Button>
          ) : null
        }
      />

      <ListToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search by section name, adviser or grade level…"
        noun="sections"
        shown={list.sections.length}
        total={list.totalCount}
        hasActiveFilters={list.hasActiveFilters}
        onReset={list.resetFilters}
        filters={
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={list.status}
                onValueChange={(value) => list.setStatus(value as SectionStatusFilter)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SECTION_STATUS_LABELS) as SectionStatusFilter[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {SECTION_STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Sort by</Label>
              <Select
                value={list.sort}
                onValueChange={(value) => list.setSort(value as SectionSort)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SECTION_SORT_LABELS) as SectionSort[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {SECTION_SORT_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        }
      />

      {list.error ? <Alert variant="error">{list.error}</Alert> : null}

      <SectionsTable
        sections={list.sections}
        loading={list.loading}
        canManage={canManage}
        busyId={list.busyId}
        onEdit={openEdit}
        onToggleActive={list.setActive}
      />

      <SectionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        section={editing}
        onSaved={list.reload}
      />

      {list.dialog}
    </div>
  );
}
