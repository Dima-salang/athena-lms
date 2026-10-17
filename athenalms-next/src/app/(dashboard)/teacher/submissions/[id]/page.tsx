"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { AnswerReview } from "@/components/exam/AnswerReview";
import { StatusBadge } from "@/components/ui/status-badge";
import { elapsedSeconds, formatDate, formatDuration, formatQuestionType } from "@/lib/utils";
import type { SubmissionDTO, QuestionDTO, StudentAnswerDTO } from "@/types";

interface SubmissionGradingPageProps {
  params: Promise<{ id: string }>;
}

export default function SubmissionGradingPage({ params }: SubmissionGradingPageProps) {
  const { id: submissionId } = use(params);

  const [submission, setSubmission] = useState<SubmissionDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editable scores and comments per question
  const [grades, setGrades] = useState<
    Record<string, { points: number; teacherComment: string }>
  >({});
  const [teacherNotes, setTeacherNotes] = useState("");

  useEffect(() => {
    async function loadSubmission() {
      try {
        setLoading(true);
        const res = await fetch(`/api/teacher/submissions/${submissionId}`);
        if (!res.ok) throw new Error("Failed to load submission");

        const data = await res.json();
        setSubmission(data);
        setTeacherNotes(data.teacherNotes || "");

        // Initialize grade mapping from studentAnswers
        const initialGrades: Record<string, { points: number; teacherComment: string }> = {};
        for (const ans of data.studentAnswers || []) {
          initialGrades[ans.questionId] = {
            points: ans.points ?? 0,
            teacherComment: ans.teacherComment || "",
          };
        }
        setGrades(initialGrades);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load submission data");
      } finally {
        setLoading(false);
      }
    }

    loadSubmission();
  }, [submissionId]);

  const handlePointChange = (questionId: string, points: number) => {
    setGrades((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        points,
      },
    }));
  };

  const handleCommentChange = (questionId: string, teacherComment: string) => {
    setGrades((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        teacherComment,
      },
    }));
  };

  const handleSaveGrades = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const answerOverrides = Object.entries(grades).map(([qId, val]) => ({
        questionId: qId,
        points: val.points,
        teacherComment: val.teacherComment,
      }));

      const res = await fetch(`/api/teacher/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answerOverrides,
          teacherNotes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update grades");
      }

      const updated = await res.json();
      setSubmission(updated);
      setSuccess("Grades saved.");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving grades");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !submission) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground font-medium">Loading submission...</span>
      </div>
    );
  }

  const { test, student, studentAnswers } = submission;
  const questions = test?.questions || [];

  // Compute live raw score total
  const currentTotalRaw = Object.values(grades).reduce(
    (sum, item) => sum + (Number(item.points) || 0),
    0
  );
  const maxScore = test?.maxScore || questions.reduce((s: number, q: QuestionDTO) => s + q.fullPoints, 0);

  // Time actually spent: submittedAt − startTime. (endTime is the deadline, not
  // the finish time, and is absent entirely for untimed tests.)
  const durationSeconds = elapsedSeconds(
    submission.startTime,
    submission.submittedAt
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/teacher/tests/${test?.id || submission.testId}/submissions`}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Submissions
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-semibold tracking-tight">Grade submission</h1>
              <Badge variant="outline">{test?.title || submission.testTitle}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Student: {student?.firstName ? `${student.firstName} ${student.lastName}` : submission.studentName} (LRN: {student?.studentProfile?.lrn || submission.studentLrn || "—"}) • {submission.sectionName || student?.studentProfile?.sectionName || "—"}
            </p>
          </div>
        </div>

        <Button onClick={handleSaveGrades} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save grades
        </Button>
      </div>

      {/* Notifications */}
      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">Raw Score</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono">
              {currentTotalRaw} <span className="text-sm font-normal text-muted-foreground">/ {maxScore}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            {maxScore > 0 ? `${Math.round((currentTotalRaw / maxScore) * 100)}% raw performance` : "—"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">Converted grade</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono text-primary">
              {submission.transmutedGrade ?? "Pending"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <StatusBadge
              status={
                (submission.transmutedGrade || 0) >= 75
                  ? "passed"
                  : "needs-improvement"
              }
              label={
                (submission.transmutedGrade || 0) >= 75
                  ? "Passed (≥75)"
                  : "Below passing"
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">Time Elapsed</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono">
              {durationSeconds === null ? "—" : formatDuration(durationSeconds)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Submitted {submission.submittedAt ? formatDate(submission.submittedAt) : "Not finished"}
          </CardContent>
        </Card>
      </div>

      {/* Question Details Stack */}
      <div className="space-y-6">
        <h2 className="font-display text-lg font-semibold tracking-tight">Question review</h2>

        {questions.map((q: QuestionDTO, idx: number) => {
          const ans = studentAnswers?.find((a: StudentAnswerDTO) => a.questionId === q.id);
          const currentGrade = grades[q.id || ""] || { points: ans?.points ?? 0, teacherComment: "" };

          return (
            <Card key={q.id || idx} className="overflow-hidden border-l-4 border-l-primary/60">
              <CardHeader className="p-5 bg-muted/30 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Question {q.questionNumber || idx + 1}</span>
                    <Badge variant="outline" className="text-xs">
                      {formatQuestionType(q.questionType)}
                    </Badge>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Max: {q.fullPoints} point{q.fullPoints > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-sm font-medium pt-2 text-foreground">{q.questionText}</p>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <AnswerReview question={q} answer={ans} />

                {/* Teacher Grade & Feedback Input Box */}
                <div className="border-t pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium">Points awarded:</Label>
                    <Input
                      type="number"
                      min="0"
                      max={q.fullPoints}
                      step="0.5"
                      value={currentGrade.points}
                      onChange={(e) =>
                        handlePointChange(q.id || "", Math.max(0, Math.min(q.fullPoints, parseFloat(e.target.value) || 0)))
                      }
                      className="w-24 h-8 text-center text-xs font-semibold"
                    />
                    <span className="text-xs text-muted-foreground">/ {q.fullPoints} pts</span>
                  </div>

                  <div className="w-full sm:w-1/2">
                    <Input
                      placeholder="Feedback or comment for this question (optional)..."
                      value={currentGrade.teacherComment}
                      onChange={(e) => handleCommentChange(q.id || "", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* General Submission Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Overall feedback</CardTitle>
          <CardDescription>
            These remarks are shown to the student with their results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Write overall remarks for the student…"
            value={teacherNotes}
            onChange={(e) => setTeacherNotes(e.target.value)}
            className="min-h-[90px] text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );
}
