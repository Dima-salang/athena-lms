"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { TestFilters } from "@/components/teacher/tests/TestFilters";
import { TestsTable } from "@/components/teacher/tests/TestsTable";
import type {
  TeacherTestItem,
  TestSortKey,
  TestStatusFilter,
} from "@/components/teacher/tests/types";
import { useConfirm } from "@/hooks/use-confirm";

const EXAM_TYPES = [
  { value: "QUIZ", label: "Quiz" },
  { value: "LONG_TEST", label: "Long test" },
  { value: "SUMMATIVE", label: "Summative test" },
  { value: "PERIODICAL", label: "Periodical exam" },
];

export default function TeacherTestsPage() {
  const [tests, setTests] = useState<TeacherTestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloningId, setCloningId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TestStatusFilter>("ALL");
  const [examType, setExamType] = useState("ALL");
  const [section, setSection] = useState("ALL");
  const [sort, setSort] = useState<TestSortKey>("recent");

  const { confirm, dialog } = useConfirm();

  const loadTests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/teacher/tests");
      if (!res.ok) throw new Error("Failed to load tests");
      setTests(await res.json());
    } catch {
      toast.error("Could not load your tests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatus("ALL");
    setExamType("ALL");
    setSection("ALL");
    setSort("recent");
  }, []);

  const sectionOptions = useMemo(() => {
    const names = new Set<string>();
    tests.forEach((test) => test.sectionNames.forEach((name) => names.add(name)));
    return Array.from(names).sort();
  }, [tests]);

  const visibleTests = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = tests.filter((test) => {
      if (query && !test.title.toLowerCase().includes(query)) return false;
      if (status === "PUBLISHED" && !test.isPublished) return false;
      if (status === "DRAFT" && test.isPublished) return false;
      if (examType !== "ALL" && test.examType !== examType) return false;
      if (section !== "ALL" && !test.sectionNames.includes(section)) return false;
      return true;
    });

    const sorted = [...filtered];
    if (sort === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "deadline") {
      sorted.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else {
      sorted.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }
    return sorted;
  }, [tests, search, status, examType, section, sort]);

  const handleDuplicate = async (testId: string) => {
    try {
      setCloningId(testId);
      const res = await fetch(`/api/teacher/tests/${testId}/duplicate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Duplicate failed");
      toast.success("Test duplicated", {
        description: "A copy was created as a draft.",
      });
      await loadTests();
    } catch {
      toast.error("Could not duplicate this test");
    } finally {
      setCloningId(null);
    }
  };

  const handleArchive = async (test: TeacherTestItem) => {
    const ok = await confirm({
      title: "Archive this test?",
      description: `"${test.title}" will be removed from your active list. Students will no longer see it.`,
      confirmLabel: "Archive",
      destructive: true,
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/teacher/tests/${test.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Archive failed");
      toast.success("Test archived");
      await loadTests();
    } catch {
      toast.error("Could not archive this test");
    }
  };

  return (
    <>
      {dialog}
      <div className="space-y-8">
        <PageHeader
          title="Tests"
          description="Create tests, review submissions, and check how the class did."
          actions={
            <Button asChild className="gap-2">
              <Link href="/teacher/tests/create">
                <Plus className="h-4 w-4" aria-hidden />
                Create test
              </Link>
            </Button>
          }
        />

        <TestFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          examType={examType}
          onExamTypeChange={setExamType}
          section={section}
          onSectionChange={setSection}
          sort={sort}
          onSortChange={setSort}
          examTypes={EXAM_TYPES}
          sections={sectionOptions}
          resultCount={visibleTests.length}
          totalCount={tests.length}
          onReset={resetFilters}
        />

        <TestsTable
          tests={visibleTests}
          loading={loading}
          cloningId={cloningId}
          hasAnyTests={tests.length > 0}
          onDuplicate={handleDuplicate}
          onArchive={handleArchive}
          onReset={resetFilters}
        />
      </div>
    </>
  );
}
