/**
 * Admin operation guards
 *
 * Pure rules shared by the single-user and bulk admin routes, kept free of
 * Prisma/session imports so the same rule can never drift between the two
 * paths — and so the rules themselves are unit-testable.
 */

/** Hard cap on how many accounts one bulk request may touch. */
export const MAX_BULK_IDS = 200;

export type BulkAction = "activate" | "deactivate" | "delete";

/** The minimum a guard needs to know about a target account. */
export interface GuardCandidate {
  id: string;
  role: string;
  isActive: boolean;
}

export interface BlockedTarget {
  id: string;
  reason: string;
}

export interface BulkGuardResult {
  allowed: string[];
  blocked: BlockedTarget[];
}

export const SELF_REASON = "You cannot change your own account here.";
export const LAST_ADMIN_REASON = "This is the last active administrator.";
export const NOT_FOUND_REASON = "Account not found.";

export interface DeleteTargetCounts {
  authoredTestCount: number;
  submissionCount: number;
}

/**
 * Why an account cannot be hard-deleted, or null when it can.
 *
 * Tests and submissions reference the user without a cascade, so a hard delete
 * would hit a foreign key error. Deactivating is the safe action instead.
 * (Special-access rows do cascade, and profiles/assignments cascade with them.)
 */
export function deleteBlockReason(counts: DeleteTargetCounts): string | null {
  if (counts.authoredTestCount > 0) return "Has created tests.";
  if (counts.submissionCount > 0) return "Has test submissions.";
  return null;
}

/**
 * Decide which of `ids` a bulk action may touch.
 *
 * Rules:
 *  - an account that no longer exists is reported, never silently dropped;
 *  - the acting admin can never deactivate or delete their own account;
 *  - an action can never remove the last active administrator;
 *  - when deleting, accounts with existing records are blocked with the reason
 *    supplied by the caller (`deleteReasons`).
 */
export function splitBulkTargets(
  ids: string[],
  candidates: GuardCandidate[],
  opts: {
    action: BulkAction;
    actingUserId: string;
    activeAdminCount: number;
    deleteReasons?: Record<string, string>;
  }
): BulkGuardResult {
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const allowed: string[] = [];
  const blocked: BlockedTarget[] = [];

  const removesAdmin = opts.action !== "activate";
  const targetedActiveAdmins = ids.filter((id) => {
    const c = byId.get(id);
    return Boolean(c && c.role === "ADMIN" && c.isActive);
  }).length;
  const wouldEmptyAdminBench =
    removesAdmin && opts.activeAdminCount - targetedActiveAdmins <= 0;

  for (const id of ids) {
    const candidate = byId.get(id);

    if (!candidate) {
      blocked.push({ id, reason: NOT_FOUND_REASON });
      continue;
    }
    if (removesAdmin && id === opts.actingUserId) {
      blocked.push({ id, reason: SELF_REASON });
      continue;
    }
    if (wouldEmptyAdminBench && candidate.role === "ADMIN" && candidate.isActive) {
      blocked.push({ id, reason: LAST_ADMIN_REASON });
      continue;
    }
    if (opts.action === "delete" && opts.deleteReasons?.[id]) {
      blocked.push({ id, reason: opts.deleteReasons[id] });
      continue;
    }

    allowed.push(id);
  }

  return { allowed, blocked };
}
