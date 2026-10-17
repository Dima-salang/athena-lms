"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Loader2 } from "lucide-react";
import type { UserDTO } from "@/types";

interface Assignment {
  id: string;
  teacherName: string;
  teacherUsername: string;
  sectionName: string;
  subjectName: string;
  subjectCode?: string | null;
  schoolYear?: string | null;
}

interface TeacherOption {
  id: string; // teacherProfileId
  name: string;
  username: string;
}

interface OptionItem {
  id: string;
  name: string;
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [sections, setSections] = useState<OptionItem[]>([]);
  const [subjects, setSubjects] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    teacherProfileId: "",
    sectionId: "",
    subjectId: "",
    schoolYear: "2026-2027",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignRes, usersRes, secRes, subRes] = await Promise.all([
        fetch("/api/admin/teacher-assignments"),
        fetch("/api/admin/users?role=TEACHER"),
        fetch("/api/admin/sections"),
        fetch("/api/admin/subjects"),
      ]);

      if (assignRes.ok) setAssignments(await assignRes.json());
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setTeachers(
          uData.data
            .filter((u: UserDTO) => u.teacherProfileId)
            .map((u: UserDTO) => ({
              id: u.teacherProfileId!,
              name: `${u.firstName} ${u.lastName}`,
              username: u.username,
            }))
        );
      }
      if (secRes.ok) setSections(await secRes.json());
      if (subRes.ok) setSubjects(await subRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSaving(true);
      const res = await fetch("/api/admin/teacher-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create assignment");
        setSaving(false);
        return;
      }

      setDialogOpen(false);
      setFormData({
        teacherProfileId: "",
        sectionId: "",
        subjectId: "",
        schoolYear: "2026-2027",
      });
      loadData();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this teacher assignment?")) return;
    try {
      await fetch(`/api/admin/teacher-assignments?id=${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Faculty Assignments</h1>
          <p className="text-sm text-muted-foreground">
            Map faculty teachers to authorized sections and academic subjects.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Assign Teacher
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Assigned Section</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead className="w-16 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No teacher assignments found. Click &quot;Assign Teacher&quot; to link faculty to sections.
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="font-semibold text-sm">{a.teacherName}</div>
                      <div className="text-xs text-muted-foreground">@{a.teacherUsername}</div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {a.subjectName} {a.subjectCode ? `(${a.subjectCode})` : ""}
                    </TableCell>
                    <TableCell className="text-sm">{a.sectionName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{a.schoolYear || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(a.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Teacher to Section & Subject</DialogTitle>
            <DialogDescription>
              Authorizes the teacher to create tests and grade students in this course.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </p>
            )}

            <div className="space-y-1.5">
              <Label>Teacher</Label>
              <Select
                value={formData.teacherProfileId}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, teacherProfileId: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty member..." />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} (@{t.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Select
                value={formData.subjectId}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, subjectId: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject course..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Class Section</Label>
              <Select
                value={formData.sectionId}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, sectionId: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class section..." />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((sec) => (
                    <SelectItem key={sec.id} value={sec.id}>
                      {sec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  saving ||
                  !formData.teacherProfileId ||
                  !formData.sectionId ||
                  !formData.subjectId
                }
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Assignment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
