import { describe, expect, it } from "vitest";

import {
  LAST_ADMIN_REASON,
  MAX_BULK_IDS,
  NOT_FOUND_REASON,
  SELF_REASON,
  deleteBlockReason,
  splitBulkTargets,
} from "../admin-guards";

const admin = (id: string, isActive = true) => ({ id, role: "ADMIN", isActive });
const student = (id: string) => ({ id, role: "STUDENT", isActive: true });

describe("deleteBlockReason", () => {
  it("allows a user with no records", () => {
    expect(deleteBlockReason({ authoredTestCount: 0, submissionCount: 0 })).toBeNull();
  });

  it("blocks each kind of referencing record", () => {
    expect(deleteBlockReason({ authoredTestCount: 2, submissionCount: 0 })).toBe("Has created tests.");
    expect(deleteBlockReason({ authoredTestCount: 0, submissionCount: 1 })).toBe(
      "Has test submissions."
    );
  });
});

describe("splitBulkTargets", () => {
  it("allows every id when nothing is protected", () => {
    const result = splitBulkTargets([ "s1", "s2" ], [student("s1"), student("s2")], {
      action: "deactivate",
      actingUserId: "admin-1",
      activeAdminCount: 2,
    });

    expect(result.allowed).toEqual([ "s1", "s2" ]);
    expect(result.blocked).toEqual([]);
  });

  it("reports ids that no longer exist", () => {
    const result = splitBulkTargets([ "gone" ], [], {
      action: "delete",
      actingUserId: "admin-1",
      activeAdminCount: 2,
    });

    expect(result.blocked).toEqual([{ id: "gone", reason: NOT_FOUND_REASON }]);
  });

  it("protects the acting admin from deactivate and delete, but not activate", () => {
    const candidates = [admin("me")];

    const deactivate = splitBulkTargets([ "me" ], candidates, {
      action: "deactivate",
      actingUserId: "me",
      activeAdminCount: 2,
    });
    expect(deactivate.blocked).toEqual([{ id: "me", reason: SELF_REASON }]);

    const remove = splitBulkTargets([ "me" ], candidates, {
      action: "delete",
      actingUserId: "me",
      activeAdminCount: 2,
    });
    expect(remove.blocked).toHaveLength(1);

    const activate = splitBulkTargets([ "me" ], candidates, {
      action: "activate",
      actingUserId: "me",
      activeAdminCount: 2,
    });
    expect(activate.allowed).toEqual([ "me" ]);
  });

  it("refuses to empty the admin bench", () => {
    const result = splitBulkTargets([ "a1" ], [admin("a1")], {
      action: "deactivate",
      actingUserId: "other",
      activeAdminCount: 1,
    });

    expect(result.allowed).toEqual([]);
    expect(result.blocked).toEqual([{ id: "a1", reason: LAST_ADMIN_REASON }]);
  });

  it("still allows demoting an admin while other admins remain", () => {
    const result = splitBulkTargets([ "a1" ], [admin("a1")], {
      action: "deactivate",
      actingUserId: "other",
      activeAdminCount: 2,
    });

    expect(result.allowed).toEqual([ "a1" ]);
  });

  it("ignores the admin bench for activate", () => {
    const result = splitBulkTargets([ "a1" ], [admin("a1", false)], {
      action: "activate",
      actingUserId: "other",
      activeAdminCount: 0,
    });

    expect(result.allowed).toEqual([ "a1" ]);
  });

  it("blocks deletions with a supplied reason", () => {
    const result = splitBulkTargets([ "s1", "s2" ], [student("s1"), student("s2")], {
      action: "delete",
      actingUserId: "admin-1",
      activeAdminCount: 2,
      deleteReasons: { s1: "Has test submissions." },
    });

    expect(result.allowed).toEqual([ "s2" ]);
    expect(result.blocked).toEqual([{ id: "s1", reason: "Has test submissions." }]);
  });

  it("caps a batch at the documented maximum", () => {
    expect(MAX_BULK_IDS).toBe(200);
  });
});
