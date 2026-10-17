"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  EMPTY_SUBJECT_FORM,
  type SubjectFormValues,
  type SubjectItem,
} from "@/components/admin/subjects/types";
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
import { CheckboxField, FormField, FormSection } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormSubmit } from "@/hooks/use-form-submit";

interface SubjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null creates a new subject. */
  subject: SubjectItem | null;
  onSaved: () => void;
}

/** One dialog for creating a subject and for editing an existing one. */
export function SubjectFormDialog({
  open,
  onOpenChange,
  subject,
  onSaved,
}: SubjectFormDialogProps) {
  const isEdit = subject !== null;
  const [form, setForm] = useState<SubjectFormValues>(EMPTY_SUBJECT_FORM);
  const [isActive, setIsActive] = useState(true);

  const { saving, error, fieldErrors, submit, reset } = useFormSubmit<
    SubjectFormValues & { isActive?: boolean }
  >(isEdit && subject ? `/api/admin/subjects/${subject.id}` : "/api/admin/subjects", {
    method: isEdit ? "PATCH" : "POST",
    successMessage: isEdit ? "Subject updated" : "Subject created",
    errorMessage: isEdit ? "Could not save the subject." : "Could not create the subject.",
    onSuccess: () => {
      onSaved();
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (!open) return;
    reset();
    setForm(
      subject
        ? {
            name: subject.name,
            code: subject.code ?? "",
            description: subject.description ?? "",
          }
        : EMPTY_SUBJECT_FORM
    );
    setIsActive(subject?.isActive ?? true);
  }, [open, subject, reset]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: SubjectFormValues & { isActive?: boolean } = { ...form };
    if (isEdit) payload.isActive = isActive;

    const ok = await submit(payload);
    if (ok) setForm(EMPTY_SUBJECT_FORM);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit subject" : "Add a subject"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update how this subject appears to teachers and students."
              : "Subjects are what you assign to teachers, one class at a time."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error ? <Alert variant="error">{error}</Alert> : null}

          <FormSection title="Subject details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                label="Subject name"
                htmlFor="subject-name"
                error={fieldErrors.name}
                className="sm:col-span-2"
              >
                <Input
                  id="subject-name"
                  placeholder="Mathematics 10"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </FormField>
              <FormField
                label="Code"
                htmlFor="subject-code"
                error={fieldErrors.code}
                hint="Short label"
              >
                <Input
                  id="subject-code"
                  placeholder="MATH10"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                />
              </FormField>
            </div>

            <FormField
              label="Description"
              htmlFor="subject-description"
              error={fieldErrors.description}
              hint="Optional. A short line about what the subject covers."
            >
              <Textarea
                id="subject-description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </FormField>

            {isEdit ? (
              <CheckboxField
                id="subject-active"
                label="Subject is active"
                description="Inactive subjects stay on record but stop appearing in new assignments."
                checked={isActive}
                onChange={setIsActive}
              />
            ) : null}
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
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {isEdit ? "Save changes" : "Create subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
