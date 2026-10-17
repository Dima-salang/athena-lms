"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  FileCheck2,
  Globe,
  Key,
  ListChecks,
  Loader2,
  Lock,
  RotateCcw,
  Settings2,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SaveStatus } from "@/hooks/use-test-editor";

function useRelativeTime(date: Date | null): string {
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 20000);
    return () => clearInterval(id);
  }, []);

  if (!date) return "";
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function SaveIndicator({
  status,
  lastSavedAt,
  onRetry,
}: {
  status: SaveStatus;
  lastSavedAt: Date | null;
  onRetry: () => void;
}) {
  const relative = useRelativeTime(lastSavedAt);

  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warning">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        Saving…
      </span>
    );
  }
  if (status === "unsaved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />
        Unsaved changes
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive">
        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        Save failed
        <button
          type="button"
          onClick={onRetry}
          className="underline underline-offset-2 hover:no-underline"
        >
          Retry
        </button>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      {relative ? `Saved · ${relative}` : "Saved"}
    </span>
  );
}

function Detail({
  icon: Icon,
  children,
}: {
  icon: typeof Clock;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      {children}
    </span>
  );
}

interface TestEditorBarProps {
  testId: string;
  title: string;
  isPublished: boolean;
  questionCount: number;
  totalPoints: number;
  durationLabel: string;
  dueDateLabel: string;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  publishing: boolean;
  onOpenSettings: () => void;
  onTogglePublish: () => void;
  onRetrySave: () => void;
}

/** Sticky bar that follows the teacher while reviewing a test. */
export function TestEditorBar({
  testId,
  title,
  isPublished,
  questionCount,
  totalPoints,
  durationLabel,
  dueDateLabel,
  saveStatus,
  lastSavedAt,
  publishing,
  onOpenSettings,
  onTogglePublish,
  onRetrySave,
}: TestEditorBarProps) {
  return (
    <div className="sticky top-14 z-30 -mx-4 border-b bg-background/95 px-4 py-3 shadow-sm backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-3">
        {/* Row 1: identity + actions */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-display text-base font-semibold tracking-tight sm:text-lg">
                {title || "Untitled test"}
              </h1>
              <Badge variant={isPublished ? "success" : "secondary"}>
                {isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
            <SaveIndicator
              status={saveStatus}
              lastSavedAt={lastSavedAt}
              onRetry={onRetrySave}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={onOpenSettings} className="gap-1.5">
              <Settings2 className="h-4 w-4" aria-hidden />
              Settings
            </Button>
            <Button
              size="sm"
              variant={isPublished ? "outline" : "default"}
              onClick={onTogglePublish}
              disabled={publishing}
              className="gap-1.5"
            >
              {publishing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : isPublished ? (
                <Lock className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Globe className="h-3.5 w-3.5" aria-hidden />
              )}
              {isPublished ? "Unpublish" : "Publish"}
            </Button>
          </div>
        </div>

        {/* Row 2: exam details + secondary links */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Detail icon={ListChecks}>
              <span className="font-medium text-foreground">{questionCount}</span> questions
            </Detail>
            <Detail icon={Target}>
              <span className="font-medium text-foreground">{totalPoints}</span> points
            </Detail>
            <Detail icon={Clock}>{durationLabel}</Detail>
            {dueDateLabel ? <Detail icon={Clock}>Due {dueDateLabel}</Detail> : null}
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild className="h-8 gap-1.5 text-xs">
              <Link href={`/teacher/tests/${testId}/submissions`}>
                <FileCheck2 className="h-3.5 w-3.5" aria-hidden />
                Submissions
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="h-8 gap-1.5 text-xs">
              <Link href={`/teacher/tests/${testId}/analytics`}>
                <BarChart3 className="h-3.5 w-3.5" aria-hidden />
                Analytics
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="h-8 gap-1.5 text-xs">
              <Link href={`/teacher/tests/${testId}/special-access`}>
                <Key className="h-3.5 w-3.5" aria-hidden />
                Special access
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { SaveIndicator };
