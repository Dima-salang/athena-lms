"use client";

import React, { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ListChecks,
  Loader2,
  Sparkles,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionEditor } from "@/components/exam/QuestionEditor";
import { AddQuestionBar } from "@/components/teacher/test-editor/AddQuestionBar";
import { TestEditorBar } from "@/components/teacher/test-editor/TestEditorBar";
import { TestSettingsDialog } from "@/components/teacher/test-editor/TestSettingsDialog";
import { useConfirm } from "@/hooks/use-confirm";
import { useTestEditor } from "@/hooks/use-test-editor";
import { toast } from "sonner";

interface EditTestPageProps {
  params: Promise<{ id: string }>;
}

export default function EditTestPage({ params }: EditTestPageProps) {
  const { id } = use(params);
  const {
    loading,
    loadError,
    meta,
    questions,
    sections,
    saveStatus,
    lastSavedAt,
    totalPoints,
    issues,
    updateMeta,
    updateQuestion,
    addQuestion,
    deleteQuestion,
    duplicateQuestion,
    setPublished,
    saveNow,
  } = useTestEditor(id);

  const { confirm, dialog } = useConfirm();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const durationLabel = meta.hasInfiniteTime
    ? "Untimed"
    : `${meta.durationMinutes} min`;

  const dueDateLabel = useMemo(
    () => (meta.dueDate ? new Date(meta.dueDate).toLocaleString() : ""),
    [meta.dueDate]
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg space-y-4 pt-10 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" aria-hidden />
        <h1 className="font-display text-lg font-semibold">Couldn&apos;t open this test</h1>
        <p className="text-sm text-muted-foreground">{loadError}</p>
        <Button asChild variant="outline">
          <Link href="/teacher/tests">
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
            Back to tests
          </Link>
        </Button>
      </div>
    );
  }

  const handleTogglePublish = async () => {
    if (meta.isPublished) {
      const ok = await confirm({
        title: "Unpublish this test?",
        description:
          "Students will no longer see it on their dashboard. Submissions already made are kept.",
        confirmLabel: "Unpublish",
        destructive: true,
      });
      if (!ok) return;

      setPublishing(true);
      const result = await setPublished(false);
      setPublishing(false);
      if (result.ok) toast.success("Test unpublished");
      else toast.error("Could not unpublish", { description: result.issues[0]?.message });
      return;
    }

    const sectionNames = sections
      .filter((s) => meta.sectionIds.includes(s.id))
      .map((s) => s.name)
      .join(", ");

    const ok = await confirm({
      title: "Publish this test?",
      description: sectionNames
        ? `Students in ${sectionNames} will be able to see and take it. You can still edit afterwards.`
        : "Students assigned to this test will be able to see and take it. You can still edit afterwards.",
      confirmLabel: "Publish",
    });
    if (!ok) return;

    setPublishing(true);
    const result = await setPublished(true);
    setPublishing(false);

    if (result.ok) {
      toast.success("Test published", {
        description: "Students can now see it on their dashboard.",
      });
    } else {
      toast.error("Not ready to publish", {
        description: result.issues
          .slice(0, 3)
          .map((issue) => issue.message)
          .join(" · "),
      });
    }
  };

  return (
    <>
      {dialog}
      <div className="mx-auto max-w-5xl">
        <TestEditorBar
          testId={id}
          title={meta.title}
          isPublished={meta.isPublished}
          questionCount={questions.length}
          totalPoints={totalPoints}
          durationLabel={durationLabel}
          dueDateLabel={dueDateLabel}
          saveStatus={saveStatus}
          lastSavedAt={lastSavedAt}
          publishing={publishing}
          onOpenSettings={() => setSettingsOpen(true)}
          onTogglePublish={handleTogglePublish}
          onRetrySave={() => void saveNow()}
        />

        <div className="space-y-6 pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href="/teacher/tests"
              className="inline-flex items-center gap-1 rounded-md hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              All tests
            </Link>
            <span aria-hidden>/</span>
            <span className="truncate">{meta.title || "Untitled test"}</span>
          </div>

          {issues.length > 0 ? (
            <Alert variant="warning" icon={AlertCircle}>
              <div className="space-y-1.5">
                <p className="font-semibold">
                  {meta.isPublished
                    ? "Some questions need attention"
                    : "Finish these before publishing"}
                </p>
                <ul className="ml-4 list-disc space-y-1 font-normal">
                  {issues.slice(0, 6).map((issue, index) => (
                    <li key={index}>
                      {issue.questionIndex !== undefined ? (
                        <button
                          type="button"
                          className="text-left underline-offset-2 hover:underline"
                          onClick={() =>
                            document
                              .getElementById(`question-${issue.questionIndex}`)
                              ?.scrollIntoView({ behavior: "smooth", block: "center" })
                          }
                        >
                          {issue.message}
                        </button>
                      ) : (
                        issue.message
                      )}
                    </li>
                  ))}
                </ul>
                {issues.length > 6 ? (
                  <p className="text-xs font-normal">…and {issues.length - 6} more.</p>
                ) : null}
              </div>
            </Alert>
          ) : (
            <Alert variant="success" icon={Sparkles}>
              <div className="space-y-0.5">
                <p className="font-semibold">Looks good</p>
                <p className="font-normal">
                  Every question has what it needs.{" "}
                  {meta.isPublished
                    ? "Students can see this test."
                    : "Publish when you're ready."}
                </p>
              </div>
            </Alert>
          )}

          <div className="space-y-5">
            {questions.map((question, index) => (
              <div
                key={question.id || `new-${index}`}
                id={`question-${index}`}
                className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
              >
                <QuestionEditor
                  question={{ ...question, questionNumber: index + 1 }}
                  onChange={(updated) => updateQuestion(index, updated)}
                  onDelete={() => deleteQuestion(index)}
                  onDuplicate={() => duplicateQuestion(index)}
                />
              </div>
            ))}
          </div>

          <AddQuestionBar onAdd={addQuestion} />

          <Card className="border-dashed bg-muted/20">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ListChecks className="h-4 w-4" aria-hidden />
                <span>
                  <span className="font-medium text-foreground">{questions.length}</span>{" "}
                  questions ·{" "}
                  <span className="font-medium text-foreground">{totalPoints}</span> total
                  points
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => void saveNow()}>
                Save now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <TestSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        meta={meta}
        sections={sections}
        onUpdateMeta={updateMeta}
      />
    </>
  );
}
