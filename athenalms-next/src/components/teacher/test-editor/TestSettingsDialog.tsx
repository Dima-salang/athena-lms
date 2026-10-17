"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckboxField, FormField, FormSection } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";
import type { ExamType } from "@/types";
import type { SectionOption, TestMeta } from "@/hooks/use-test-editor";

interface TestSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meta: TestMeta;
  sections: SectionOption[];
  onUpdateMeta: (patch: Partial<TestMeta>) => void;
}

export function TestSettingsDialog({
  open,
  onOpenChange,
  meta,
  sections,
  onUpdateMeta,
}: TestSettingsDialogProps) {
  const toggleSection = (sectionId: string) => {
    const next = meta.sectionIds.includes(sectionId)
      ? meta.sectionIds.filter((id) => id !== sectionId)
      : [...meta.sectionIds, sectionId];
    onUpdateMeta({ sectionIds: next });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test settings</DialogTitle>
          <DialogDescription>
            Schedule, time limit, and distribution. Changes save automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <FormSection title="Basics">
            <FormField label="Title" htmlFor="test-title">
              <Input
                id="test-title"
                value={meta.title}
                onChange={(e) => onUpdateMeta({ title: e.target.value })}
                placeholder="e.g. Quarter 1 Summative Test"
              />
            </FormField>

            <FormField
              label="Description / instructions"
              htmlFor="test-description"
              hint="Shown to students before they begin."
            >
              <Textarea
                id="test-description"
                value={meta.description}
                onChange={(e) => onUpdateMeta({ description: e.target.value })}
                placeholder="Allowed materials, reminders, and instructions…"
                rows={3}
              />
            </FormField>

            <FormField label="Type" htmlFor="test-exam-type">
              <Select
                value={meta.examType}
                onValueChange={(val) => onUpdateMeta({ examType: val as ExamType })}
              >
                <SelectTrigger id="test-exam-type">
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
          </FormSection>

          <FormSection title="Schedule">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Duration (minutes)"
                htmlFor="test-duration"
                hint={meta.hasInfiniteTime ? "Disabled while untimed." : undefined}
              >
                <Input
                  id="test-duration"
                  type="number"
                  min={1}
                  disabled={meta.hasInfiniteTime}
                  value={meta.durationMinutes}
                  onChange={(e) =>
                    onUpdateMeta({ durationMinutes: parseInt(e.target.value) || 0 })
                  }
                />
              </FormField>

              <div className="flex items-end">
                <CheckboxField
                  id="test-infinite"
                  label="No time limit"
                  description="Students may take as long as they need."
                  checked={meta.hasInfiniteTime}
                  onChange={(checked) => onUpdateMeta({ hasInfiniteTime: checked })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Opens on"
                htmlFor="test-issue"
                hint="Optional — hidden from students before this time."
              >
                <Input
                  id="test-issue"
                  type="datetime-local"
                  value={meta.issueDate}
                  onChange={(e) => onUpdateMeta({ issueDate: e.target.value })}
                />
              </FormField>
              <FormField
                label="Deadline"
                htmlFor="test-due"
                hint="Optional — submissions after this are flagged."
              >
                <Input
                  id="test-due"
                  type="datetime-local"
                  value={meta.dueDate}
                  onChange={(e) => onUpdateMeta({ dueDate: e.target.value })}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection
            title="Class sections"
            description="Only students in these sections can see and take this test."
          >
            {sections.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sections available.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {sections.map((section) => {
                  const isAssigned = meta.sectionIds.includes(section.id);
                  return (
                    <button
                      key={section.id}
                      type="button"
                      aria-pressed={isAssigned}
                      onClick={() => toggleSection(section.id)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors",
                        isAssigned
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-card text-foreground hover:bg-muted"
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
                checked={meta.shuffleQuestions}
                onChange={(checked) => onUpdateMeta({ shuffleQuestions: checked })}
              />
              <CheckboxField
                id="shuffle-options"
                label="Shuffle choices"
                description="Applies to multiple choice."
                checked={meta.shuffleOptions}
                onChange={(checked) => onUpdateMeta({ shuffleOptions: checked })}
              />
            </div>
          </FormSection>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
