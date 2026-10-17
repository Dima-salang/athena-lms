import { describe, expect, it } from "vitest";

import {
  DEFAULT_PAGE_SIZE,
  UNASSIGNED,
  buildAdminUsersOrderBy,
  buildAdminUsersWhere,
  buildUserExportRows,
  parseAdminUsersQuery,
  toAdminUserDTO,
  USER_EXPORT_HEADERS,
  type AdminUserRecord,
} from "../admin-users";

const params = (query: string) => new URLSearchParams(query);

describe("parseAdminUsersQuery", () => {
  it("applies defaults for an empty query", () => {
    const query = parseAdminUsersQuery(params(""));
    expect(query).toEqual({
      role: undefined,
      status: undefined,
      section: undefined,
      search: undefined,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      sort: "created-desc",
    });
  });

  it("keeps known values", () => {
    const query = parseAdminUsersQuery(
      params("role=STUDENT&status=must-change-password&section=sec-1&search= juan &page=3&pageSize=50&sort=name")
    );

    expect(query).toMatchObject({
      role: "STUDENT",
      status: "must-change-password",
      section: "sec-1",
      search: "juan",
      page: 3,
      pageSize: 50,
      sort: "name",
    });
  });

  it("ignores unknown or malformed values", () => {
    const query = parseAdminUsersQuery(
      params("role=PRINCIPAL&status=expelled&page=0&pageSize=9999&sort=random")
    );

    expect(query.role).toBeUndefined();
    expect(query.status).toBeUndefined();
    expect(query.page).toBe(1);
    expect(query.pageSize).toBe(100);
    expect(query.sort).toBe("created-desc");
  });
});

describe("buildAdminUsersWhere", () => {
  const base = parseAdminUsersQuery(params(""));

  it("is empty with no filters", () => {
    expect(buildAdminUsersWhere(base)).toEqual({});
  });

  it("maps role and status to columns", () => {
    expect(buildAdminUsersWhere({ ...base, role: "TEACHER" })).toMatchObject({ role: "TEACHER" });
    expect(buildAdminUsersWhere({ ...base, status: "active" })).toMatchObject({ isActive: true });
    expect(buildAdminUsersWhere({ ...base, status: "must-change-password" })).toMatchObject({
      mustChangePassword: true,
    });
  });

  it("searches username, name and email", () => {
    const where = buildAdminUsersWhere({ ...base, search: "juan" });
    const and = where.AND as Array<{ OR: Array<Record<string, unknown>> }>;
    expect(and).toHaveLength(1);
    expect(and[0].OR).toHaveLength(4);
  });

  it("treats 'unassigned' as students with no section or no profile", () => {
    const where = buildAdminUsersWhere({ ...base, section: UNASSIGNED });
    const and = where.AND as Array<Record<string, unknown>>;
    expect(and).toContainEqual({ role: "STUDENT" });
    expect(and).toContainEqual({
      OR: [{ studentProfile: { is: null } }, { studentProfile: { is: { sectionId: null } } }],
    });
  });

  it("filters by a concrete section id", () => {
    const where = buildAdminUsersWhere({ ...base, section: "sec-1" });
    expect(where.AND).toEqual([{ studentProfile: { is: { sectionId: "sec-1" } } }]);
  });

  it("combines search and section filters", () => {
    const where = buildAdminUsersWhere({ ...base, search: "juan", section: "sec-1" });
    expect(where.AND).toHaveLength(2);
  });
});

describe("buildAdminUsersOrderBy", () => {
  it("defaults to newest first", () => {
    expect(buildAdminUsersOrderBy("created-desc")).toEqual([{ createdAt: "desc" }]);
    expect(buildAdminUsersOrderBy("created-asc")).toEqual([{ createdAt: "asc" }]);
    expect(buildAdminUsersOrderBy("name")).toEqual([{ lastName: "asc" }, { firstName: "asc" }]);
  });
});

const record = (overrides: Partial<AdminUserRecord> = {}): AdminUserRecord => ({
  id: "u1",
  username: "student.001",
  email: null,
  firstName: "Juan",
  lastName: "Dela Cruz",
  role: "STUDENT",
  isActive: true,
  mustChangePassword: true,
  createdAt: new Date("2026-01-05T08:00:00.000Z"),
  studentProfile: { lrn: "123456789012", section: { name: "Grade 10 - Aristotle" } },
  teacherProfile: null,
  ...overrides,
});

describe("toAdminUserDTO", () => {
  it("maps profiles onto the flat wire shape", () => {
    expect(toAdminUserDTO(record())).toEqual({
      id: "u1",
      username: "student.001",
      email: null,
      firstName: "Juan",
      lastName: "Dela Cruz",
      role: "STUDENT",
      isActive: true,
      mustChangePassword: true,
      createdAt: "2026-01-05T08:00:00.000Z",
      lrn: "123456789012",
      sectionName: "Grade 10 - Aristotle",
      teacherProfileId: null,
    });
  });

  it("copes with missing profiles and a student with no section", () => {
    const dto = toAdminUserDTO(
      record({ studentProfile: { lrn: "123456789012", section: null }, teacherProfile: { id: "tp1" } })
    );
    expect(dto.sectionName).toBeNull();
    expect(dto.lrn).toBe("123456789012");
    expect(dto.teacherProfileId).toBe("tp1");

    const teacher = toAdminUserDTO(record({ studentProfile: null, teacherProfile: { id: "tp2" } }));
    expect(teacher.lrn).toBeNull();
    expect(teacher.sectionName).toBeNull();
  });
});

describe("buildUserExportRows", () => {
  it("follows the header order and blanks out missing values", () => {
    const rows = buildUserExportRows([
      toAdminUserDTO(record()),
      toAdminUserDTO(
        record({
          id: "u2",
          username: "teacher.demo",
          role: "TEACHER",
          isActive: false,
          mustChangePassword: false,
          studentProfile: null,
          teacherProfile: { id: "tp1" },
        })
      ),
    ]);

    expect(USER_EXPORT_HEADERS).toHaveLength(9);
    expect(rows[0]).toEqual([
      "Juan Dela Cruz",
      "student.001",
      "STUDENT",
      "",
      "123456789012",
      "Grade 10 - Aristotle",
      "Active",
      "Yes",
      "2026-01-05T08:00:00.000Z",
    ]);
    expect(rows[1]).toEqual([
      "Juan Dela Cruz",
      "teacher.demo",
      "TEACHER",
      "",
      "",
      "",
      "Inactive",
      "No",
      "2026-01-05T08:00:00.000Z",
    ]);
  });
});
