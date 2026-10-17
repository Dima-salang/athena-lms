"use client";

import React from "react";
import { GraduationCap, Percent, Target, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TeacherAnalyticsResponseDTO } from "@/types";

type Summary = TeacherAnalyticsResponseDTO["summary"];

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  icon: typeof Users;
  tone?: string;
}) {
  return (
    <Card>
      <CardHeader className="space-y-2 p-5 pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardDescription className="text-xs">{label}</CardDescription>
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        </div>
        <CardTitle className={`font-mono text-2xl font-semibold ${tone ?? ""}`}>
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0 text-xs leading-relaxed text-muted-foreground">
        {hint}
      </CardContent>
    </Card>
  );
}

export function AnalyticsSummary({ summary }: { summary: Summary }) {
  const classAverage =
    summary.totalPoints > 0
      ? Math.round((summary.averageRawScore / summary.totalPoints) * 100)
      : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Submissions"
        value={summary.totalSubmissions}
        hint="Students who finished the test"
        icon={Users}
      />
      <KpiCard
        label="Average score"
        value={
          <>
            {summary.averageRawScore}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / {summary.totalPoints}
            </span>
          </>
        }
        hint={classAverage !== null ? `${classAverage}% class average` : "No scores yet"}
        icon={Target}
      />
      <KpiCard
        label="Average converted grade"
        value={summary.averageTransmutedGrade}
        hint="Converted from the raw score"
        icon={GraduationCap}
        tone="text-primary"
      />
      <KpiCard
        label="Passing rate"
        value={`${summary.passingRate}%`}
        hint={`${summary.passingCount ?? 0} passed · ${summary.failingCount ?? 0} did not`}
        icon={Percent}
        tone="text-success"
      />
    </div>
  );
}
