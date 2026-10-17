"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  type AssignmentFormValues,
  type AssignmentItem,
  type OptionItem,
  type TeacherOption,
} from "@/components/admin/assignments/types";
import { DEFAULT_SCHOOL_YEAR } from "@/components/admin/types";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField, FormSection } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormSubmit } from "@/hooks/use-form-submit";

const EMPTY: AssignmentFormValues = {
  teacherProfileId: "",
  sectionId: "",
  subjectId: "",
  schoolYear: DEFAULT_SCHOOL_YEAR,
};

interface AssignmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null creates a new assignment. */
  assignment: AssignmentItem | null;
  teachers: TeacherOption[];
  sections: OptionItem[];
  subjects: OptionItem[];
  onSaved: () => void;
}

/** One dialog for assigning a teacher and for editing an existing assignment. */
export function AssignmentFormDialog({
  open,
  onOpenChange,
  assignment,
  teachers,
  sections,
  subjects,
  onSaved,
}: AssignmentFormDialogProps) {
  const isEdit = assignment !== null;
  const [form, setForm] = useState<AssignmentFormValues>(EMPTY);

  const { saving, error, fieldErrors, submit, reset } = useFormSubmit<AssignmentFormValues>(
    isEdit && assignment
      ? `/api/admin/teacher-assignments/${assignment.id}`
      : "/api/admin/teacher-assignments",
    {
      method: isEdit ? "PATCH" : "POST",
      successMessage: isEdit ? "Assignment updated" : "Teacher assigned",
      errorMessage: isEdit ? "Could not save the assignment." : "Could not assign the teacher.",
      onSuccess: () => {
        onSaved();
        onOpenChange(false);
      },
    }
  );

  useEffect(() => {
    if (!open) return;
    reset();
    setForm(
      assignment
        ? {
            teacherProfileId: assignment.teacherProfileId,
            sectionId: assignment.sectionId,
            subjectId: assignment.subjectId,
            schoolYear: assignment.schoolYear ?? DEFAULT_SCHOOL_YEAR,
          }
        : EMPTY
    );
  }, [open, assignment, reset]);

  const incomplete = !form.teacherProfileId || !form.sectionId || !form.subjectId;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await submit(form);
    if (ok) setForm(EMPTY);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit assignment" : "Assign a teacher"}</DialogTitle>
          <DialogDescription>
            This is what lets the teacher create tests and grade students for that class and
            subject.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error ? <Alert variant="error">{error}</Alert> : null}

          <FormSection title="Who teaches what">
            <FormField label="Teacher" htmlFor="assignment-teacher" error={fieldErrors.teacherProfileId}>
              <Select
                value={form.teacherProfileId}
                onValueChange={(value) => setForm((f) => ({ ...f, teacherProfileId: value }))}
              >
                <SelectTrigger id="assignment-teacher">
                  <SelectValue placeholder="Choose a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} (@{teacher.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Subject" htmlFor="assignment-subject" error={fieldErrors.subjectId}>
              <Select
                value={form.subjectId}
                onValueChange={(value) => setForm((f) => ({ ...f, subjectId: value }))}
              >
                <SelectTrigger id="assignment-subject">
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Section" htmlFor="assignment-section" error={fieldErrors.sectionId}>
              <Select
                value={form.sectionId}
                onValueChange={(value) => setForm((f) => ({ ...f, sectionId: value }))}
              >
                <SelectTrigger id="assignment-section">
                  <SelectValue placeholder="Choose a section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                      {section.isActive === false ? " (inactive)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="School year" htmlFor="assignment-year" error={fieldErrors.schoolYear}>
              <Input
                id="assignment-year"
                value={form.schoolYear}
                onChange={(e) => setForm((f) => ({ ...f, schoolYear: e.target.value }))}
                placeholder={DEFAULT_SCHOOL_YEAR}
              />
            </FormField>
          </FormSection>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || incomplete}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {isEdit ? "Save changes" : "Assign teacher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
