import Link from "next/link";
import {
  Calendar,
  Clock,
  HelpCircle,
  PlayCircle,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn, formatDate, formatExamType } from "@/lib/utils";
import type { StudentTestItemDTO } from "@/types";

function Meta({
  icon: Icon,
  label,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  tone?: "warning";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        tone === "warning" && "font-medium text-warning"
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

function durationLabel(test: StudentTestItemDTO): string {
  if (test.hasInfiniteTime) return "No time limit";
  return `${Math.round((test.durationSeconds || 0) / 60)} minutes`;
}

/** A test the student can take (or resume) right now. */
export function AvailableTestCard({ test }: { test: StudentTestItemDTO }) {
  const inProgress = test.submission?.status === "IN_PROGRESS";

  return (
    <Card className="flex flex-col border-t-4 border-t-primary shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <Badge variant="outline">{formatExamType(test.examType)}</Badge>
          {test.subjectCode ? (
            <Badge variant="secondary">{test.subjectCode}</Badge>
          ) : null}
        </div>
        <CardTitle className="line-clamp-1 text-base">{test.title}</CardTitle>
        {test.description ? (
          <CardDescription className="line-clamp-2">
            {test.description}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="flex-1 space-y-2 pb-4 text-xs text-muted-foreground">
        <Meta icon={Clock} label={durationLabel(test)} />
        <Meta icon={HelpCircle} label={`${test.questionCount} questions`} />
        {test.dueDate ? (
          <Meta
            icon={Calendar}
            label={`Due ${formatDate(test.dueDate)}`}
            tone="warning"
          />
        ) : null}
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild className="w-full">
          <Link href={`/student/test/${test.id}`}>
            <PlayCircle className="h-4 w-4" />
            {inProgress ? "Resume test" : "Start test"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

/** A test that is scheduled but not yet open. */
export function UpcomingTestCard({ test }: { test: StudentTestItemDTO }) {
  return (
    <Card className="flex flex-col shadow-sm">
      <CardHeader className="pb-3">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <Badge variant="outline">{formatExamType(test.examType)}</Badge>
          <StatusBadge status="upcoming" />
        </div>
        <CardTitle className="line-clamp-1 text-base">{test.title}</CardTitle>
        {test.subjectName ? (
          <CardDescription className="line-clamp-1">
            {test.subjectName}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="flex-1 space-y-2 pb-4 text-xs text-muted-foreground">
        <Meta icon={Clock} label={durationLabel(test)} />
        {test.issueDate ? (
          <Meta
            icon={Calendar}
            label={`Opens ${formatDate(test.issueDate)}`}
          />
        ) : null}
      </CardContent>

      <CardFooter className="pt-0">
        <Button disabled variant="outline" className="w-full">
          Not open yet
        </Button>
      </CardFooter>
    </Card>
  );
}

/** A test the student has already submitted. */
export function CompletedTestCard({ test }: { test: StudentTestItemDTO }) {
  const grade = test.submission?.transmutedGrade ?? null;
  const isPassing = (grade ?? 0) >= 75;

  return (
    <Card className="flex flex-col shadow-sm">
      <CardHeader className="pb-3">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <Badge variant="outline">{formatExamType(test.examType)}</Badge>
          <StatusBadge status={isPassing ? "passed" : "needs-improvement"} />
        </div>
        <CardTitle className="line-clamp-1 text-base">{test.title}</CardTitle>
        {test.subjectName ? (
          <CardDescription className="line-clamp-1">
            {test.subjectName}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pb-4">
        <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
          <div>
            <span className="block text-xs text-muted-foreground">
              Raw score
            </span>
            <span className="font-mono text-sm font-semibold">
              {test.submission?.rawScore ?? "—"}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-xs text-muted-foreground">Grade</span>
            <span
              className={cn(
                "font-mono text-lg font-bold",
                isPassing ? "text-success" : "text-destructive"
              )}
            >
              {grade ?? "Pending"}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Submitted{" "}
          {test.submission?.submittedAt
            ? formatDate(test.submission.submittedAt)
            : "—"}
        </p>
      </CardContent>

      {test.submission?.id ? (
        <CardFooter className="pt-0">
          <Button asChild variant="outline" className="w-full">
            <Link href={`/student/submissions/${test.submission.id}`}>
              View results
            </Link>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
