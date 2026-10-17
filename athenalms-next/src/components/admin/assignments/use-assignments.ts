"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type {
  AssignmentItem,
  AssignmentSort,
  OptionItem,
  TeacherOption,
} from "@/components/admin/assignments/types";
import type { SectionItem } from "@/components/admin/sections/types";
import type { AdminUserListResponse } from "@/components/admin/users/types";
import { useApiResource } from "@/hooks/use-api-resource";
import { useConfirm } from "@/hooks/use-confirm";

const TEACHER_PAGE_SIZE = 100;

/**
 * Loads teacher assignments plus the option lists the form and filters need,
 * and owns removing an assignment. Assignments are few, so search, filters and
 * sorting all run in the browser.
 */
export function useAssignments() {
  const assignments = useApiResource<AssignmentItem[]>(
    "/api/admin/teacher-assignments",
    "Failed to load teacher assignments."
  );
  const { data: teachersData } = useApiResource<AdminUserListResponse>(
    `/api/admin/users?role=TEACHER&pageSize=${TEACHER_PAGE_SIZE}`
  );
  const { data: sectionsData } = useApiResource<SectionItem[]>("/api/admin/sections");
  const { data: subjectsData } = useApiResource<OptionItem[]>("/api/admin/subjects");
  const { confirm, dialog } = useConfirm();

  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [sort, setSort] = useState<AssignmentSort>("teacher");
  const [busyId, setBusyId] = useState<string | null>(null);

  const teachers = useMemo<TeacherOption[]>(
    () =>
      (teachersData?.data ?? [])
        .filter((user) => user.teacherProfileId)
        .map((user) => ({
          id: user.teacherProfileId as string,
          name: `${user.firstName} ${user.lastName}`.trim(),
          username: user.username,
        })),
    [teachersData]
  );

  const sections = useMemo(() => sectionsData ?? [], [sectionsData]);
  const subjects = useMemo(() => subjectsData ?? [], [subjectsData]);
  const all = useMemo(() => assignments.data ?? [], [assignments.data]);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();

    const filtered = all.filter((item) => {
      if (sectionFilter !== "ALL" && item.sectionId !== sectionFilter) return false;
      if (subjectFilter !== "ALL" && item.subjectId !== subjectFilter) return false;
      if (!needle) return true;
      return (
        item.teacherName.toLowerCase().includes(needle) ||
        item.teacherUsername.toLowerCase().includes(needle) ||
        item.sectionName.toLowerCase().includes(needle) ||
        item.subjectName.toLowerCase().includes(needle)
      );
    });

    const sorted = [ ...filtered ];
    if (sort === "teacher") sorted.sort((a, b) => a.teacherName.localeCompare(b.teacherName));
    if (sort === "section") sorted.sort((a, b) => a.sectionName.localeCompare(b.sectionName));
    if (sort === "subject") sorted.sort((a, b) => a.subjectName.localeCompare(b.subjectName));
    return sorted;
  }, [all, search, sectionFilter, subjectFilter, sort]);

  const hasActiveFilters =
    search.trim() !== "" || sectionFilter !== "ALL" || subjectFilter !== "ALL" || sort !== "teacher";

  const resetFilters = useCallback(() => {
    setSearch("");
    setSectionFilter("ALL");
    setSubjectFilter("ALL");
    setSort("teacher");
  }, []);

  const remove = useCallback(
    async (assignment: AssignmentItem) => {
      const ok = await confirm({
        title: "Remove this assignment?",
        description: `${assignment.teacherName} will no longer handle ${assignment.subjectName} in ${assignment.sectionName}. Tests they already created are kept.`,
        confirmLabel: "Remove assignment",
        destructive: true,
      });
      if (!ok) return;

      setBusyId(assignment.id);
      try {
        const res = await fetch(`/api/admin/teacher-assignments?id=${assignment.id}`, {
          method: "DELETE",
        });
        const body = await res.json().catch(() => null);

        if (!res.ok) {
          toast.error(body?.error ?? "Could not remove the assignment.");
          return;
        }

        toast.success("Assignment removed");
        assignments.reload();
      } finally {
        setBusyId(null);
      }
    },
    [confirm, assignments]
  );

  return {
    assignments: visible,
    totalCount: all.length,
    loading: assignments.loading,
    error: assignments.error,
    reload: assignments.reload,
    teachers,
    sections,
    subjects,
    search,
    setSearch,
    sectionFilter,
    setSectionFilter,
    subjectFilter,
    setSubjectFilter,
    sort,
    setSort,
    hasActiveFilters,
    resetFilters,
    remove,
    busyId,
    dialog,
  };
}
