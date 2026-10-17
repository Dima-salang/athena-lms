"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  type AdminUserItem,
  type SectionOption,
} from "@/components/admin/users/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormSubmit } from "@/hooks/use-form-submit";

const NO_SECTION = "none";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null creates a new account. */
  user: AdminUserItem | null;
  sections: SectionOption[];
  isSelf: boolean;
  onSaved: () => void;
}

interface FormState {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  lrn: string;
  sectionId: string;
  isActive: boolean;
}

const EMPTY: FormState = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  role: "STUDENT",
  lrn: "",
  sectionId: NO_SECTION,
  isActive: true,
};

/** One dialog for both creating an account and editing an existing one. */
export function UserFormDialog({
  open,
  onOpenChange,
  user,
  sections,
  isSelf,
  onSaved,
}: UserFormDialogProps) {
  const isEdit = user !== null;
  const [form, setForm] = useState<FormState>(EMPTY);

  const { saving, error, fieldErrors, submit, reset } = useFormSubmit<Record<string, unknown>>(
    isEdit && user ? `/api/admin/users/${user.id}` : "/api/admin/users",
    {
      method: isEdit ? "PATCH" : "POST",
      errorMessage: isEdit ? "Could not save the changes." : "Could not create the account.",
      onSuccess: (data) => {
        if (!isEdit) {
          const initialPassword = (data as { initialPassword?: string } | null)?.initialPassword;
          toast.success("Account created", {
            description: initialPassword
              ? `Starting password: ${initialPassword} — they must change it at first sign-in.`
              : "They must change the password at first sign-in.",
          });
        }
        onSaved();
        onOpenChange(false);
      },
    }
  );

  // Load the row being edited (or clear the form when creating).
  useEffect(() => {
    if (!open) return;
    reset();
    setForm(
      user
        ? {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email ?? "",
            role: user.role,
            lrn: user.lrn ?? "",
            sectionId: NO_SECTION,
            isActive: user.isActive,
          }
        : EMPTY
    );
    if (user?.sectionName) {
      const match = sections.find((s) => s.name === user.sectionName);
      if (match) setForm((current) => ({ ...current, sectionId: match.id }));
    }
  }, [open, user, sections, reset]);

  const showStudentFields = form.role === "STUDENT";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload: Record<string, unknown> = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
    };

    if (!isEdit) {
      payload.username = form.username;
      payload.role = form.role;
    } else {
      if (!isSelf) payload.role = form.role;
      if (user) payload.isActive = form.isActive;
    }

    if (showStudentFields) {
      payload.lrn = form.lrn;
      payload.sectionId = form.sectionId === NO_SECTION ? null : form.sectionId;
    }

    const ok = await submit(payload);
    if (ok) setForm(EMPTY);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit account" : "Add an account"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the account details. Use Reset password if they have forgotten theirs."
              : "New accounts must change their password the first time they sign in."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error ? <Alert variant="error">{error}</Alert> : null}

          <FormSection title="Name">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="First name"
                htmlFor="user-first-name"
                error={fieldErrors.firstName}
              >
                <Input
                  id="user-first-name"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  autoComplete="off"
                  required
                />
              </FormField>
              <FormField
                label="Last name"
                htmlFor="user-last-name"
                error={fieldErrors.lastName}
              >
                <Input
                  id="user-last-name"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  autoComplete="off"
                  required
                />
              </FormField>
            </div>

            <FormField
              label="Email (optional)"
              htmlFor="user-email"
              error={fieldErrors.email}
              hint="Only needed if the school contacts them by email."
            >
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                autoComplete="off"
              />
            </FormField>
          </FormSection>

          <FormSection title="Sign-in details">
            {isEdit ? (
              <FormField
                label="Username"
                htmlFor="user-username"
                hint="Usernames cannot be changed after an account is created."
              >
                <Input id="user-username" value={form.username} readOnly disabled />
              </FormField>
            ) : (
              <FormField
                label="Username"
                htmlFor="user-username"
                error={fieldErrors.username}
                hint="Students sign in with this or their LRN."
              >
                <Input
                  id="user-username"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  autoComplete="off"
                  required
                />
              </FormField>
            )}

            <FormField
              label="Role"
              htmlFor="user-role"
              error={fieldErrors.role}
              hint={
                isSelf
                  ? "You cannot change your own role."
                  : "Changing a role removes the old student or teacher details."
              }
            >
              <Select
                value={form.role}
                onValueChange={(value) => setForm((f) => ({ ...f, role: value }))}
                disabled={isSelf}
              >
                <SelectTrigger id="user-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {showStudentFields ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  label="LRN"
                  htmlFor="user-lrn"
                  error={fieldErrors.lrn}
                  hint="12 digits. Also their first password."
                >
                  <Input
                    id="user-lrn"
                    inputMode="numeric"
                    value={form.lrn}
                    onChange={(e) => setForm((f) => ({ ...f, lrn: e.target.value }))}
                    autoComplete="off"
                  />
                </FormField>
                <FormField
                  label="Section"
                  htmlFor="user-section"
                  error={fieldErrors.sectionId}
                  hint="Leave as “No section” for students who are not placed yet."
                >
                  <Select
                    value={form.sectionId}
                    onValueChange={(value) => setForm((f) => ({ ...f, sectionId: value }))}
                  >
                    <SelectTrigger id="user-section">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_SECTION}>No section</SelectItem>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                          {section.isActive ? "" : " (inactive)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            ) : null}

            {isEdit ? (
              <CheckboxField
                id="user-active"
                label="Account is active"
                description="Inactive accounts cannot sign in."
                checked={form.isActive}
                onChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
                disabled={isSelf}
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
              {isEdit ? "Save changes" : "Create account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
