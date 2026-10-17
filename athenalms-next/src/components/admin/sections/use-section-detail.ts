"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import type { AdminUserItem } from "@/components/admin/users/types";
import { fullName } from "@/components/admin/users/types";
import type { SectionDetail } from "@/components/admin/sections/types";
import { useApiResource } from "@/hooks/use-api-resource";
import { useConfirm } from "@/hooks/use-confirm";

interface Options {
  /** Section options for the “move to” picker, excluding the current one. */
  sections: { id: string; name: string }[];
}

/**
 * Loads one section and owns every change an admin can make from it: moving a
 * student to another section, taking a student out, adding students and
 * switching the section on or off.
 */
export function useSectionDetail(sectionId: string, { sections }: Options) {
  const { data, loading, error, reload } = useApiResource<SectionDetail>(
    `/api/admin/sections/${sectionId}`,
    "Failed to load this section."
  );
  const { confirm, dialog } = useConfirm();
  const [busyId, setBusyId] = useState<string | null>(null);

  const setStudentSection = useCallback(
    async (student: AdminUserItem, nextSectionId: string | null) => {
      const targetName = nextSectionId
        ? sections.find((section) => section.id === nextSectionId)?.name ?? "another section"
        : null;
      const ok = await confirm({
        title: targetName
          ? `Move ${fullName(student)} to ${targetName}?`
          : `Remove ${fullName(student)} from this section?`,
        description: targetName
          ? "They will see the tests for their new section."
          : "They stay enrolled but are no longer in a section until you place them again.",
        confirmLabel: targetName ? "Move student" : "Remove",
        destructive: nextSectionId === null,
      });
      if (!ok) return;

      setBusyId(student.id);
      try {
        const res = await fetch(`/api/admin/users/${student.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionId: nextSectionId }),
        });
        const body = await res.json().catch(() => null);

        if (!res.ok) {
          toast.error(body?.error ?? "Could not move the student.");
          return;
        }

        toast.success(
          targetName ? `${fullName(student)} moved to ${targetName}` : `${fullName(student)} removed`
        );
        reload();
      } finally {
        setBusyId(null);
      }
    },
    [confirm, reload, sections]
  );

  const addStudents = useCallback(
    async (students: AdminUserItem[]) => {
      if (students.length === 0) return;

      setBusyId("__adding__");
      let added = 0;
      const failures: string[] = [];

      try {
        for (const student of students) {
          const res = await fetch(`/api/admin/users/${student.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sectionId }),
          });
          if (res.ok) added += 1;
          else failures.push(fullName(student));
        }

        if (added > 0) {
          toast.success(`${added} student${added === 1 ? "" : "s"} added`);
        }
        if (failures.length > 0) {
          toast.error(`${failures.length} could not be added`, {
            description: failures.slice(0, 3).join(", "),
          });
        }
        reload();
      } finally {
        setBusyId(null);
      }
    },
    [reload, sectionId]
  );

  const setActive = useCallback(
    async (isActive: boolean) => {
      const ok = await confirm({
        title: isActive ? "Activate this section?" : "Deactivate this section?",
        description: isActive
          ? "The section will show up in lists again."
          : "Students stay in it, but the section is hidden from day-to-day lists. Nothing is deleted.",
        confirmLabel: isActive ? "Activate" : "Deactivate",
        destructive: !isActive,
      });
      if (!ok) return;

      setBusyId("__active__");
      try {
        const res = await fetch(`/api/admin/sections/${sectionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        });
        const body = await res.json().catch(() => null);

        if (!res.ok) {
          toast.error(body?.error ?? "Could not update the section.");
          return;
        }

        toast.success(isActive ? "Section activated" : "Section deactivated");
        reload();
      } finally {
        setBusyId(null);
      }
    },
    [confirm, reload, sectionId]
  );

  return {
    section: data,
    loading,
    error,
    reload,
    busyId,
    setStudentSection,
    addStudents,
    setActive,
    dialog,
  };
}
