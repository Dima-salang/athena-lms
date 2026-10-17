"use client";

import React, { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OverridesTable } from "@/components/teacher/special-access/OverridesTable";
import { SpecialAccessDialog } from "@/components/teacher/special-access/SpecialAccessDialog";
import type {
  CandidateStudent,
  OverrideInput,
  SpecialAccessRecord,
} from "@/components/teacher/special-access/types";
import { useConfirm } from "@/hooks/use-confirm";
import { formatDate } from "@/lib/utils";
import type { TestDTO } from "@/types";

interface SpecialAccessPageProps {
  params: Promise<{ id: string }>;
}

export default function SpecialAccessPage({ params }: SpecialAccessPageProps) {
  const { id: testId } = use(params);

  const [test, setTest] = useState<TestDTO | null>(null);
  const [overrides, setOverrides] = useState<SpecialAccessRecord[]>([]);
  const [candidates, setCandidates] = useState<CandidateStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { confirm, dialog } = useConfirm();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [testRes, accessRes] = await Promise.all([
        fetch(`/api/teacher/tests/${testId}`),
        fetch(`/api/teacher/tests/${testId}/special-access?candidates=true`),
      ]);

      if (!testRes.ok) throw new Error("Failed to load test");
      setTest(await testRes.json());

      if (accessRes.ok) {
        const accessData = await accessRes.json();
        setOverrides(accessData.overrides || []);
        setCandidates(accessData.candidates || []);
      }
    } catch {
      toast.error("Could not load special access settings");
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const existingStudentIds = useMemo(
    () => new Set(overrides.map((o) => o.studentId)),
    [overrides]
  );

  const availableCandidates = useMemo(
    () => candidates.filter((c) => !existingStudentIds.has(c.id)),
    [candidates, existingStudentIds]
  );

  const handleCreateOverride = async (input: OverrideInput): Promise<boolean> => {
    try {
      setSaving(true);
      const res = await fetch(`/api/teacher/tests/${testId}/special-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: input.studentId,
          customDueDate: input.customDueDate
            ? new Date(input.customDueDate).toISOString()
            : null,
          extendedSeconds:
            input.extensionMinutes > 0 ? input.extensionMinutes * 60 : null,
          isUnlocked: input.isUnlocked,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }

      toast.success("Extra access saved");
      await fetchData();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save extra access");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveOverride = async (record: SpecialAccessRecord) => {
    const ok = await confirm({
      title: "Remove this exception?",
      description: `${record.studentName} will go back to the standard deadline and time limit.`,
      confirmLabel: "Remove",
      destructive: true,
    });
    if (!ok) return;

    try {
      const res = await fetch(
        `/api/teacher/tests/${testId}/special-access?id=${record.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to remove");
      toast.success("Exception removed");
      await fetchData();
    } catch {
      toast.error("Could not remove this exception");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden />
        <span className="text-sm text-muted-foreground">Loading exceptions…</span>
      </div>
    );
  }

  return (
    <>
      {dialog}
      <div className="mx-auto max-w-5xl space-y-8 pb-16">
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
                Special access
              </h1>
              {test?.title ? <Badge variant="outline">{test.title}</Badge> : null}
            </div>
            <p className="text-xs text-muted-foreground">
              Standard deadline: {test?.dueDate ? formatDate(test.dueDate) : "None"} ·{" "}
              Standard time:{" "}
              {test?.hasInfiniteTime
                ? "Untimed"
                : `${Math.round((test?.durationSeconds || 0) / 60)} min`}
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="gap-1.5 self-start"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add exception
          </Button>
        </div>

        <OverridesTable overrides={overrides} onRemove={handleRemoveOverride} />
      </div>

      <SpecialAccessDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        candidates={availableCandidates}
        saving={saving}
        onCreate={handleCreateOverride}
      />
    </>
  );
}
