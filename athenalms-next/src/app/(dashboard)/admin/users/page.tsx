"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Search, Trash2, Loader2, KeyRound } from "lucide-react";
import { formatRole } from "@/lib/utils";

interface UserItem {
  id: string;
  username: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  role: string;
  mustChangePassword: boolean;
  lrn?: string | null;
  sectionName?: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "STUDENT",
    lrn: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (appliedSearch) params.set("search", appliedSearch);
      if (roleFilter !== "ALL") params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data);
      }
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSaving(true);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create user");
        setSaving(false);
        return;
      }

      setDialogOpen(false);
      setFormData({ username: "", firstName: "", lastName: "", email: "", role: "STUDENT", lrn: "" });
      loadUsers();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Accounts</h1>
          <p className="text-sm text-muted-foreground">
            Manage system administrators, teachers, and enrolled students.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, username, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="STUDENT">Students</SelectItem>
            <SelectItem value="TEACHER">Teachers</SelectItem>
            <SelectItem value="ADMIN">Administrators</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>LRN / Section</TableHead>
                <TableHead>Password Status</TableHead>
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
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users matching the criteria.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-semibold text-sm">{u.firstName} {u.lastName}</div>
                      <div className="text-xs text-muted-foreground">@{u.username} {u.email ? `• ${u.email}` : ""}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.role === "ADMIN"
                            ? "destructive"
                            : u.role === "TEACHER"
                            ? "athena"
                            : "secondary"
                        }
                      >
                        {formatRole(u.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {u.lrn ? (
                        <div>
                          <span className="font-mono font-medium">{u.lrn}</span>
                          <span className="text-muted-foreground"> ({u.sectionName || "No Section"})</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {u.mustChangePassword ? (
                        <Badge variant="warning" className="text-[10px] gap-1">
                          <KeyRound className="h-3 w-3" />
                          Must Change PW
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Standard</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(u.id)}
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
            <DialogTitle>Add User Account</DialogTitle>
            <DialogDescription>
              Create a single user. Newly created accounts will be required to change their password on first login.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, username: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, role: val }))
                  }
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.role === "STUDENT" && (
              <div className="space-y-1.5">
                <Label htmlFor="lrn">LRN (12 Digits)</Label>
                <Input
                  id="lrn"
                  placeholder="12-digit Learner Reference Number"
                  value={formData.lrn}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lrn: e.target.value }))
                  }
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
