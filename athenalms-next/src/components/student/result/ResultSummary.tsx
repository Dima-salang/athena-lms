import { MessageSquare } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { formatDuration } from "@/lib/utils";

interface ResultSummaryProps {
  rawScore: number;
  totalPoints: number;
  rawPercentage: number;
  transmutedGrade: number | null | undefined;
  isPassing: boolean;
  durationSeconds: number;
  status: string;
  descriptor: string;
  teacherNotes?: string | null;
}

export function ResultSummary({
  rawScore,
  totalPoints,
  rawPercentage,
  transmutedGrade,
  isPassing,
  durationSeconds,
  status,
  descriptor,
  teacherNotes,
}: ResultSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Raw score"
          value={
            <span className="font-mono">
              {rawScore}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {totalPoints}
              </span>
            </span>
          }
          hint={`${rawPercentage}% of total points`}
          tone="muted"
        />
        <StatCard
          label="Converted grade"
          value={
            <span
              className={isPassing ? "text-success" : "text-destructive"}
            >
              {transmutedGrade ?? "Pending"}
            </span>
          }
          hint={descriptor}
          tone={isPassing ? "success" : "warning"}
        />
        <StatCard
          label="Time spent"
          value={<span className="font-mono">{formatDuration(durationSeconds)}</span>}
          hint={`Status: ${status}`}
          tone="muted"
        />
      </div>

      {teacherNotes ? (
        <Card className="border-gold/30 bg-gold/5">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gold" aria-hidden />
              <CardTitle className="text-sm font-semibold text-foreground">
                Teacher remarks
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap p-4 pt-1 text-sm leading-relaxed text-foreground">
            {teacherNotes}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
