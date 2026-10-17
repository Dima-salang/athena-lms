"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Loader2 } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/subjects");
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
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
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create subject");
        setSaving(false);
        return;
      }

      setDialogOpen(false);
      setFormData({ name: "", code: "", description: "" });
      loadSubjects();
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
          <h1 className="text-2xl font-bold tracking-tight">Academic Subjects</h1>
          <p className="text-sm text-muted-foreground">
            Manage course disciplines and curriculum offerings.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Subject
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Subject Code</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    {canManage
                      ? 'No subjects created yet. Click "Create Subject" to begin.'
                      : "No subjects are assigned to you yet."}
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      {sub.code || "—"}
                    </TableCell>
                    <TableCell className="font-semibold">{sub.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {sub.description || "—"}
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
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>
              Add an academic subject to the curriculum catalogue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </p>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Mathematics 10"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="code">Subject Code</Label>
                <Input
                  id="code"
                  placeholder="MATH10"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the subject course..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Subject
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
