"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2, Users } from "lucide-react";

interface Section {
  id: string;
  name: string;
  adviserName?: string | null;
  gradeLevel?: string | null;
  schoolYear?: string | null;
  studentCount?: number;
}

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    adviserName: "",
    gradeLevel: "",
    schoolYear: "2026-2027",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);

  const loadSections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/sections");
      if (res.ok) {
        const data = await res.json();
        setSections(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setCanManage(u?.role === "ADMIN"))
      .catch(() => setCanManage(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSaving(true);
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create section");
        setSaving(false);
        return;
      }

      setDialogOpen(false);
      setFormData({ name: "", adviserName: "", gradeLevel: "", schoolYear: "2026-2027" });
      loadSections();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Class Sections</h1>
          <p className="text-sm text-muted-foreground">
            Configure academic grade cohorts and adviser assignments.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Section
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section Name</TableHead>
                <TableHead>Grade Level</TableHead>
                <TableHead>Adviser</TableHead>
                <TableHead>School Year</TableHead>
                <TableHead className="text-center">Enrolled Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : sections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {canManage
                      ? 'No sections created yet. Click "Create Section" to begin.'
                      : "No sections are assigned to you yet."}
                  </TableCell>
                </TableRow>
              ) : (
                sections.map((sec) => (
                  <TableRow key={sec.id}>
                    <TableCell className="font-semibold">
                      <Link
                        href={`/admin/sections/${sec.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {sec.name}
                      </Link>
                    </TableCell>
                    <TableCell>{sec.gradeLevel || "—"}</TableCell>
                    <TableCell>{sec.adviserName || "Unassigned"}</TableCell>
                    <TableCell>{sec.schoolYear || "—"}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {sec.studentCount || 0}
                      </span>
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
            <DialogTitle>Create New Section</DialogTitle>
            <DialogDescription>
              Add a class cohort for student roster assignment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <p className="border-2 border-destructive bg-destructive/10 p-2 text-xs font-medium text-destructive">
                {error}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="name">Section Name</Label>
              <Input
                id="name"
                placeholder="e.g. Grade 10 - Aristotle"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Input
                  id="gradeLevel"
                  placeholder="e.g. Grade 10"
                  value={formData.gradeLevel}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, gradeLevel: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="schoolYear">School Year</Label>
                <Input
                  id="schoolYear"
                  placeholder="e.g. 2026-2027"
                  value={formData.schoolYear}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, schoolYear: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adviserName">Adviser Name</Label>
              <Input
                id="adviserName"
                placeholder="e.g. Mrs. Maria Santos"
                value={formData.adviserName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, adviserName: e.target.value }))
                }
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Section
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
