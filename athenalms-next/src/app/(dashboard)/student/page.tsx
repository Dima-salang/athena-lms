"use client";

import { useMemo, useState } from "react";
import { Calendar, CheckCircle2, FileText, Loader2 } from "lucide-react";

import {
  AvailableTestCard,
  CompletedTestCard,
  UpcomingTestCard,
} from "@/components/student/dashboard/TestCards";
import {
  TestFilters,
  type StudentSortKey,
} from "@/components/student/dashboard/TestFilters";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApiResource } from "@/hooks/use-api-resource";
import type { StudentTestItemDTO, StudentTestsResponseDTO, UserDTO } from "@/types";

const EMPTY: StudentTestsResponseDTO = {
  available: [],
  upcoming: [],
  completed: [],
};

const EXAM_TYPES = [
  { value: "QUIZ", label: "Quiz" },
  { value: "LONG_TEST", label: "Long test" },
  { value: "SUMMATIVE", label: "Summative test" },
  { value: "PERIODICAL", label: "Periodical exam" },
];

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center sm:text-right">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-lg font-semibold text-primary">{value}</span>
    </div>
  );
}

function publishedTime(test: StudentTestItemDTO): number {
  const value = test.issueDate || test.createdAt;
  return value ? new Date(value).getTime() : 0;
}

function deadlineTime(test: StudentTestItemDTO): number {
  return test.dueDate ? new Date(test.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
}

function sortByDeadline(list: StudentTestItemDTO[]) {
  return [...list].sort((a, b) => deadlineTime(a) - deadlineTime(b));
}

export default function StudentDashboardPage() {
  const tests = useApiResource<StudentTestsResponseDTO>(
    "/api/student/tests",
    "We couldn't load your tests. Please try again."
  );
  const me = useApiResource<UserDTO>("/api/auth/me", "Failed to load profile");

  const [search, setSearch] = useState("");
  const [examType, setExamType] = useState("ALL");
  const [sort, setSort] = useState<StudentSortKey>("recent");

  const data = tests.data ?? EMPTY;
  const user = me.data;

  const { available, upcoming, completed } = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = (test: StudentTestItemDTO) => {
      if (query && !test.title.toLowerCase().includes(query)) return false;
      if (examType !== "ALL" && test.examType !== examType) return false;
      return true;
    };

    const byPublished = (a: StudentTestItemDTO, b: StudentTestItemDTO) =>
      publishedTime(b) - publishedTime(a);

    const availableList = data.available.filter(matches);
    const upcomingList = data.upcoming.filter(matches);

    return {
      available:
        sort === "deadline"
          ? sortByDeadline(availableList)
          : [...availableList].sort(byPublished),
      upcoming:
        sort === "deadline"
          ? sortByDeadline(upcomingList)
          : [...upcomingList].sort(byPublished),
      completed: data.completed.filter(matches).sort((a, b) => {
        const aTime = a.submission?.submittedAt
          ? new Date(a.submission.submittedAt).getTime()
          : 0;
        const bTime = b.submission?.submittedAt
          ? new Date(b.submission.submittedAt).getTime()
          : 0;
        return bTime - aTime;
      }),
    };
  }, [data, search, examType, sort]);

  const totalCount =
    data.available.length + data.upcoming.length + data.completed.length;
  const resultCount = available.length + upcoming.length + completed.length;

  const resetFilters = () => {
    setSearch("");
    setExamType("ALL");
    setSort("recent");
  };

  if (tests.loading && !tests.data) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
        <span className="text-sm font-medium text-muted-foreground">
          Loading your tests…
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <div className="rounded-xl border bg-card bg-paper p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Welcome back, {user?.firstName ?? "student"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Section{" "}
              <span className="font-medium text-foreground">
                {user?.studentProfile?.sectionName ?? "Unassigned"}
              </span>{" "}
              · LRN{" "}
              <span className="font-mono text-foreground">
                {user?.studentProfile?.lrn ?? "—"}
              </span>
            </p>
          </div>
          <div className="flex items-center justify-around gap-8 sm:justify-end">
            <Metric label="Available" value={data.available.length} />
            <Metric label="Completed" value={data.completed.length} />
          </div>
        </div>
      </div>

      {tests.error ? <Alert variant="error">{tests.error}</Alert> : null}

      <TestFilters
        search={search}
        onSearchChange={setSearch}
        examType={examType}
        onExamTypeChange={setExamType}
        sort={sort}
        onSortChange={setSort}
        examTypes={EXAM_TYPES}
        resultCount={resultCount}
        totalCount={totalCount}
        onReset={resetFilters}
      />

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 sm:w-[480px]">
          <TabsTrigger value="available">Available ({available.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4 pt-2">
          {available.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title={
                totalCount === 0 ? "You're all caught up" : "No matching tests"
              }
              description={
                totalCount === 0
                  ? "No tests are open for your section right now."
                  : "Try a different search term, or reset the filters."
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {available.map((t) => (
                <AvailableTestCard key={t.id} test={t} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4 pt-2">
          {upcoming.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming tests"
              description="Check back later for newly scheduled tests."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((t) => (
                <UpcomingTestCard key={t.id} test={t} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 pt-2">
          {completed.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No completed tests yet"
              description="Your scores will appear here after you submit a test."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completed.map((t) => (
                <CompletedTestCard key={t.id} test={t} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
