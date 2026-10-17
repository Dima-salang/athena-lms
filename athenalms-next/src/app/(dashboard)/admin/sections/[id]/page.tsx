"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Pencil, Power, PowerOff, UserPlus } from "lucide-react";

import { AddStudentsDialog } from "@/components/admin/sections/AddStudentsDialog";
import { SectionAssignmentsTab } from "@/components/admin/sections/SectionAssignmentsTab";
import { SectionFormDialog } from "@/components/admin/sections/SectionFormDialog";
import { SectionStudentsTab } from "@/components/admin/sections/SectionStudentsTab";
import { useSectionDetail } from "@/components/admin/sections/use-section-detail";
import { sectionSubtitle, type SectionItem } from "@/components/admin/sections/types";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApiResource } from "@/hooks/use-api-resource";

export default function SectionDetailPage() {
  const params = useParams<{ id: string }>();
  const sectionId = params.id;

  const { data: sectionsData } = useApiResource<SectionItem[]>("/api/admin/sections");
  const { data: me } = useApiResource<{ role: string }>("/api/auth/me");

  const sections = sectionsData ?? [];
  const canManage = me?.role === "ADMIN";

  const detail = useSectionDetail(sectionId, { sections });
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const section = detail.section;
  const moveTargets = sections.filter((item) => item.id !== sectionId);

  if (detail.loading && !section) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="sr-only">Loading section</span>
      </div>
    );
  }

  if (detail.error || !section) {
    return (
      <div className="space-y-6">
        <Alert variant="error">{detail.error ?? "This section could not be found."}</Alert>
        <Button variant="outline" asChild>
          <Link href="/admin/sections" className="gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to sections
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit gap-2">
        <Link href="/admin/sections">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All sections
        </Link>
      </Button>

      <PageHeader
        title={section.name}
        description={`${sectionSubtitle(section)} • ${
          section.students.length
        } student${section.students.length === 1 ? "" : "s"}`}
        actions={
          canManage ? (
            <>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => detail.setActive(!section.isActive)}
                disabled={detail.busyId !== null}
              >
                {section.isActive ? (
                  <PowerOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Power className="h-4 w-4" aria-hidden />
                )}
                {section.isActive ? "Deactivate" : "Activate"}
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" aria-hidden />
                Edit section
              </Button>
              <Button className="gap-2" onClick={() => setAddOpen(true)}>
                <UserPlus className="h-4 w-4" aria-hidden />
                Add students
              </Button>
            </>
          ) : null
        }
      />

      {!section.isActive ? (
        <Alert variant="warning">
          This section is inactive. It is hidden from day-to-day lists, but its students and
          records are untouched.
        </Alert>
      ) : null}

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">
            Students
            <span className="ml-2 font-mono text-xs">{section.students.length}</span>
          </TabsTrigger>
          <TabsTrigger value="assignments">
            Teacher assignments
            <span className="ml-2 font-mono text-xs">{section.assignments.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="pt-4">
          <SectionStudentsTab
            students={section.students}
            loading={detail.loading}
            currentSectionId={sectionId}
            moveTargets={moveTargets}
            busyId={detail.busyId}
            canManage={canManage}
            onMove={detail.setStudentSection}
            onAdd={() => setAddOpen(true)}
          />
        </TabsContent>

        <TabsContent value="assignments" className="pt-4">
          <SectionAssignmentsTab
            assignments={section.assignments}
            loading={detail.loading}
          />
        </TabsContent>
      </Tabs>

      <SectionFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        section={section}
        onSaved={detail.reload}
      />

      <AddStudentsDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        sectionName={section.name}
        busy={detail.busyId === "__adding__"}
        onAdd={detail.addStudents}
      />

      {detail.dialog}
    </div>
  );
}
