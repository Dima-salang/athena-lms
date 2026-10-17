# UI Refresh — Phase 4 (Admin) changelog

Branch: **`feat/ui-neobrutalist`** (live line). Admin commits are cherry-picked onto
`feat/ui-refresh` at the end, so this changelog lives on both.

Phase 4 is the last role surface. Unlike Phases 1–3 it is **not only a refresh**: admin was
create-only in most places, so this phase also completes the missing capabilities that were
agreed during the planning interview.

**Deviation from the plan's commit rule:** the plan says one commit per phase
(`ui(phase-N): …`). Phase 4 is split into ~9 small commits at the user's request so work lands
incrementally. Messages use `feat(admin): …` / `docs(phase4): …` / `chore(admin): …`.

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
- [ ] `PATCH /api/admin/users/[id]` — role-aware: name/email for all; `sectionId` + `lrn` for
      students; `role` only when supplied. Clears `sectionId` when explicitly `null`.
- [ ] `POST /api/admin/users/[id]/reset-password` — LRN (student) / `username@123` (staff),
      `mustChangePassword: true`, returns the temporary password once.
- [ ] Activate / deactivate (`isActive`) — new; previously unreachable in the UI.
- [ ] `POST /api/admin/users/bulk` — `{ ids, action: "activate" | "deactivate" | "delete" }`.
- [ ] `GET /api/admin/users/export` — CSV of **all** rows matching current filters (paged
      server-side, not capped at 100).
- [ ] `GET /api/admin/users` gains optional `status` (`active` | `must-change-password`),
      `section` (`unassigned` or an id) and `sort` (`created-desc` | `created-asc` | `name`) params.
      Payload unchanged; additive only.

### Sections
- [ ] `PATCH /api/admin/sections/[id]` — name, adviser, grade level, school year, `isActive`.
- [ ] Activate / deactivate instead of delete (a section with students/tests cannot be safely
      hard-deleted).
- [ ] New `/admin/sections/[id]` detail page:
      header (name, adviser, grade level, school year, student count, Edit, Activate/Deactivate),
      **Students** tab (roster: name, username, LRN, must-change-password; per-row `Move to…`
      and `Remove from section`; `Add students` dialog that searches students with **no** section),
      **Assignments** tab (this section's teacher/subject rows, reusing the assignments module).

### Subjects
- [ ] `PATCH /api/admin/subjects/[id]` — name, code, description, `isActive`.
- [ ] Activate / deactivate.

### Teacher assignments
- [ ] `PATCH /api/admin/teacher-assignments/[id]` — change teacher / section / subject.
      (Today the only way to fix one is delete + recreate.)

### Roster import
- [ ] `GET /api/admin/roster-upload/template` — blank `.xlsx` with the required headers.
- [ ] `GET /api/admin/roster-upload/credentials` — wires the existing, currently-dead
      `generateCredentialsSummaryExcel`.

### Admin dashboard
- [ ] `PageHeader` + `StatCard` primitives instead of hand-rolled cards.
- [ ] "Needs attention" panel: accounts still on a temporary password, students with no section —
      each linking to the users list pre-filtered.

---

## 3. Bulk rails (non-negotiable)

- [ ] Self-protection: the signed-in admin cannot deactivate or delete their own account.
- [ ] Last-admin guard: refuse anything that would leave zero active admins; report blocked ids.
- [ ] Delete safety: users with existing submissions/tests are **skipped**, not hard-deleted
      (an FK violation would 500 today). Response reports `deleted` + `skipped: [{ id, reason }]`.
- [ ] Cap: max 200 ids per request.
- [ ] Selection is page-scoped and clears on filter/page change; header checkbox = select page.
- [ ] All bulk actions go through `ConfirmDialog`; delete is hazard-striped.
- [ ] Result toast summarises counts, including skipped.

---

## 4. UI / structure

- [ ] New `src/components/admin/<feature>/` modules + `src/hooks/` — no page over ~250 lines.
- [ ] Users page (370 lines today) split: filters, table, bulk bar, form dialog, reset dialog.
- [ ] Teacher assignments page (317 lines today) split the same way.
- [ ] All four lists get the Phase 3 filter-panel treatment (`border-2 bg-card p-4` + result
      count + reset) so admin stops looking like a different app.
- [ ] Adopt admin-wide: `PageHeader`, `StatCard`, `EmptyState`, `StatusBadge`, `FormField`/
      `FormSection`, `Alert`, `ConfirmDialog` + `useConfirm`, `sonner` toasts.
- [ ] Replace the 2 remaining native `confirm()` calls
      (`admin/users/page.tsx:120`, `admin/teacher-assignments/page.tsx:138`).

### Accessibility fixes (from plan §9)
- [ ] Roster dropzone is a `<div onClick>` → real `<button>` with `focus-visible`.
- [ ] `aria-label` on icon-only row action buttons.
- [ ] Fixed widths (`w-40`, `w-36`, `max-w-md`) made fluid on small screens.

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

Expected e2e churn: `admin-roster.spec.ts` asserts `/Roster Upload/i` and `/Class Sections/i`;
both headings are being renamed → spec updated in the same phase.

---

## 6. Verification

- [ ] `npx tsc --noEmit` clean after every step
- [ ] `ESLINT_USE_FLAT_CONFIG=false npx next lint --dir src` clean after every step
- [ ] `npx vitest run` green before every commit
- [ ] `npm run build` green after the API steps and at phase end
- [ ] New unit tests: `lib/admin-guards.ts` (self, last-admin, delete-skip), CSV builder
      (quoting, column order, LRN/section fallbacks), the four new `update*` zod schemas
- [ ] e2e: `admin-roster.spec.ts` + `auth-guard.spec.ts` updated, new `e2e/admin-users.spec.ts`
      (search + pagination, bulk deactivate + toast, reset-password dialog, section move-student),
      then `npx playwright test e2e/admin*.spec.ts e2e/auth-guard.spec.ts` and
      `npm run db:seed` to restore the dev DB
- [ ] Cherry-pick the admin commits onto `feat/ui-refresh`

---

## 7. Out of scope

Routes' existing verbs/payloads/error contracts (only additive params and new routes), Prisma
schema, auth, grading, transmutation, audit log, hard delete for sections/subjects.

---

## 8. Deviations

_(filled in as the phase proceeds)_
