# UI Refresh — Phase 4 (Admin) changelog

Branch: **`feat/ui-neobrutalist`** (live line). Admin commits are cherry-picked onto
`feat/ui-refresh` at the end, so this changelog lives on both.

Phase 4 is the last role surface. Unlike Phases 1–3 it is **not only a refresh**: admin was
create-only in most places, so this phase also completes the missing capabilities that were
agreed during the planning interview.

**Deviation from the plan's commit rule:** the plan says one commit per phase
(`ui(phase-N): …`). Phase 4 is split into ~9 small commits at the user's request so work lands
incrementally. Messages use `feat(admin): …` / `docs(phase4): …` / `test(admin): …`.

**Status: implemented.** Nine commits on `feat/ui-neobrutalist`
(`69626b7` docs → `4579e68` tests). Everything in §§2–4 is in the tree; §6 records what was
verified and, separately, what could not be.

---

## 1. Decisions taken before building

| # | Decision | Choice |
|---|---|---|
| 1 | Where Phase 4 lands | `feat/ui-neobrutalist`, cherry-picked back to `feat/ui-refresh` at the end |
| 2 | List tooling | Split by data size: users = server-side; assignments = client-side; sections/subjects = client-side, no pagination |
| 3 | Scope | Refresh **plus** heavier capability package (see §2) |
| 4 | Password reset | Deterministic: LRN for students, `username@123` for staff; forces change; shown once |
| 5 | Section detail | New `/admin/sections/[id]` with Students + Assignments tabs; one `PATCH /api/admin/users/[id]` owns section/LRN changes |
| 6 | Bulk actions | activate / deactivate / delete + CSV export of the full filtered set, with rails |
| 7 | Form pattern | Keep `useState` + `fetch`; add `hooks/use-form-submit.ts`, dual-mode dialogs, shared zod schemas, additive `fields` in error payloads |
| 8 | Copy | Approved plain-language mapping (§5) |
| 9 | Verification | 9 commits, pure-logic unit tests, e2e specs updated + run, reseed after |

---

## 2. Capability scope

### Users
- [x] `PATCH /api/admin/users/[id]` — name/email for all; `sectionId` + `lrn` for students;
      `role` when supplied. `sectionId: null` removes a student from their section.
- [x] `POST /api/admin/users/[id]/reset-password` — LRN (student) / `username@123` (staff),
      `mustChangePassword: true`, returns the temporary password once.
- [x] Activate / deactivate (`isActive`) — new; previously unreachable in the UI.
- [x] `POST /api/admin/users/bulk` — `{ ids, action: "activate" | "deactivate" | "delete" }`.
- [x] `GET /api/admin/users/export` — CSV of **all** rows matching current filters (read in
      batches of 500 server-side, so it is not capped at one page).
- [x] `GET /api/admin/users` gains optional `status` (`active` | `must-change-password`),
      `section` (`unassigned` or an id) and `sort` (`created-desc` | `created-asc` | `name`).
      Payload unchanged; additive only. Search now also matches LRN (see §8).

### Sections
- [x] `PATCH /api/admin/sections/[id]` — name, adviser, grade level, school year, `isActive`.
- [x] Activate / deactivate instead of delete (a section with students/tests cannot be safely
      hard-deleted).
- [x] New `/admin/sections/[id]` detail page:
      header (name, adviser, grade level, school year, student count, Edit, Activate/Deactivate),
      **Students** tab (roster: name, username, LRN, must-change-password; per-row move /
      remove; `Add students` dialog that searches students with **no** section),
      **Assignments** tab (this section's teacher/subject rows).
- [x] `GET /api/admin/sections/[id]` — details + students + assignments; teachers may only open
      sections they are assigned to.

### Subjects
- [x] `PATCH /api/admin/subjects/[id]` — name, code, description, `isActive`.
- [x] Activate / deactivate.

### Teacher assignments
- [x] `PATCH /api/admin/teacher-assignments/[id]` — change teacher / section / subject.
      (Before this the only way to fix one was delete + recreate.)

### Roster import
- [x] `GET /api/admin/roster-upload/template` — blank `.xlsx` with the required headers, an
      instructions sheet, and two example rows that import cleanly.
- [x] `GET /api/admin/roster-upload/credentials` — wires the existing, previously-dead
      `generateCredentialsSummaryExcel`. Lists only students who still must change their
      password (their LRN is the password); optionally limited to one section.

### Admin dashboard
- [x] `PageHeader` + `StatCard` primitives instead of hand-rolled cards.
- [x] "Needs attention" panel: students with no section, accounts still on a temporary password,
      deactivated student/teacher accounts — each linking to the users list pre-filtered.
      When nothing is outstanding the panel says so rather than showing empty cards.

---

## 3. Bulk rails (non-negotiable)

- [x] Self-protection: the signed-in admin cannot deactivate or delete their own account,
      singly or in a batch (their id comes back in `blocked`).
- [x] Last-admin guard: refuse anything that would leave zero active admins; the id is reported
      in `blocked` with a reason.
- [x] Delete safety: users with existing tests or submissions are **skipped**, not hard-deleted
      (an FK violation would 500 today). Both the single `DELETE` and the bulk route report why.
- [x] Cap: max 200 ids per request.
- [x] Selection is page-scoped and clears on filter/page change; header checkbox = select page.
- [x] All bulk actions go through `ConfirmDialog`; delete is hazard-striped.
- [x] Result toast summarises counts, including skipped.

Guardrails live in `src/lib/admin-guards.ts` as pure functions (`splitBulkTargets`,
`deleteBlockReason`) so the single and bulk paths cannot drift apart, and both are unit-tested.

---

## 4. UI / structure

- [x] New `src/components/admin/<feature>/` modules + `src/hooks/use-form-submit.ts` — no page
      over ~250 lines (the largest is 281 → then 162 once actions moved into a hook).
- [x] Users page (370 lines) split: `UserFilters`, `UsersTable`, `BulkActionsBar`,
      `UserFormDialog`, `ResetPasswordDialog`, `use-admin-users`, `use-user-actions`, `types`.
- [x] Teacher assignments page (317 lines) split the same way.
- [x] All four lists get the Phase 3 filter-panel treatment via one shared
      `components/admin/ListToolbar.tsx` (`border-2 bg-card p-4` + result count + reset).
- [x] Adopt admin-wide: `PageHeader`, `StatCard`, `EmptyState`, `FormField`/`FormSection`/
      `CheckboxField`, `Alert`, `ConfirmDialog` + `useConfirm`, `sonner` toasts.
- [x] Replace the 2 remaining native `confirm()` calls — the admin surface now has none.

### Accessibility fixes (from plan §9)
- [x] Roster dropzone was a `<div onClick>` → real `<button>` with `focus-visible` and
      drag-and-drop layered on top.
- [x] `aria-label` on icon-only row action buttons ("Actions for …", "Move or remove …",
      "Select …").
- [x] Fixed widths (`w-40`, `w-36`, `max-w-md`) made fluid on small screens.
- [x] Each user-list filter label is associated with its select (`htmlFor`/`id`).

---

## 5. Copy (approved)

Banned words: *provision(ing), cohorts, faculty, taxonomy, jurisdiction, catalogue, disciplines,
batch, credentials, academic courses, pregenerated*. "Section" stays the noun (nav, teacher
tables and the DB all use it).

| Where | Now | After |
|---|---|---|
| admin dashboard h1 | Institutional Administration | Admin dashboard |
| admin dashboard sub | Manage system rosters, academic taxonomy, teacher assignments, and institutional access. | Manage student accounts, sections, subjects, and which teachers handle what. |
| sections card | Active class cohorts | Sections with students |
| subjects card | Course catalogue items | Subjects you offer |
| dashboard card | Batch Roster Provisioning | Import students |
| assignments card | …within their jurisdiction. | …This is what lets them create tests and grade students. |
| roster h1 | Roster Batch Provisioning | Import students |
| roster result | Import Complete: {n} Account(s) Provisioned | Import finished — {n} accounts created |
| roster column | Created (Must Change PW) | Must change password |
| roster button | Upload Class Roster | Upload class list |
| roster progress | Processing Roster... | Importing… |
| subjects h1 / sub | Academic Subjects / Manage course disciplines and curriculum offerings. | Subjects / The subjects your school offers. |
| sections h1 / sub | Class Sections / Configure academic grade cohorts and adviser assignments. | Sections / Set up your sections and who advises each one. |
| sections dialog | Add a class cohort for student roster assignment. | Add a class section. |
| assignments h1 | Faculty Assignments | Teacher assignments |
| assignments sub | Map faculty teachers to authorized sections and academic subjects. | Choose which teacher handles which class and subject. |
| assignments dialog | Assign Teacher to Section & Subject | Assign a teacher |
| assignments submit | Confirm Assignment | Assign teacher |
| assignments empty | No teacher assignments found. Click "Assign Teacher" to link faculty to sections. | No assignments yet. Use "Assign teacher" to give a teacher a class and subject. |
| users h1 | User Accounts | User accounts |
| users dialog | Create a single user. Newly created accounts will be required to change their password on first login. | New accounts must change their password the first time they sign in. |
| users column | Must Change PW | Must change password |
| users label | Email (Optional) | Email (optional) |

Extra strings written during the build, in the same voice: "Choose a class list file",
"Download template", "Download passwords", "Needs attention", "Nothing needs attention right
now.", "Place students", "Only needed if the school contacts them by email."

---

## 6. Verification

- [x] `npx tsc --noEmit` clean after every step
- [x] `ESLINT_USE_FLAT_CONFIG=false npx next lint --dir src` clean after every step
- [x] `npx vitest run` green before every commit — **159 tests, 18 files** (was 109/13)
- [x] `npm run build` green after the API steps and at phase end
- [x] New unit tests: `lib/admin-guards.ts` (self, last-admin, delete-skip), CSV builder
      (quoting, column order, LRN/section fallbacks), the four new `update*` zod schemas, the
      admin query/DTO/export mapping, and URL-filter reading
- [x] e2e specs updated + new spec written: `admin-roster.spec.ts` + `auth-guard.spec.ts`
      rewritten for the new copy, new `e2e/admin-users.spec.ts`
- [ ] e2e **run to green** — could not be done in this environment, see §8
- [x] `npm run db:seed` re-run to restore the dev DB after API smoke tests (the seed uses
      `update: {}`, so the two fields the smoke tests edited were also set back by hand)
- [x] Cherry-picked onto `feat/ui-refresh` — 11 commits, `0195eaa`…`694797b`. Verified there
      too: tsc, lint, 159 unit tests and a production build with all 13 admin API routes and 6
      admin pages emitted (see §8.13 for the one thing the cherry-pick needed)

### What was actually verified

- Unit: 159 passing.
- Build: green, with every new route emitted (`/api/admin/users/[id]`,
  `/reset-password`, `/bulk`, `/export`, `/api/admin/sections/[id]`,
  `/api/admin/subjects/[id]`, `/api/admin/teacher-assignments/[id]`,
  `/api/admin/roster-upload/template`, `/credentials`).
- API smoke tests against a running dev server, as admin:
  list filters (`role`, `status=must-change-password`, `section=unassigned`, `sort=name`,
  `search` by name and by LRN); `PATCH` name/email/section/LRN; role change both directions
  (STUDENT → TEACHER → STUDENT) including the "student needs an LRN" refusal and the profile
  swap; self-deactivation and self-role-change refusals; reset password returning the LRN;
  bulk deactivate with the acting admin reported as blocked; bulk delete of a user with
  submissions and of a user with authored tests both refused with a reason; bulk delete of a
  clean account succeeding; single `DELETE` refused with a readable 409; CSV export with the
  correct headers, BOM and filename; template download; and the downloaded template
  re-imported through `POST /api/admin/roster-upload` to create two students.
- Copy: the dashboard and every admin page were fetched and checked for the new headings and
  for the absence of the banned words.

---

## 7. Out of scope

Routes' existing verbs/payloads/error contracts (only additive params and new routes), Prisma
schema, auth, grading, transmutation, audit log, hard delete for sections/subjects.

---

## 8. Deviations

Recorded as they happened, rather than retrofitted:

1. **Bulk response shape.** Planned as `deleted` + `skipped: [{ id, reason }]`; shipped as
   `{ action, affected, blocked: [{ id, reason }] }` because one route serves all three actions
   and `affected` reads correctly for activate/deactivate too.
2. **Delete blockers.** Special-access rows cascade on delete, so `deleteBlockReason` blocks on
   **authored tests and submissions only**. Blocking on special accesses would have refused
   legitimate deletions.
3. **Role changes are guarded.** Planned as "role only when supplied". Implemented with guards:
   blocked for your own account; blocked when the account has submissions (its history would be
   orphaned); `STUDENT` requires a 12-digit LRN; the old profile row is deleted and the new one
   created. Deleting a `TeacherProfile` cascades its assignments, which is stated in the
   dialog copy.
4. **Reset password refuses self-service.** An admin cannot reset their own password through the
   admin API (400 with "Use your own password settings"), because the deterministic password
   would be `username@123`.
5. **Section detail moves use one control, not two.** Planned as per-row `Move to…` plus
   `Remove from section`; shipped as a single per-row section select whose options are "Remove
   from section" and "Move to X", since two controls would have expressed the same field. Each
   choice confirms first.
6. **Section detail's Assignments tab is read-only.** It lists the section's teacher/subject
   rows; editing stays on `/admin/teacher-assignments` (the assignments module), so there is
   one place to change an assignment.
7. **Users list search also matches LRN.** Not in the original plan, but advisers look students
   up by LRN and the create dialog already told them they could. Additive to the same `search`
   param; covered by a unit test.
8. **CSV export caps at 20,000 rows** (batched 500 at a time) to bound memory on a small box.
   Well beyond any realistic school.
9. **Dashboard "needs attention" has a third case** — deactivated student/teacher accounts —
   in addition to the two planned.
10. **Sections/subjects are never hard-deleted**, as agreed: deactivate only. The rows stay in
    the DB because tests, students and assignments point at them.
11. **e2e could not be run to green here, and the specs are therefore unproven.** Details:
    - Playwright 1.64.1 (resolved from `^1.52.0`) expects browser build 1248; the machine's
      cache held 1228, and no firefox build at all. Chromium 1248 was downloaded to the user
      cache (~120 MB). Firefox was not downloaded.
    - With chromium available, the suite got as far as 5 passing / 4 failing. The failures were
      all logins: the login form stayed disabled in its "submitting" state and never navigated.
      The same login succeeds in ~0.5 s when called directly with `curl` against the same dev
      server, so this reads as a resource/runner problem in this low-RAM environment rather
      than a product bug — but it is **not** proven either way, and nothing here should be
      treated as e2e-verified.
    - While chasing it, one real product-facing issue was found and fixed: every spec logged in
      with `input[placeholder="Enter your username or email"]`, a placeholder the Phase 1 copy
      pass had renamed to "Enter your username". All six spec files now locate the fields by
      accessible label instead.
    - Action for a healthy machine: `npx playwright install`, then
      `npx playwright test e2e/admin*.spec.ts e2e/auth-guard.spec.ts --workers=1`
      (serial because parallel workers contend for the SQLite dev DB), then `npm run db:seed`.
12. **Dev-DB mutations were undone.** API smoke testing edited a section's adviser and a
    subject's description, and the seed uses `update: {}` so it does not restore them; both were
    set back to their seed values by hand, and `npm run db:seed` was re-run.
13. **Two new spots deliberately avoid the reskin's custom utilities.** The cherry-pick lands the
    admin work on `feat/ui-refresh`, which does not carry the neobrutalist skin, so the
    bulk-selection label and the dashboard's "Needs attention" heading spell out
    `font-mono uppercase tracking-[0.14em]` instead of calling `label-mono` — that utility only
    exists on `feat/ui-neobrutalist`, and the class would have silently done nothing on the
    other branch. Both branches were then verified independently (tsc, lint, 159 tests, build).
