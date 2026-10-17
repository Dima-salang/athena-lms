"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DEFAULT_FILTERS,
  buildUserQuery,
  type AdminUserListResponse,
  type RoleFilter,
  type StatusFilter,
  type UserFilters,
  type UserSort,
} from "@/components/admin/users/types";

const SEARCH_DEBOUNCE_MS = 350;

/**
 * Server-side state for the admin user list: filters, paging, loading and the
 * current page's selection. Selection never survives a filter or page change,
 * so a bulk action can only ever touch rows the admin can still see.
 *
 * `initial` carries filters handed over by the dashboard links (role, status,
 * section). The caller should memoise it, so this reapplies only when the URL
 * actually changes.
 */
export function useAdminUsers(initial: Partial<UserFilters> = {}) {
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AdminUserListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setFilters((current) => ({ ...current, ...initial, page: 1 }));
    setSearchInput(initial.search ?? "");
    setReady(true);
  }, [initial]);

  // Debounce typing so a search only costs one request once it settles.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) =>
        current.search === searchInput
          ? current
          : { ...current, search: searchInput, page: 1 }
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const url = useMemo(() => `/api/admin/users?${buildUserQuery(filters)}`, [filters]);

  useEffect(() => {
    if (!ready) return;

    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to load user accounts");
        const json = (await res.json()) as AdminUserListResponse;
        if (!cancelled) setData(json);
      } catch (err) {
        if (cancelled || (err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load user accounts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url, ready, version]);

  // A different page or filter means a different set of rows.
  useEffect(() => {
    setSelected(new Set());
  }, [url]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const update = useCallback((patch: Partial<UserFilters>) => {
    setFilters((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  }, []);

  const setRole = useCallback((role: RoleFilter) => update({ role }), [update]);
  const setStatus = useCallback((status: StatusFilter) => update({ status }), [update]);
  const setSection = useCallback((section: string) => update({ section }), [update]);
  const setSort = useCallback((sort: UserSort) => update({ sort }), [update]);
  const setPageSize = useCallback((pageSize: number) => update({ pageSize }), [update]);
  const setPage = useCallback((page: number) => {
    setFilters((current) => ({ ...current, page }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchInput("");
    setFilters(DEFAULT_FILTERS);
  }, []);

  const toggleOne = useCallback((id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const togglePage = useCallback((ids: string[], checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  return {
    filters,
    searchInput,
    setSearchInput,
    setRole,
    setStatus,
    setSection,
    setSort,
    setPageSize,
    setPage,
    resetFilters,
    data,
    users: data?.data ?? [],
    loading,
    error,
    refresh,
    selected,
    toggleOne,
    togglePage,
    clearSelection,
  };
}
