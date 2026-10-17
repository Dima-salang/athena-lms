"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import type {
  EditorOption,
  EditorQuestion,
} from "@/components/exam/QuestionEditor";
import type {
  ExamType,
  QuestionDTO,
  QuestionType,
  TestDTO,
  TestSectionDTO,
} from "@/types";

const SAVE_DEBOUNCE_MS = 800;

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export interface TestMeta {
  title: string;
  description: string;
  examType: ExamType;
  durationMinutes: number;
  hasInfiniteTime: boolean;
  isPublished: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  /** `datetime-local` value, e.g. `2026-01-01T08:00`. */
  issueDate: string;
  dueDate: string;
  sectionIds: string[];
}

export interface ValidationIssue {
  message: string;
  questionIndex?: number;
}

export interface SectionOption {
  id: string;
  name: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function toEditorQuestion(q: QuestionDTO): EditorQuestion {
  return {
    id: q.id,
    questionNumber: q.questionNumber,
    questionText: q.questionText,
    questionType: q.questionType,
    fullPoints: q.fullPoints,
    correctAnswer: q.correctAnswer,
    alternativeAnswers: q.alternativeAnswers,
    correctOptionId: q.correctOptionId,
    rubric: q.rubric,
    orderIndex: q.orderIndex,
    options: q.options || [],
    answeredByStudents: q.answeredByStudents,
  };
}

function newQuestionOptions(type: QuestionType): EditorOption[] {
  if (type === "MULTIPLE_CHOICE") {
    return [
      { optionText: "", orderIndex: 0 },
      { optionText: "", orderIndex: 1 },
      { optionText: "", orderIndex: 2 },
      { optionText: "", orderIndex: 3 },
    ];
  }
  if (type === "MATCHING") {
    return [
      { optionText: "", matchText: "", orderIndex: 0 },
      { optionText: "", matchText: "", orderIndex: 1 },
    ];
  }
  return [];
}

function toDateTimeLocal(value?: string | null): string {
  return value ? value.substring(0, 16) : "";
}

/** Keep local edits, adopt freshly assigned server ids (never overwrite text). */
function mergeServerIds(
  local: EditorQuestion[],
  server: QuestionDTO[]
): EditorQuestion[] {
  return local.map((question, i) => {
    const saved = server[i];
    if (!saved) return question;
    return {
      ...question,
      id: question.id ?? saved.id,
      options: question.options.map((option, j) => ({
        ...option,
        id: option.id ?? saved.options?.[j]?.id,
      })),
    };
  });
}

export function collectValidationIssues(
  meta: TestMeta,
  questions: EditorQuestion[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!meta.title.trim()) issues.push({ message: "Give the test a title." });
  if (meta.sectionIds.length === 0) {
    issues.push({ message: "Assign the test to at least one class section." });
  }
  if (questions.length === 0) {
    issues.push({ message: "Add at least one question." });
  }

  questions.forEach((q, i) => {
    const label = `Question ${i + 1}`;
    if (!q.questionText.trim()) {
      issues.push({ message: `${label}: write the question prompt.`, questionIndex: i });
    }
    if (!(q.fullPoints > 0)) {
      issues.push({ message: `${label}: points must be greater than 0.`, questionIndex: i });
    }

    if (q.questionType === "MULTIPLE_CHOICE") {
      if (q.options.length < 2) {
        issues.push({ message: `${label}: needs at least 2 choices.`, questionIndex: i });
      }
      if (q.options.some((o) => !o.optionText.trim())) {
        issues.push({ message: `${label}: fill in every choice.`, questionIndex: i });
      }
      const hasCorrect =
        Boolean(q.correctOptionId) ||
        (q.correctAnswer !== undefined &&
          q.correctAnswer !== null &&
          q.correctAnswer !== "");
      if (!hasCorrect) {
        issues.push({ message: `${label}: mark the correct choice.`, questionIndex: i });
      }
    }

    if (q.questionType === "TRUE_FALSE" && !q.correctAnswer) {
      issues.push({ message: `${label}: pick True or False.`, questionIndex: i });
    }

    if (
      (q.questionType === "IDENTIFICATION" || q.questionType === "ACRONYM") &&
      !q.correctAnswer?.trim()
    ) {
      issues.push({ message: `${label}: add the correct answer.`, questionIndex: i });
    }

    if (q.questionType === "MATCHING") {
      if (q.options.length < 2) {
        issues.push({ message: `${label}: needs at least 2 pairs.`, questionIndex: i });
      }
      if (q.options.some((o) => !o.optionText.trim() || !o.matchText?.trim())) {
        issues.push({ message: `${label}: fill in both columns of every pair.`, questionIndex: i });
      }
    }
  });

  return issues;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_META: TestMeta = {
  title: "",
  description: "",
  examType: "QUIZ",
  durationMinutes: 60,
  hasInfiniteTime: false,
  isPublished: false,
  shuffleQuestions: false,
  shuffleOptions: false,
  issueDate: "",
  dueDate: "",
  sectionIds: [],
};

export function useTestEditor(testId: string) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [meta, setMeta] = useState<TestMeta>(DEFAULT_META);
  const [questions, setQuestions] = useState<EditorQuestion[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const metaRef = useRef(meta);
  const questionsRef = useRef(questions);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedRef = useRef(false);

  metaRef.current = meta;
  questionsRef.current = questions;

  // Initial load
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const [testRes, sectionRes] = await Promise.all([
          fetch(`/api/teacher/tests/${testId}`),
          fetch("/api/admin/sections"),
        ]);

        if (!testRes.ok) throw new Error("Could not load this test");
        const test = (await testRes.json()) as TestDTO;
        const sectionData = sectionRes.ok ? await sectionRes.json() : [];
        if (!mounted) return;

        setMeta({
          title: test.title || "",
          description: test.description || "",
          examType: (test.examType as ExamType) || "QUIZ",
          durationMinutes: test.durationSeconds
            ? Math.round(test.durationSeconds / 60)
            : 60,
          hasInfiniteTime: test.hasInfiniteTime || false,
          isPublished: test.isPublished || false,
          shuffleQuestions: test.shuffleQuestions || false,
          shuffleOptions: test.shuffleOptions || false,
          issueDate: toDateTimeLocal(test.issueDate),
          dueDate: toDateTimeLocal(test.dueDate),
          sectionIds: test.sections?.map((s: TestSectionDTO) => s.sectionId) || [],
        });

        setQuestions(
          test.questions && test.questions.length > 0
            ? test.questions.map(toEditorQuestion)
            : [
                {
                  questionNumber: 1,
                  questionText: "",
                  questionType: "MULTIPLE_CHOICE",
                  fullPoints: 1,
                  orderIndex: 0,
                  options: newQuestionOptions("MULTIPLE_CHOICE"),
                },
              ]
        );

        setSections(sectionData);
        setLastSavedAt(new Date());
        setSaveStatus("saved");
      } catch (err) {
        if (mounted) {
          setLoadError(err instanceof Error ? err.message : "Could not load this test");
        }
      } finally {
        if (mounted) {
          hydratedRef.current = true;
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [testId]);

  const flush = useCallback(async () => {
    if (!hydratedRef.current) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setSaveStatus("saving");
    try {
      const current = metaRef.current;
      const res = await fetch(`/api/teacher/tests/${testId}/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            title: current.title,
            description: current.description,
            examType: current.examType,
            durationSeconds: current.hasInfiniteTime
              ? null
              : current.durationMinutes * 60,
            hasInfiniteTime: current.hasInfiniteTime,
            shuffleQuestions: current.shuffleQuestions,
            shuffleOptions: current.shuffleOptions,
            issueDate: current.issueDate
              ? new Date(current.issueDate).toISOString()
              : null,
            dueDate: current.dueDate
              ? new Date(current.dueDate).toISOString()
              : null,
            sectionIds: current.sectionIds,
          },
          questions: questionsRef.current,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Autosave failed");
      }
      const data = await res.json();
      setQuestions((prev) => mergeServerIds(prev, data.questions || []));
      setLastSavedAt(new Date());
      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("error");
      // Stable id: a retry replaces the same toast instead of stacking up.
      toast.error("Couldn't save your changes", {
        id: "test-editor-save-error",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }, [testId]);

  const scheduleSave = useCallback(() => {
    if (!hydratedRef.current) return;
    setSaveStatus("unsaved");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void flush();
    }, SAVE_DEBOUNCE_MS);
  }, [flush]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const updateMeta = useCallback(
    (patch: Partial<TestMeta>) => {
      setMeta((prev) => ({ ...prev, ...patch }));
      scheduleSave();
    },
    [scheduleSave]
  );

  const updateQuestion = useCallback(
    (index: number, updated: EditorQuestion) => {
      setQuestions((prev) => prev.map((q, i) => (i === index ? updated : q)));
      scheduleSave();
    },
    [scheduleSave]
  );

  const addQuestion = useCallback(
    (type: QuestionType = "MULTIPLE_CHOICE") => {
      setQuestions((prev) => {
        const nextNumber = prev.length + 1;
        return [
          ...prev,
          {
            questionNumber: nextNumber,
            questionText: "",
            questionType: type,
            fullPoints: type === "ESSAY" ? 5 : 1,
            orderIndex: nextNumber - 1,
            options: newQuestionOptions(type),
          },
        ];
      });
      scheduleSave();
    },
    [scheduleSave]
  );

  const deleteQuestion = useCallback(
    (index: number) => {
      // Leave answered questions alone: the save would be refused and the editor
      // would be showing a question the database still has.
      const target = questionsRef.current[index];
      if (target?.answeredByStudents) {
        toast.error("You can't delete this question", {
          description: `A student has already answered Question ${target.questionNumber}.`,
        });
        return;
      }

      setQuestions((prev) => {
        if (prev.length <= 1) return prev;
        return prev
          .filter((_, i) => i !== index)
          .map((q, i) => ({ ...q, questionNumber: i + 1, orderIndex: i }));
      });
      scheduleSave();
    },
    [scheduleSave]
  );

  const duplicateQuestion = useCallback(
    (index: number) => {
      setQuestions((prev) => {
        const source = prev[index];
        if (!source) return prev;
        const nextNumber = prev.length + 1;
        const clone: EditorQuestion = {
          ...source,
          id: undefined,
          answeredByStudents: false, // the copy is new, so nothing answers it yet
          questionNumber: nextNumber,
          orderIndex: nextNumber - 1,
          options: source.options.map((option, i) => ({
            optionText: option.optionText,
            matchText: option.matchText,
            orderIndex: i,
          })),
        };
        return [...prev, clone];
      });
      scheduleSave();
    },
    [scheduleSave]
  );

  const setPublished = useCallback(
    async (next: boolean): Promise<{ ok: boolean; issues: ValidationIssue[] }> => {
      if (next) {
        const issues = collectValidationIssues(metaRef.current, questionsRef.current);
        if (issues.length > 0) return { ok: false, issues };
      }

      await flush();
      const previous = metaRef.current.isPublished;
      setMeta((m) => ({ ...m, isPublished: next }));

      try {
        const res = await fetch(`/api/teacher/tests/${testId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: next }),
        });
        if (!res.ok) throw new Error("publish failed");
        return { ok: true, issues: [] };
      } catch {
        setMeta((m) => ({ ...m, isPublished: previous }));
        return {
          ok: false,
          issues: [{ message: "Could not update the publish state. Try again." }],
        };
      }
    },
    [flush, testId]
  );

  const totalPoints = useMemo(
    () => questions.reduce((sum, q) => sum + (q.fullPoints || 0), 0),
    [questions]
  );

  const issues = useMemo(
    () => collectValidationIssues(meta, questions),
    [meta, questions]
  );

  return {
    loading,
    loadError,
    meta,
    questions,
    sections,
    saveStatus,
    lastSavedAt,
    totalPoints,
    issues,
    isPublishable: issues.length === 0,
    updateMeta,
    updateQuestion,
    addQuestion,
    deleteQuestion,
    duplicateQuestion,
    setPublished,
    saveNow: flush,
  };
}
