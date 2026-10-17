"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  DEFAULT_SCHOOL_YEAR,
  EMPTY_SECTION_FORM,
  type SectionFormValues,
  type SectionItem,
} from "@/components/admin/sections/types";
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
import { useFormSubmit } from "@/hooks/use-form-submit";

interface SectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null creates a new section. */
  section: SectionItem | null;
  onSaved: () => void;
}

/** One dialog for creating a section and for editing an existing one. */
export function SectionFormDialog({
  open,
  onOpenChange,
  section,
  onSaved,
}: SectionFormDialogProps) {
  const isEdit = section !== null;
  const [form, setForm] = useState<SectionFormValues>(EMPTY_SECTION_FORM);
  const [isActive, setIsActive] = useState(true);

  const { saving, error, fieldErrors, submit, reset } = useFormSubmit<
    SectionFormValues & { isActive?: boolean }
  >(isEdit && section ? `/api/admin/sections/${section.id}` : "/api/admin/sections", {
    method: isEdit ? "PATCH" : "POST",
    successMessage: isEdit ? "Section updated" : "Section created",
    errorMessage: isEdit ? "Could not save the section." : "Could not create the section.",
    onSuccess: () => {
      onSaved();
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (!open) return;
    reset();
    setForm(
      section
        ? {
            name: section.name,
            adviserName: section.adviserName ?? "",
            gradeLevel: section.gradeLevel ?? "",
            schoolYear: section.schoolYear ?? DEFAULT_SCHOOL_YEAR,
          }
        : EMPTY_SECTION_FORM
    );
    setIsActive(section?.isActive ?? true);
  }, [open, section, reset]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: SectionFormValues & { isActive?: boolean } = { ...form };
    if (isEdit) payload.isActive = isActive;

    const ok = await submit(payload);
    if (ok) setForm(EMPTY_SECTION_FORM);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit section" : "Add a section"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details students and teachers see."
              : "Add a class section, then place students into it."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error ? <Alert variant="error">{error}</Alert> : null}

          <FormSection title="Section details">
            <FormField
              label="Section name"
              htmlFor="section-name"
              error={fieldErrors.name}
              hint="For example “Grade 10 - Aristotle”."
            >
              <Input
                id="section-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Grade level"
                htmlFor="section-grade-level"
                error={fieldErrors.gradeLevel}
              >
                <Input
                  id="section-grade-level"
                  placeholder="Grade 10"
                  value={form.gradeLevel}
                  onChange={(e) => setForm((f) => ({ ...f, gradeLevel: e.target.value }))}
                />
              </FormField>
              <FormField
                label="School year"
                htmlFor="section-school-year"
                error={fieldErrors.schoolYear}
              >
                <Input
                  id="section-school-year"
                  placeholder={DEFAULT_SCHOOL_YEAR}
                  value={form.schoolYear}
                  onChange={(e) => setForm((f) => ({ ...f, schoolYear: e.target.value }))}
                />
              </FormField>
            </div>

            <FormField
              label="Adviser"
              htmlFor="section-adviser"
              error={fieldErrors.adviserName}
              hint="Optional. The teacher responsible for this section."
            >
              <Input
                id="section-adviser"
                value={form.adviserName}
                onChange={(e) => setForm((f) => ({ ...f, adviserName: e.target.value }))}
              />
            </FormField>

            {isEdit ? (
              <CheckboxField
                id="section-active"
                label="Section is active"
                description="Inactive sections stay on record but are hidden from day-to-day lists."
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
              {isEdit ? "Save changes" : "Create section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
