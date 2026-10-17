"use client";

import React, { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubmissionFilters } from "@/components/teacher/submissions/SubmissionFilters";
import { SubmissionsTable } from "@/components/teacher/submissions/SubmissionsTable";
import type {
  SubmissionItem,
  SubmissionSortKey,
  SubmissionStatusFilter,
} from "@/components/teacher/submissions/types";
import { useConfirm } from "@/hooks/use-confirm";
import type { TestDTO } from "@/types";

interface SubmissionsPageProps {
  params: Promise<{ id: string }>;
}

export default function SubmissionsPage({ params }: SubmissionsPageProps) {
  const { id: testId } = use(params);

  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [test, setTest] = useState<TestDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SubmissionStatusFilter>("ALL");
  const [section, setSection] = useState("ALL");
  const [sort, setSort] = useState<SubmissionSortKey>("recent");

  const { confirm, dialog } = useConfirm();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [testRes, subRes] = await Promise.all([
        fetch(`/api/teacher/tests/${testId}`),
        fetch(`/api/teacher/tests/${testId}/submissions`),
      ]);

      if (!testRes.ok) throw new Error("Failed to load test details");
      setTest(await testRes.json());

      if (subRes.ok) setSubmissions(await subRes.json());
    } catch {
      toast.error("Could not load submissions");
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatus("ALL");
    setSection("ALL");
    setSort("recent");
  }, []);

  const sectionOptions = useMemo(() => {
    const names = new Set<string>();
    submissions.forEach((sub) => sub.sectionName && names.add(sub.sectionName));
    return Array.from(names).sort();
  }, [submissions]);

  const visibleSubmissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = submissions.filter((sub) => {
      if (
        query &&
        !sub.studentName.toLowerCase().includes(query) &&
        !(sub.studentLrn || "").toLowerCase().includes(query)
      ) {
        return false;
      }
      if (status !== "ALL" && sub.status !== status) return false;
      if (section !== "ALL" && sub.sectionName !== section) return false;
      return true;
    });

    const sorted = [...filtered];
    if (sort === "name") {
      sorted.sort((a, b) => a.studentName.localeCompare(b.studentName));
    } else if (sort === "score") {
      sorted.sort((a, b) => (b.rawScore ?? -1) - (a.rawScore ?? -1));
    } else {
      sorted.sort((a, b) => {
        const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return bTime - aTime;
      });
    }
    return sorted;
  }, [submissions, search, status, section, sort]);

  const handleRecalculateAll = async () => {
    const ok = await confirm({
      title: "Recalculate all scores?",
      description:
        "Every submission will be re-checked against the current answer key and grading scale. Existing scores will be replaced.",
      confirmLabel: "Recalculate",
    });
    if (!ok) return;

    try {
      setRecalculating(true);
      const res = await fetch(`/api/teacher/tests/${testId}/submissions`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to recalculate");
      const result = await res.json();
      toast.success(`Re-checked ${result.recalculatedCount} submission(s)`);
      await loadData();
    } catch {
      toast.error("Could not recalculate the scores");
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <>
      {dialog}
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Button variant="ghost" size="sm" asChild className="-ml-2 h-8">
              <Link href={`/teacher/tests/${testId}/edit`}>
                <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
                Back to test
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-semibold tracking-tight">
                Submissions
              </h1>
              {test?.title ? <Badge variant="outline">{test.title}</Badge> : null}
            </div>
            <p className="text-xs text-muted-foreground">
              {submissions.length} submission{submissions.length === 1 ? "" : "s"} ·{" "}
              {test?.maxScore || 0} points
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={recalculating}
            onClick={handleRecalculateAll}
            className="gap-1.5 self-start"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${recalculating ? "animate-spin" : ""}`}
              aria-hidden
            />
            Recalculate all
          </Button>
        </div>

        <SubmissionFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          section={section}
          onSectionChange={setSection}
          sort={sort}
          onSortChange={setSort}
          sections={sectionOptions}
          resultCount={visibleSubmissions.length}
          totalCount={submissions.length}
          onReset={resetFilters}
        />

        <SubmissionsTable
          submissions={visibleSubmissions}
          loading={loading && !test}
          hasAny={submissions.length > 0}
        />
      </div>
    </>
  );
}
