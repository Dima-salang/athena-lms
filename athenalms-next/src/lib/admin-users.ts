/**
 * Admin user list — query semantics and DTO mapping
 *
 * One module owns how the admin user list is filtered, sorted and shaped, so
 * the list route, the CSV export and the PATCH response can never disagree.
 * Pure functions only (no Prisma import) so they are unit-testable.
 */

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export type AdminUserStatus = "active" | "must-change-password";
export type AdminUserSort = "created-desc" | "created-asc" | "name";

export interface AdminUsersQuery {
  role?: string;
  status?: AdminUserStatus;
  /** A section id, or "unassigned" for students with no section. */
  section?: string;
  search?: string;
  page: number;
  pageSize: number;
  sort: AdminUserSort;
}

export const USER_ROLES = ["ADMIN", "TEACHER", "STUDENT"] as const;

export const UNASSIGNED = "unassigned";

function positiveInt(value: string | null, fallback: number, max: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(max, parsed);
}

/** Read the list filters out of a request URL, ignoring anything unknown. */
export function parseAdminUsersQuery(params: URLSearchParams): AdminUsersQuery {
  const role = params.get("role") ?? undefined;
  const status = params.get("status") ?? undefined;
  const section = params.get("section") ?? undefined;
  const sort = params.get("sort") ?? undefined;
  const search = params.get("search")?.trim();

  return {
    role: role && USER_ROLES.includes(role as (typeof USER_ROLES)[number]) ? role : undefined,
    status:
      status === "active" || status === "must-change-password" ? status : undefined,
    section: section || undefined,
    search: search || undefined,
    page: positiveInt(params.get("page"), 1, Number.MAX_SAFE_INTEGER),
    pageSize: positiveInt(params.get("pageSize"), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    sort:
      sort === "created-asc" || sort === "name" || sort === "created-desc"
        ? sort
        : "created-desc",
  };
}

/** Prisma `where` for a parsed query. Shape matches the previous inline filters. */
export function buildAdminUsersWhere(query: AdminUsersQuery): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  if (query.role) where.role = query.role;
  if (query.status === "active") where.isActive = true;
  if (query.status === "must-change-password") where.mustChangePassword = true;

  const and: Record<string, unknown>[] = [];

  if (query.search) {
    const search = query.search;
    and.push({
      OR: [
        { username: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ],
    });
  }

  if (query.section === UNASSIGNED) {
    and.push({ role: "STUDENT" });
    and.push({
      // Students with no profile at all, or with a profile but no section.
      OR: [{ studentProfile: { is: null } }, { studentProfile: { is: { sectionId: null } } }],
    });
  } else if (query.section) {
    and.push({ studentProfile: { is: { sectionId: query.section } } });
  }

  if (and.length > 0) where.AND = and;

  return where;
}

export function buildAdminUsersOrderBy(
  sort: AdminUserSort
): Array<Record<string, "asc" | "desc">> {
  if (sort === "created-asc") return [{ createdAt: "asc" }];
  if (sort === "name") return [{ lastName: "asc" }, { firstName: "asc" }];
  return [{ createdAt: "desc" }];
}

/** Structural shape of a Prisma user row with the profiles included. */
export interface AdminUserRecord {
  id: string;
  username: string;
  email: string | null;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
  studentProfile?: { lrn: string; section?: { name: string } | null } | null;
  teacherProfile?: { id: string } | null;
}

export interface AdminUserDTO {
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

/** The wire format for the admin user list (unchanged from before Phase 4). */
export function toAdminUserDTO(user: AdminUserRecord): AdminUserDTO {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt.toISOString(),
    lrn: user.studentProfile?.lrn ?? null,
    sectionName: user.studentProfile?.section?.name ?? null,
    teacherProfileId: user.teacherProfile?.id ?? null,
  };
}

export const USER_EXPORT_HEADERS = [
  "Name",
  "Username",
  "Role",
  "Email",
  "LRN",
  "Section",
  "Status",
  "Must change password",
  "Created",
];

/** CSV body rows for a filtered user list. */
export function buildUserExportRows(
  users: AdminUserDTO[]
): Array<Array<string>> {
  return users.map((u) => [
    `${u.firstName} ${u.lastName}`.trim(),
    u.username,
    u.role,
    u.email ?? "",
    u.lrn ?? "",
    u.sectionName ?? "",
    u.isActive ? "Active" : "Inactive",
    u.mustChangePassword ? "Yes" : "No",
    u.createdAt,
  ]);
}
