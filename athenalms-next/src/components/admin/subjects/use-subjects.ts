"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type { SubjectItem } from "@/components/admin/subjects/types";
import { useApiResource } from "@/hooks/use-api-resource";
import { useConfirm } from "@/hooks/use-confirm";

export type SubjectSort = "name" | "code";
export type SubjectStatusFilter = "ALL" | "active" | "inactive";

export const SUBJECT_SORT_LABELS: Record<SubjectSort, string> = {
  name: "Name (A–Z)",
  code: "Code (A–Z)",
};

export const SUBJECT_STATUS_LABELS: Record<SubjectStatusFilter, string> = {
  ALL: "Any status",
  active: "Active only",
  inactive: "Inactive only",
};

/**
 * Client-side state for the subjects list: search, sort and status filtering,
 * plus switching a subject on or off.
 */
export function useSubjects() {
  const { data, loading, error, reload } = useApiResource<SubjectItem[]>(
    "/api/admin/subjects",
    "Failed to load subjects."
  );
  const { confirm, dialog } = useConfirm();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SubjectSort>("name");
  const [status, setStatus] = useState<SubjectStatusFilter>("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  const all = useMemo(() => data ?? [], [data]);

  const subjects = useMemo(() => {
    const needle = search.trim().toLowerCase();

    const filtered = all.filter((subject) => {
      if (status === "active" && !subject.isActive) return false;
      if (status === "inactive" && subject.isActive) return false;
      if (!needle) return true;
      return (
        subject.name.toLowerCase().includes(needle) ||
        (subject.code ?? "").toLowerCase().includes(needle)
      );
    });

    const sorted = [ ...filtered ];
    if (sort === "code") sorted.sort((a, b) => (a.code ?? "").localeCompare(b.code ?? ""));
    else sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [all, search, sort, status]);

  const hasActiveFilters = search.trim() !== "" || sort !== "name" || status !== "ALL";

  const resetFilters = useCallback(() => {
    setSearch("");
    setSort("name");
    setStatus("ALL");
  }, []);

  const setActive = useCallback(
    async (subject: SubjectItem, isActive: boolean) => {
      const ok = await confirm({
        title: isActive ? "Activate this subject?" : "Deactivate this subject?",
        description: isActive
          ? `${subject.name} will be available again when assigning teachers.`
          : `${subject.name} stays on record but will not be offered in new assignments.`,
        confirmLabel: isActive ? "Activate" : "Deactivate",
        destructive: !isActive,
      });
      if (!ok) return;

      setBusyId(subject.id);
      try {
        const res = await fetch(`/api/admin/subjects/${subject.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        });
        const body = await res.json().catch(() => null);

        if (!res.ok) {
          toast.error(body?.error ?? "Could not update the subject.");
          return;
        }

        toast.success(isActive ? "Subject activated" : "Subject deactivated");
        reload();
      } finally {
        setBusyId(null);
      }
    },
    [confirm, reload]
  );

  return {
    subjects,
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
