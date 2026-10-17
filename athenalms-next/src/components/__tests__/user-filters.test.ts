import { describe, expect, it } from "vitest";

import { buildUserQuery, filtersFromParams } from "@/components/admin/users/types";

describe("filtersFromParams", () => {
  it("reads the parameters the dashboard links use", () => {
    const params = new URLSearchParams(
      "role=STUDENT&status=must-change-password&section=unassigned&search=juan"
    );

    expect(filtersFromParams(params)).toEqual({
      role: "STUDENT",
      status: "must-change-password",
      section: "unassigned",
      search: "juan",
    });
  });

  it("ignores anything it does not understand", () => {
    const params = new URLSearchParams("role=PRINCIPAL&status=expelled");
    expect(filtersFromParams(params)).toEqual({});
  });

  it("returns an empty object with no parameters", () => {
    expect(filtersFromParams(new URLSearchParams(""))).toEqual({});
  });
});

describe("buildUserQuery", () => {
  it("omits defaults and always carries paging", () => {
    expect(
      buildUserQuery({
        search: "",
        role: "ALL",
        status: "ALL",
        section: "ALL",
        sort: "created-desc",
        page: 1,
        pageSize: 20,
      })
    ).toBe("page=1&pageSize=20");
  });

  it("includes every filter that differs from the default, trimmed", () => {
    const query = buildUserQuery({
      search: "  juan  ",
      role: "STUDENT",
      status: "active",
      section: "unassigned",
      sort: "name",
      page: 3,
      pageSize: 50,
    });

    expect(query).toContain("search=juan");
    expect(query).toContain("role=STUDENT");
    expect(query).toContain("status=active");
    expect(query).toContain("section=unassigned");
    expect(query).toContain("sort=name");
    expect(query).toContain("page=3");
    expect(query).toContain("pageSize=50");
  });
});
