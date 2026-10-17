"use client";

import {
  KeyRound,
  Loader2,
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
  Trash2,
  Users,
} from "lucide-react";

import { fullName, type AdminUserItem } from "@/components/admin/users/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRole } from "@/lib/utils";

const ROLE_VARIANT: Record<string, "destructive" | "athena" | "secondary"> = {
  ADMIN: "destructive",
  TEACHER: "athena",
  STUDENT: "secondary",
};

interface UsersTableProps {
  users: AdminUserItem[];
  loading: boolean;
  currentUserId: string | null;
  selected: Set<string>;
  onToggleOne: (id: string) => void;
  onTogglePage: (ids: string[], checked: boolean) => void;
  onEdit: (user: AdminUserItem) => void;
  onResetPassword: (user: AdminUserItem) => void;
  onToggleActive: (user: AdminUserItem) => void;
  onDelete: (user: AdminUserItem) => void;
}

export function UsersTable({
  users,
  loading,
  currentUserId,
  selected,
  onToggleOne,
  onTogglePage,
  onEdit,
  onResetPassword,
  onToggleActive,
  onDelete,
}: UsersTableProps) {
  const pageIds = users.map((u) => u.id);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                  checked={allSelected}
                  onChange={(e) => onTogglePage(pageIds, e.target.checked)}
                  aria-label="Select every account on this page"
                  disabled={pageIds.length === 0}
                />
              </TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>LRN / Section</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="sr-only">Loading accounts</span>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    icon={Users}
                    title="No accounts match these filters"
                    description="Try a different search, or reset the filters to see everyone."
                  />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isSelf = user.id === currentUserId;
                return (
                  <TableRow key={user.id} data-state={selected.has(user.id) ? "selected" : undefined}>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[hsl(var(--primary))]"
                        checked={selected.has(user.id)}
                        onChange={() => onToggleOne(user.id)}
                        aria-label={`Select ${fullName(user)}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{fullName(user)}</span>
                        {isSelf ? <Badge variant="outline">You</Badge> : null}
                        {!user.isActive ? <Badge variant="destructive">Inactive</Badge> : null}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        @{user.username}
                        {user.email ? ` • ${user.email}` : ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ROLE_VARIANT[user.role] ?? "secondary"}>
                        {formatRole(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {user.lrn ? (
                        <div className="space-y-0.5">
                          <div className="font-mono font-medium">{user.lrn}</div>
                          <div className="text-muted-foreground">
                            {user.sectionName ?? "No section"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.mustChangePassword ? (
                        <Badge variant="warning" className="gap-1">
                          <KeyRound className="h-3 w-3" aria-hidden />
                          Must change password
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Password set</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Actions for ${fullName(user)}`}
                          >
                            <MoreHorizontal className="h-4 w-4" aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Pencil className="mr-2 h-4 w-4" aria-hidden />
                            Edit details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onResetPassword(user)}>
                            <KeyRound className="mr-2 h-4 w-4" aria-hidden />
                            Reset password
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onToggleActive(user)}
                            disabled={isSelf}
                          >
                            {user.isActive ? (
                              <>
                                <PowerOff className="mr-2 h-4 w-4" aria-hidden />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Power className="mr-2 h-4 w-4" aria-hidden />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(user)}
                            disabled={isSelf}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" aria-hidden />
                            Delete account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
