"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreDistributionChart } from "@/components/analytics/ScoreDistributionChart";
import { AnalyticsSummary } from "@/components/teacher/analytics/AnalyticsSummary";
import { GradebookTable } from "@/components/teacher/analytics/GradebookTable";
import { ItemAnalysisTable } from "@/components/analytics/ItemAnalysisTable";
import { useApiResource } from "@/hooks/use-api-resource";
import { downloadResponse } from "@/lib/download";
import type { TeacherAnalyticsResponseDTO } from "@/types";

interface AnalyticsPageProps {
  params: Promise<{ id: string }>;
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { id: testId } = use(params);
  const { data, loading, error } = useApiResource<TeacherAnalyticsResponseDTO>(
    `/api/teacher/tests/${testId}/analytics`,
    "Could not load results for this test"
  );
  const [exportingGradebook, setExportingGradebook] = useState(false);
  const [exportingItems, setExportingItems] = useState(false);

  const handleExportGradebook = async () => {
    try {
      setExportingGradebook(true);
      const res = await fetch(`/api/teacher/tests/${testId}/export`);
      if (!res.ok) throw new Error("Export failed");
      await downloadResponse(res, `Gradebook_${testId}.xlsx`);
      toast.success("Gradebook exported");
    } catch {
      toast.error("Could not export the gradebook");
    } finally {
      setExportingGradebook(false);
    }
  };

  const handleExportItems = async () => {
    try {
      setExportingItems(true);
      const res = await fetch(`/api/teacher/tests/${testId}/analytics/export`);
      if (!res.ok) throw new Error("Export failed");
      await downloadResponse(res, `ItemAnalysis_${testId}.xlsx`);
      toast.success("Item analysis exported");
    } catch {
      toast.error("Could not export the item analysis");
    } finally {
      setExportingItems(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden />
        <span className="text-sm text-muted-foreground">Working out the results…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/teacher/tests/${testId}/edit`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
            Back to test
          </Link>
        </Button>
        <Alert variant="error">
          {error || "Could not retrieve results for this test."}
        </Alert>
      </div>
    );
  }

  const sectionNames =
    data.test.sections
      ?.map((s) => s.section?.name)
      .filter(Boolean)
      .join(", ") || "—";

  return (
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
              Results &amp; analytics
            </h1>
            <Badge variant="outline">{data.test.title}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {sectionNames} · {data.summary.totalPoints} points ·{" "}
            {data.summary.totalSubmissions} submission
            {data.summary.totalSubmissions === 1 ? "" : "s"}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleExportGradebook}
          disabled={exportingGradebook}
          className="gap-1.5 self-start"
        >
          {exportingGradebook ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Download className="h-4 w-4" aria-hidden />
          )}
          Export gradebook
        </Button>
      </div>

      <AnalyticsSummary summary={data.summary} />

      <Tabs defaultValue="gradebook" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 sm:w-[460px]">
          <TabsTrigger value="gradebook" className="text-xs">
            Gradebook
          </TabsTrigger>
          <TabsTrigger value="item-analysis" className="text-xs">
            Item analysis
          </TabsTrigger>
          <TabsTrigger value="distribution" className="text-xs">
            Score spread
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gradebook" className="pt-2">
          <GradebookTable rows={data.gradebook || []} />
        </TabsContent>

        <TabsContent value="item-analysis" className="pt-2">
          <ItemAnalysisTable
            items={data.itemAnalysis || []}
            onExport={handleExportItems}
            exporting={exportingItems}
          />
        </TabsContent>

        <TabsContent value="distribution" className="pt-2">
          <ScoreDistributionChart data={data.scoreDistribution || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
