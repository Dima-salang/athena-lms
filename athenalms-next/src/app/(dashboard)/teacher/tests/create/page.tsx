"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckboxField, FormField, FormSection } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface OptionItem {
  id: string;
  name: string;
}

export default function CreateTestPage() {
  const router = useRouter();
  const [sections, setSections] = useState<OptionItem[]>([]);
  const [subjects, setSubjects] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    examType: "QUIZ",
    subjectId: "",
    selectedSectionIds: [] as string[],
    durationMinutes: 60,
    hasInfiniteTime: false,
    issueDate: "",
    dueDate: "",
    shuffleQuestions: false,
    shuffleOptions: false,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/sections").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/admin/subjects").then((r) => (r.ok ? r.json() : [])),
    ]).then(([secData, subData]) => {
      setSections(secData);
      setSubjects(subData);
    });
  }, []);

  const toggleSection = (sectionId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSectionIds: prev.selectedSectionIds.includes(sectionId)
        ? prev.selectedSectionIds.filter((id) => id !== sectionId)
        : [...prev.selectedSectionIds, sectionId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.selectedSectionIds.length === 0) {
      setError("Choose at least one class section for this test.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/teacher/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          examType: formData.examType,
          subjectId: formData.subjectId || undefined,
          sectionIds: formData.selectedSectionIds,
          durationSeconds: formData.hasInfiniteTime
            ? null
            : formData.durationMinutes * 60,
          hasInfiniteTime: formData.hasInfiniteTime,
          issueDate: formData.issueDate
            ? new Date(formData.issueDate).toISOString()
            : null,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          shuffleQuestions: formData.shuffleQuestions,
          shuffleOptions: formData.shuffleOptions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const message = data.error || "Could not create the test.";
        setError(message);
        toast.error(message);
        setLoading(false);
        return;
      }

      toast.success("Test created", {
        description: "Now add your questions.",
      });
      router.push(`/teacher/tests/${data.id}/edit`);
    } catch {
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link href="/teacher/tests">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <span className="sr-only">Back to tests</span>
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Create test
          </h1>
          <p className="text-sm text-muted-foreground">
            Set up the basics now — you&apos;ll add questions next.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Test details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {error ? <Alert variant="error">{error}</Alert> : null}

            <FormSection title="Basics">
              <FormField label="Title" htmlFor="title">
                <Input
                  id="title"
                  placeholder="e.g. Quarter 1 Summative Test"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Type" htmlFor="examType">
                  <Select
                    value={formData.examType}
                    onValueChange={(val) =>
                      setFormData({ ...formData, examType: val })
                    }
                  >
                    <SelectTrigger id="examType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QUIZ">Quiz</SelectItem>
                      <SelectItem value="LONG_TEST">Long test</SelectItem>
                      <SelectItem value="SUMMATIVE">Summative test</SelectItem>
                      <SelectItem value="PERIODICAL">Periodical exam</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Subject" htmlFor="subject">
                  <Select
                    value={formData.subjectId}
                    onValueChange={(val) =>
                      setFormData({ ...formData, subjectId: val })
                    }
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject…" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField
                label="Instructions"
                htmlFor="description"
                hint="Shown to students on the test start screen."
              >
                <Textarea
                  id="description"
                  placeholder="Allowed materials, reminders, and instructions…"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </FormField>
            </FormSection>

            <FormSection
              title="Schedule"
              description="Leave the dates empty to keep the test open."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Duration (minutes)"
                  htmlFor="duration"
                  hint={formData.hasInfiniteTime ? "Disabled while untimed." : undefined}
                >
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    step="5"
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationMinutes: parseInt(e.target.value) || 30,
                      })
                    }
                    disabled={formData.hasInfiniteTime}
                  />
                </FormField>
                <div className="flex items-end">
                  <CheckboxField
                    id="infinite-time"
                    label="No time limit"
                    description="Students may take as long as they need."
                    checked={formData.hasInfiniteTime}
                    onChange={(checked) =>
                      setFormData({ ...formData, hasInfiniteTime: checked })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Opens on" htmlFor="issueDate" hint="Optional.">
                  <Input
                    id="issueDate"
                    type="datetime-local"
                    value={formData.issueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, issueDate: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Deadline" htmlFor="dueDate" hint="Optional.">
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection
              title="Class sections"
              description="Only students in these sections can take the test."
            >
              {sections.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sections available.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {sections.map((section) => {
                    const isSelected = formData.selectedSectionIds.includes(
                      section.id
                    );
                    return (
                      <button
                        key={section.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleSection(section.id)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-card hover:bg-muted"
                        )}
                      >
                        {section.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </FormSection>

            <FormSection
              title="Randomization"
              description="Reduce answer-sharing between students."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <CheckboxField
                  id="shuffle-questions"
                  label="Shuffle questions"
                  description="Different order per student."
                  checked={formData.shuffleQuestions}
                  onChange={(checked) =>
                    setFormData({ ...formData, shuffleQuestions: checked })
                  }
                />
                <CheckboxField
                  id="shuffle-options"
                  label="Shuffle choices"
                  description="Applies to multiple choice."
                  checked={formData.shuffleOptions}
                  onChange={(checked) =>
                    setFormData({ ...formData, shuffleOptions: checked })
                  }
                />
              </div>
            </FormSection>
          </CardContent>

          <CardFooter className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-between">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/teacher/tests">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 sm:w-auto"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Save &amp; add questions
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
