/** Shared shapes for the admin user list. */

export interface AdminUserItem {
  id: string;
  username: string;
  email: string | null;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  lrn: string | null;
  sectionName: string | null;
  teacherProfileId: string | null;
}

export interface AdminUserListResponse {
  data: AdminUserItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SectionOption {
  id: string;
  name: string;
  isActive: boolean;
  studentCount?: number;
}

export type RoleFilter = "ALL" | "ADMIN" | "TEACHER" | "STUDENT";
export type StatusFilter = "ALL" | "active" | "must-change-password";
export type UserSort = "created-desc" | "created-asc" | "name";

export const UNASSIGNED = "unassigned";

export const PAGE_SIZES = [10, 20, 50, 100];

export const SORT_LABELS: Record<UserSort, string> = {
  "created-desc": "Newest first",
  "created-asc": "Oldest first",
  name: "Name (A–Z)",
};

export const STATUS_LABELS: Record<StatusFilter, string> = {
  ALL: "Any password status",
  active: "Active only",
  "must-change-password": "Must change password",
};

export const ROLE_LABELS: Record<RoleFilter, string> = {
  ALL: "All roles",
  STUDENT: "Students",
  TEACHER: "Teachers",
  ADMIN: "Administrators",
};

export interface UserFilters {
  search: string;
  role: RoleFilter;
  status: StatusFilter;
  section: string;
  sort: UserSort;
  page: number;
  pageSize: number;
}

export const DEFAULT_FILTERS: UserFilters = {
  search: "",
  role: "ALL",
  status: "ALL",
  section: "ALL",
  sort: "created-desc",
  page: 1,
  pageSize: 20,
};

export function fullName(user: Pick<AdminUserItem, "firstName" | "lastName">): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function hasActiveFilters(filters: UserFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.role !== "ALL" ||
    filters.status !== "ALL" ||
    filters.section !== "ALL" ||
    filters.sort !== DEFAULT_FILTERS.sort
  );
}

/** Read list filters out of a URL's query params (dashboard drill-down links). */
export function filtersFromParams(params: {
  get: (key: string) => string | null;
}): Partial<UserFilters> {
  const role = params.get("role");
  const status = params.get("status");
  const section = params.get("section");
  const search = params.get("search");

  const filters: Partial<UserFilters> = {};
  if (role === "ADMIN" || role === "TEACHER" || role === "STUDENT") filters.role = role;
  if (status === "active" || status === "must-change-password") filters.status = status;
  if (section) filters.section = section;
  if (search) filters.search = search;
  return filters;
}

/** Build the query string the list and the CSV export both use. */
export function buildUserQuery(filters: UserFilters): string {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.role !== "ALL") params.set("role", filters.role);
  if (filters.status !== "ALL") params.set("status", filters.status);
  if (filters.section !== "ALL") params.set("section", filters.section);
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
  params.set("page", String(filters.page));
  params.set("pageSize", String(filters.pageSize));
  return params.toString();
}
