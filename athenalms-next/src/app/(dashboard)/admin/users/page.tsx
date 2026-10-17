"use client";

import { useState } from "react";
import { Download, Plus } from "lucide-react";

import { BulkActionsBar } from "@/components/admin/users/BulkActionsBar";
import { ResetPasswordDialog } from "@/components/admin/users/ResetPasswordDialog";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { UserFormDialog } from "@/components/admin/users/UserFormDialog";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { useAdminUsers } from "@/components/admin/users/use-admin-users";
import { useUserActions } from "@/components/admin/users/use-user-actions";
import {
  hasActiveFilters,
  type AdminUserItem,
  type SectionOption,
} from "@/components/admin/users/types";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { useApiResource } from "@/hooks/use-api-resource";

export default function UsersPage() {
  const list = useAdminUsers();
  const { data: sectionsData } = useApiResource<SectionOption[]>("/api/admin/sections");
  const { data: me } = useApiResource<{ id: string }>("/api/auth/me");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUserItem | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminUserItem | null>(null);

  const sections = sectionsData ?? [];
  const currentUserId = me?.id ?? null;
  const selectedIds = Array.from(list.selected);

  const actions = useUserActions({
    filters: list.filters,
    selectedIds,
    onChanged: list.refresh,
    onSelectionCleared: list.clearSelection,
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (user: AdminUserItem) => {
    setEditing(user);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User accounts"
        description="Add students and teachers, fix their details, and control who can sign in."
        actions={
          <>
            <Button variant="outline" onClick={actions.exportCsv} className="gap-2">
              <Download className="h-4 w-4" aria-hidden />
              Export CSV
            </Button>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              Add account
            </Button>
          </>
        }
      />

      <UserFilters
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        role={list.filters.role}
        onRoleChange={list.setRole}
        status={list.filters.status}
        onStatusChange={list.setStatus}
        section={list.filters.section}
        onSectionChange={list.setSection}
        sort={list.filters.sort}
        onSortChange={list.setSort}
        pageSize={list.filters.pageSize}
        onPageSizeChange={list.setPageSize}
        sections={sections}
        shown={list.users.length}
        total={list.data?.total ?? 0}
        hasActiveFilters={hasActiveFilters(list.filters)}
        onReset={list.resetFilters}
      />

      {list.error ? <Alert variant="error">{list.error}</Alert> : null}

      <BulkActionsBar
        count={selectedIds.length}
        busy={actions.bulkBusy}
        onRun={actions.runBulk}
        onExport={actions.exportCsv}
        onClear={list.clearSelection}
      />

      <UsersTable
        users={list.users}
        loading={list.loading}
        currentUserId={currentUserId}
        selected={list.selected}
        onToggleOne={list.toggleOne}
        onTogglePage={list.togglePage}
        onEdit={openEdit}
        onResetPassword={setResetTarget}
        onToggleActive={actions.toggleActive}
        onDelete={actions.deleteUser}
      />

      {list.data && list.data.totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-2 bg-card p-3">
          <span className="text-xs text-muted-foreground">
            Page {list.data.page} of {list.data.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => list.setPage(list.filters.page - 1)}
              disabled={list.data.page <= 1 || list.loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => list.setPage(list.filters.page + 1)}
              disabled={list.data.page >= list.data.totalPages || list.loading}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
        sections={sections}
        isSelf={editing?.id === currentUserId}
        onSaved={list.refresh}
      />

      <ResetPasswordDialog
        open={resetTarget !== null}
        onOpenChange={(open) => {
          if (!open) setResetTarget(null);
        }}
        user={resetTarget}
        onDone={list.refresh}
      />

      {actions.dialog}
    </div>
  );
}
