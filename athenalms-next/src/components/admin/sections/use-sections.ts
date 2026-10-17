"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type { SectionItem } from "@/components/admin/sections/types";
import { useApiResource } from "@/hooks/use-api-resource";
import { useConfirm } from "@/hooks/use-confirm";

export type SectionSort = "name" | "students" | "grade";
export type SectionStatusFilter = "ALL" | "active" | "inactive";

export const SECTION_SORT_LABELS: Record<SectionSort, string> = {
  name: "Name (A–Z)",
  students: "Most students",
  grade: "Grade level",
};

export const SECTION_STATUS_LABELS: Record<SectionStatusFilter, string> = {
  ALL: "Any status",
  active: "Active only",
  inactive: "Inactive only",
};

/**
 * Client-side state for the sections list. Sections are few, so search, sort
 * and status filtering all happen in the browser — no request per keystroke.
 */
export function useSections() {
  const { data, loading, error, reload } = useApiResource<SectionItem[]>(
    "/api/admin/sections",
    "Failed to load sections."
  );
  const { confirm, dialog } = useConfirm();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SectionSort>("name");
  const [status, setStatus] = useState<SectionStatusFilter>("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  const all = useMemo(() => data ?? [], [data]);

  const sections = useMemo(() => {
    const needle = search.trim().toLowerCase();

    const filtered = all.filter((section) => {
      if (status === "active" && !section.isActive) return false;
      if (status === "inactive" && section.isActive) return false;
      if (!needle) return true;
      return (
        section.name.toLowerCase().includes(needle) ||
        (section.adviserName ?? "").toLowerCase().includes(needle) ||
        (section.gradeLevel ?? "").toLowerCase().includes(needle)
      );
    });

    const sorted = [ ...filtered ];
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "students") sorted.sort((a, b) => b.studentCount - a.studentCount);
    if (sort === "grade") {
      sorted.sort((a, b) => (a.gradeLevel ?? "").localeCompare(b.gradeLevel ?? ""));
    }
    return sorted;
  }, [all, search, sort, status]);

  const hasActiveFilters =
    search.trim() !== "" || sort !== "name" || status !== "ALL";

  const resetFilters = useCallback(() => {
    setSearch("");
    setSort("name");
    setStatus("ALL");
  }, []);

  const setActive = useCallback(
    async (section: SectionItem, isActive: boolean) => {
      const ok = await confirm({
        title: isActive ? "Activate this section?" : "Deactivate this section?",
        description: isActive
          ? `${section.name} will show up in lists again.`
          : `${section.name} keeps its students and records but is hidden from day-to-day lists. Nothing is deleted.`,
        confirmLabel: isActive ? "Activate" : "Deactivate",
        destructive: !isActive,
      });
      if (!ok) return;

      setBusyId(section.id);
      try {
        const res = await fetch(`/api/admin/sections/${section.id}`, {
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
    [confirm, reload]
  );

  return {
    sections,
    totalCount: all.length,
    loading,
    error,
    reload,
    search,
    setSearch,
    sort,
    setSort,
    status,
    setStatus,
    hasActiveFilters,
    resetFilters,
    setActive,
    busyId,
    dialog,
  };
}
